from app.api.auth import require_role
from fastapi import Depends
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.models.schemas import MpeTestRequest, MpeTestResponse, MpeSampleItem

router = APIRouter(prefix="/test", tags=["Physical Testing & MPE"])


def calculate_first_schedule_mpe(q: float) -> float:
    """
    Computes Maximum Permissible Error (MPE) in g or ml for declared nominal quantity Q
    under First Schedule Table-I of LMPC Rules, 2011.
    """
    if q <= 0:
        return 0.0
    elif q <= 50.0:
        return round(0.09 * q, 2)  # 9% of Q
    elif q <= 100.0:
        return 4.5  # 4.5 g/ml fixed
    elif q <= 200.0:
        return round(0.045 * q, 2)  # 4.5% of Q
    elif q <= 300.0:
        return 9.0  # 9.0 g/ml fixed
    elif q <= 500.0:
        return round(0.03 * q, 2)  # 3.0% of Q
    elif q <= 1000.0:
        return 15.0  # 15.0 g/ml fixed
    elif q <= 10000.0:
        return round(0.015 * q, 2)  # 1.5% of Q
    elif q <= 15000.0:
        return 150.0  # 150.0 g/ml fixed
    else:
        return round(0.01 * q, 2)  # 1.0% of Q


def get_fifth_schedule_max_defective_units(sample_size: int) -> int:
    """
    Returns maximum allowable non-compliant units in sample under Fifth Schedule.
    """
    if sample_size <= 20:
        return 1
    elif sample_size <= 32:
        return 2
    elif sample_size <= 50:
        return 3
    elif sample_size <= 80:
        return 5
    elif sample_size <= 125:
        return 7
    else:
        return max(2, int(sample_size * 0.06))


@router.post("/mpe-check", response_model=MpeTestResponse)
def perform_mpe_check(payload: MpeTestRequest, user: dict = Depends(require_role(["LMPC_OFFICER", "ADMIN"]))) -> MpeTestResponse:
    """
    Performs physical sampling verification and Maximum Permissible Error (MPE) analysis
    under Rule 19(6) and the First Schedule of LMPC Rules, 2011.
    """
    q = payload.declared_quantity
    if q <= 0:
        raise HTTPException(status_code=400, detail="Declared quantity must be greater than 0.")

    weights = payload.sample_weights
    if not weights:
        raise HTTPException(status_code=400, detail="Sample weights list cannot be empty.")

    mpe_val = calculate_first_schedule_mpe(q)
    zero_tol_val = round(2.0 * mpe_val, 2)
    tare = payload.tare_weight

    sample_items: List[MpeSampleItem] = []
    total_net = 0.0
    defective_count = 0
    zero_tol_violations = 0

    for idx, raw_w in enumerate(weights, start=1):
        net_w = round(raw_w - tare, 2)
        total_net += net_w
        deficiency = round(q - net_w, 2)

        is_defective = deficiency > mpe_val
        is_zero_tol = deficiency > zero_tol_val

        if is_defective:
            defective_count += 1
        if is_zero_tol:
            zero_tol_violations += 1

        sample_items.append(MpeSampleItem(
            sample_id=idx,
            gross_weight_g=raw_w,
            tare_weight_g=tare,
            net_weight_g=net_w,
            deficiency_g=deficiency,
            is_defective=is_defective,
            is_zero_tolerance_violation=is_zero_tol,
        ))

    sample_count = len(weights)
    sample_mean = round(total_net / sample_count, 2)
    mean_pass = sample_mean >= q
    max_defective = get_fifth_schedule_max_defective_units(sample_count)
    defective_pass = defective_count <= max_defective
    zero_tol_pass = zero_tol_violations == 0

    overall_pass = mean_pass and defective_pass and zero_tol_pass
    compounding_fee = 0 if overall_pass else 50000

    verdict_msgs = []
    if not mean_pass:
        verdict_msgs.append(f"Sample Mean ({sample_mean}{payload.unit}) < Declared Nominal Quantity ({q}{payload.unit})")
    if not defective_pass:
        verdict_msgs.append(f"Defective count ({defective_count}) exceeds Fifth Schedule allowance ({max_defective})")
    if not zero_tol_pass:
        verdict_msgs.append(f"{zero_tol_violations} package(s) exceed Zero-Tolerance limit (> 2x MPE = {zero_tol_val}{payload.unit})")

    summary_verdict = "PASSED: Batch meets all First & Fifth Schedule requirements." if overall_pass else f"FAILED: {'; '.join(verdict_msgs)}"

    return MpeTestResponse(
        declared_quantity=q,
        unit=payload.unit,
        sample_count=sample_count,
        allowed_mpe_value=mpe_val,
        allowed_mpe_percentage=round((mpe_val / q) * 100.0, 2),
        sample_mean=sample_mean,
        mean_compliant=mean_pass,
        defective_units_count=defective_count,
        max_allowed_defective_units=max_defective,
        defective_count_compliant=defective_pass,
        zero_tolerance_limit=zero_tol_val,
        zero_tolerance_violations_count=zero_tol_violations,
        zero_tolerance_compliant=zero_tol_pass,
        overall_mpe_compliant=overall_pass,
        compounding_fee_section_36_2=compounding_fee,
        samples=sample_items,
        summary_verdict=summary_verdict,
    )
