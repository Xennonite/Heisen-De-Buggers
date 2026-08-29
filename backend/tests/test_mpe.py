import pytest
from app.api.physical_test import calculate_first_schedule_mpe, get_fifth_schedule_max_defective_units, perform_mpe_check
from app.models.schemas import MpeTestRequest


def test_first_schedule_mpe_piecewise_formula():
    # Table-I limits
    assert calculate_first_schedule_mpe(50.0) == 4.5    # 9% of 50 = 4.5
    assert calculate_first_schedule_mpe(100.0) == 4.5   # fixed 4.5
    assert calculate_first_schedule_mpe(200.0) == 9.0   # 4.5% of 200 = 9.0
    assert calculate_first_schedule_mpe(300.0) == 9.0   # fixed 9.0
    assert calculate_first_schedule_mpe(500.0) == 15.0  # 3% of 500 = 15.0
    assert calculate_first_schedule_mpe(1000.0) == 15.0 # fixed 15.0
    assert calculate_first_schedule_mpe(5000.0) == 75.0 # 1.5% of 5000 = 75.0


def test_fifth_schedule_max_defective():
    assert get_fifth_schedule_max_defective_units(20) == 1
    assert get_fifth_schedule_max_defective_units(32) == 2
    assert get_fifth_schedule_max_defective_units(80) == 5


def test_mpe_batch_pass():
    # 32 units of 100g biscuits, all >= 99g with mean >= 100g
    weights = [100.0 + (i % 2) for i in range(32)]
    req = MpeTestRequest(
        declared_quantity=100.0,
        unit="g",
        sample_weights=weights,
        tare_weight=0.0,
    )
    res = perform_mpe_check(req)
    assert res.overall_mpe_compliant is True
    assert res.defective_units_count == 0
    assert res.compounding_fee_section_36_2 == 0


def test_mpe_batch_fail_zero_tolerance():
    # Declared 100g, MPE is 4.5g -> 2x MPE = 9.0g -> Zero tol limit is < 91g.
    # One unit is 85g (deficiency 15g > 9g)
    weights = [100.0] * 31 + [85.0]
    req = MpeTestRequest(
        declared_quantity=100.0,
        unit="g",
        sample_weights=weights,
        tare_weight=0.0,
    )
    res = perform_mpe_check(req)
    assert res.overall_mpe_compliant is False
    assert res.zero_tolerance_violations_count == 1
    assert res.compounding_fee_section_36_2 == 50000
