import os
import uuid
import json
import shutil
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.config import UPLOAD_DIR
from app.storage.database import get_sync_db
from app.storage.models import ScanRecord
from app.models.schemas import ScanResponse, RuleChecklist
from app.vision.preprocessor import load_image_with_exif, auto_rectify_label
from app.vision.spatial_scaler import compute_scale_factor
from app.vision.ocr_wrapper import run_ocr, decode_barcodes
from app.core.rules_engine import evaluate_statutory_compliance

router = APIRouter(prefix="/audit", tags=["Audit & Scanning"])


@router.post("/scan", response_model=ScanResponse)
async def scan_package(
    files: List[UploadFile] = File(...),
    package_height_mm: float = Form(...),
    package_width_mm: float = Form(...),
    package_depth_mm: Optional[float] = Form(0.0),
    surface_area_cm2: Optional[float] = Form(0.0),
    container_type: str = Form("rectangular"),
    category: str = Form("general"),
    custom_notes: Optional[str] = Form(None),
    db: Session = Depends(get_sync_db),
):
    """
    Scans packaged commodity label(s), extracts spatial declarations, evaluates statutory metrology
    compliance under LMPC Rules 2011, and generates 0-100% compliance audit findings.
    Accepts multiple images. The first image is the PDP.
    """
    if package_height_mm <= 0 or package_width_mm <= 0:
        raise HTTPException(status_code=400, detail="Package height and width in mm must be strictly greater than zero.")
        
    if not files:
        raise HTTPException(status_code=400, detail="At least one image must be uploaded.")

    scan_id = f"MV-2026-{uuid.uuid4().hex[:6].upper()}"
    
    surfaces = []
    combined_extracted_text = ""
    barcodes_list = []
    
    pdp_img_w = 0
    pdp_img_h = 0
    pdp_token_boxes = []
    pdp_scale_factor = 1.0

    for idx, file in enumerate(files):
        # 1. Save uploaded file
        ext = os.path.splitext(file.filename)[1] or ".jpg"
        filename = f"{scan_id}_surface_{idx}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Load and preprocess image
        image_bgr = load_image_with_exif(file_path)
        if image_bgr is None:
            continue

        rectified_img, was_rectified = auto_rectify_label(image_bgr)
        img_h, img_w = rectified_img.shape[:2]

        # 3. Spatial scale factor (Calculate independently for each image to prevent zoom exaggeration)
        # Check aspect ratio for orientation swap on the current image
        img_aspect = img_w / img_h
        phys_aspect = package_width_mm / package_height_mm
        
        current_package_height_mm = package_height_mm
        current_package_width_mm = package_width_mm
        
        # If image is landscape but physical is portrait (or vice versa), swap dimensions for this image's math
        if (img_aspect > 1 and phys_aspect < 1) or (img_aspect < 1 and phys_aspect > 1):
            current_package_height_mm, current_package_width_mm = package_width_mm, package_height_mm
            
        scale_factor = compute_scale_factor(package_height_px=img_h, package_height_mm=current_package_height_mm)
        
        # Keep track of PDP (first image) dimensions for the rules engine
        if idx == 0:
            pdp_img_h, pdp_img_w = img_h, img_w
            # Permanently swap the global variables so the rules engine uses the correct orientation
            package_height_mm = current_package_height_mm
            package_width_mm = current_package_width_mm

        # 4. OCR Extraction
        extracted_text, token_boxes = run_ocr(
            image_bgr=rectified_img,
            scale_factor=scale_factor,
            required_font_height_mm=2.5,
        )
        
        combined_extracted_text += f" {extracted_text}"
        if idx == 0:
            pdp_token_boxes = token_boxes
            
        barcodes = decode_barcodes(rectified_img)
        barcodes_list.extend(barcodes)
        
        surfaces.append({
            "image_url": f"/uploads/{filename}",
            "original_dimensions": {"width": img_w, "height": img_h},
            "bounding_boxes": token_boxes
        })

    if not surfaces:
        raise HTTPException(status_code=400, detail="Failed to process uploaded images.")

    # 5. Evaluate Statutory Compliance Engine using combined text, but PDP spatial boxes
    audit_results = evaluate_statutory_compliance(
        extracted_text=combined_extracted_text,
        package_height_mm=package_height_mm,
        package_width_mm=package_width_mm,
        package_depth_mm=package_depth_mm or 0.0,
        surface_area_cm2=surface_area_cm2 or 0.0,
        container_type=container_type,
        category=category,
        bounding_boxes=pdp_token_boxes,
        image_width=pdp_img_w,
        image_height=pdp_img_h,
    )
    
    # Overwrite the PDP bounding boxes in surfaces[0] with the enriched boxes from the audit engine
    surfaces[0]["bounding_boxes"] = audit_results["bounding_boxes"]

    # 6. Construct Response
    response_data = {
        "scan_id": scan_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "package_height_mm": package_height_mm,
        "package_width_mm": package_width_mm,
        "package_depth_mm": package_depth_mm,
        "container_type": container_type,
        "category": category,
        "pdp_area_cm2": audit_results["pdp_area_cm2"],
        "required_font_height_mm": audit_results["required_font_height_mm"],
        "compliance_score": audit_results["compliance_score"],
        "status": audit_results["status"],
        "estimated_compounding_fine_inr": audit_results["estimated_compounding_fine_inr"],
        "rule_checklist": audit_results["rule_checklist"],
        "declarations": audit_results["declarations"],
        "net_quantity": audit_results["net_quantity"],
        "mrp": audit_results["mrp"],
        "clearance_zone": audit_results["clearance_zone"],
        "deceptive_terms": audit_results["deceptive_terms"],
        "units_compliance": audit_results["units_compliance"],
        "standard_pack_size": audit_results["standard_pack_size"],
        "violations": audit_results["violations"],
        "bounding_boxes": audit_results["bounding_boxes"],
        "barcodes": barcodes_list,
        "image_url": surfaces[0]["image_url"],
        "original_dimensions": surfaces[0]["original_dimensions"],
        "surfaces": surfaces
    }

    # 7. Persist to Database
    try:
        record = ScanRecord(
            scan_id=scan_id,
            timestamp=datetime.now(timezone.utc),
            package_height_mm=package_height_mm,
            package_width_mm=package_width_mm,
            package_depth_mm=package_depth_mm,
            container_type=container_type,
            category=category,
            pdp_area_cm2=audit_results["pdp_area_cm2"],
            required_font_height_mm=audit_results["required_font_height_mm"],
            compliance_score=audit_results["compliance_score"],
            status=audit_results["status"],
            estimated_compounding_fine_inr=audit_results["estimated_compounding_fine_inr"],
            image_filename=os.path.basename(surfaces[0]["image_url"]),
            audit_data_json=json.dumps(response_data),
        )
        db.add(record)
        db.commit()
    except Exception as e:
        print(f"DB persistence warning: {e}")

    return response_data


@router.get("/history", response_model=List[dict])
def get_scan_history(limit: int = 20, db: Session = Depends(get_sync_db)):
    """Retrieves previous inspection scan history records."""
    records = db.query(ScanRecord).order_by(ScanRecord.id.desc()).limit(limit).all()
    return [r.to_dict() for r in records]
