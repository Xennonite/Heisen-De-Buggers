import os
import cv2
import numpy as np
from PIL import Image
from typing import List, Dict, Any, Tuple, Optional
import math
import logging
from app.vision.preprocessor import enhance_text_contrast, enhance_metallic_surface

logger = logging.getLogger(__name__)

# Attempt pyzbar import
try:
    from pyzbar import pyzbar
    PYZBAR_AVAILABLE = True
except Exception:
    PYZBAR_AVAILABLE = False

try:
    from paddleocr import PaddleOCR
    # Initialize PaddleOCR globally to avoid loading weights on every request
    ocr_engine = PaddleOCR(
        use_angle_cls=True, 
        lang='en',
        det_limit_side_len=2560,
        det_db_thresh=0.3,
        det_db_unclip_ratio=1.6
    )
    PADDLE_AVAILABLE = True
except Exception as e:
    logger.error(f"Failed to load PaddleOCR: {e}")
    PADDLE_AVAILABLE = False


def decode_barcodes(image_bgr: np.ndarray) -> List[Dict[str, Any]]:
    """
    Decodes 1D/2D barcodes and QR codes from image using pyzbar.
    """
    barcodes = []
    if not PYZBAR_AVAILABLE or image_bgr is None:
        return barcodes

    try:
        rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        decoded = pyzbar.decode(rgb)
        for d in decoded:
            data = d.data.decode("utf-8", errors="ignore")
            b_type = d.type
            (x, y, w, h) = d.rect
            barcodes.append({
                "barcode_type": b_type,
                "data": data,
                "is_valid_gtin": len(data) in [8, 12, 13, 14] and data.isdigit(),
                "box_pixels": [int(x), int(y), int(w), int(h)],
            })
    except Exception as e:
        logger.error(f"Barcode decoding notice: {e}")

    return barcodes


def _ocr_single_pass(image_bgr: np.ndarray, scale_factor: float, required_font_height_mm: float, pass_label: str = "standard") -> Tuple[List[str], List[Dict[str, Any]]]:
    """
    Internal: runs one PaddleOCR pass on a single image and returns (text_parts, token_boxes).
    """
    token_boxes = []
    full_text_parts = []

    try:
        results = ocr_engine.ocr(image_bgr, cls=True)
        
        if not results or not results[0]:
            return full_text_parts, token_boxes
            
        for idx, res in enumerate(results[0]):
            if not res: continue
            
            box = res[0]  # [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
            text, conf = res[1]
            
            p1, p2, p3, p4 = box
            
            # Distance formula for rotated height (p1 to p4 is usually the short edge)
            h_px = math.dist(p1, p4)
            
            xs = [p[0] for p in box]
            ys = [p[1] for p in box]
            x_min, x_max = min(xs), max(xs)
            y_min, y_max = min(ys), max(ys)
            
            measured_h_mm = round(h_px / scale_factor, 2) if scale_factor > 0 else round(h_px * 0.1, 2)
            
            if text.strip() and conf > 0.4:
                token_boxes.append({
                    "id": f"tok_{pass_label}_{idx}",
                    "label": "Text",
                    "text": text.strip(),
                    "box_pixels": [int(x_min), int(y_min), int(x_max - x_min), int(y_max - y_min)],
                    "measured_height_mm": measured_h_mm,
                    "required_height_mm": required_font_height_mm,
                    "status": "INFO",
                    "confidence": round(float(conf), 2)
                })
                full_text_parts.append(text.strip())
                
    except Exception as e:
        logger.error(f"PaddleOCR {pass_label} pass error: {e}")
        
    return full_text_parts, token_boxes


def _compute_iou(box_a: list, box_b: list) -> float:
    """Compute Intersection-over-Union between two [x, y, w, h] boxes."""
    ax, ay, aw, ah = box_a
    bx, by, bw, bh = box_b
    
    x1 = max(ax, bx)
    y1 = max(ay, by)
    x2 = min(ax + aw, bx + bw)
    y2 = min(ay + ah, by + bh)
    
    inter = max(0, x2 - x1) * max(0, y2 - y1)
    area_a = aw * ah
    area_b = bw * bh
    union = area_a + area_b - inter
    
    return inter / union if union > 0 else 0.0


def run_ocr(
    image_bgr: np.ndarray,
    scale_factor: float = 1.0,
    required_font_height_mm: float = 2.5,
    is_metallic_surface: bool = False
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Runs PaddleOCR on the provided image. If is_metallic_surface is True,
    runs a dual-pass strategy: standard + aggressively preprocessed metallic pass,
    then merges results with IoU-based deduplication.
    """
    if not PADDLE_AVAILABLE:
        return "OCR Engine Offline", []

    logger.info(f"Running PaddleOCR extraction (metallic={is_metallic_surface})...")
    
    # Pass 1: Standard OCR on the contrast-enhanced image
    enhanced_img = enhance_text_contrast(image_bgr)
    text_parts_1, boxes_1 = _ocr_single_pass(enhanced_img, scale_factor, required_font_height_mm, "std")
    
    if not is_metallic_surface:
        full_text = " ".join(text_parts_1)
        return full_text, boxes_1
    
    # Pass 2: Metallic surface OCR (morph close + sharpen)
    metallic_img = enhance_metallic_surface(image_bgr)
    text_parts_2, boxes_2 = _ocr_single_pass(metallic_img, scale_factor, required_font_height_mm, "met")
    
    # Pass 3: Inverted grayscale OCR (CLAHE + invert — best for high-contrast stamped text)
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=6.0, tileGridSize=(4, 4))
    enhanced_gray = clahe.apply(gray)
    inverted = cv2.bitwise_not(enhanced_gray)
    inverted_bgr = cv2.cvtColor(inverted, cv2.COLOR_GRAY2BGR)
    text_parts_3, boxes_3 = _ocr_single_pass(inverted_bgr, scale_factor, required_font_height_mm, "inv")
    
    # Merge all passes: start with Pass 1, merge Pass 2 and Pass 3
    merged_boxes = list(boxes_1)
    merged_text_parts = list(text_parts_1)
    
    for extra_boxes in [boxes_2, boxes_3]:
        for b2 in extra_boxes:
            is_duplicate = False
            for b1 in merged_boxes:
                iou = _compute_iou(b1["box_pixels"], b2["box_pixels"])
                if iou > 0.3:
                    # Overlapping detection — keep whichever has higher confidence
                    if b2["confidence"] > b1["confidence"]:
                        idx_1 = merged_boxes.index(b1)
                        merged_boxes[idx_1] = b2
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                merged_boxes.append(b2)
    
    full_text = " ".join([b["text"] for b in merged_boxes])
    return full_text, merged_boxes


