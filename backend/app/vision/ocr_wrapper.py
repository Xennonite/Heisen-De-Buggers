import os
import cv2
import numpy as np
from PIL import Image
from typing import List, Dict, Any, Tuple, Optional
import math
import logging
from app.vision.preprocessor import enhance_text_contrast

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


def run_ocr(
    image_bgr: np.ndarray,
    scale_factor: float = 1.0,
    required_font_height_mm: float = 2.5
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Runs PaddleOCR on the provided image and maps the bounding boxes 
    to the frontend format, converting pixel height to mm.
    """
    token_boxes = []
    full_text_parts = []

    if not PADDLE_AVAILABLE:
        return "OCR Engine Offline", []

    logger.info("Running PaddleOCR extraction...")
    try:
        # PaddleOCR predict for new versions
        results = ocr_engine.ocr(image_bgr, cls=True)
        
        if not results or not results[0]:
            return "", token_boxes
            
        for idx, res in enumerate(results[0]):
            if not res: continue
            
            box = res[0] # [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
            text, conf = res[1]
            
            p1, p2, p3, p4 = box
            
            # Distance formula for rotated height (p1 to p4 is usually the short edge)
            h_px = math.dist(p1, p4)
            
            xs = [p[0] for p in box]
            ys = [p[1] for p in box]
            x_min, x_max = min(xs), max(xs)
            y_min, y_max = min(ys), max(ys)
            
            measured_h_mm = round(h_px / scale_factor, 2) if scale_factor > 0 else round(h_px * 0.1, 2)
            is_pass = measured_h_mm >= required_font_height_mm
            
            if text.strip() and conf > 0.5:
                token_boxes.append({
                    "id": f"tok_{idx}",
                    "label": "Text",
                    "text": text.strip(),
                    "box_pixels": [int(x_min), int(y_min), int(x_max - x_min), int(y_max - y_min)],
                    "measured_height_mm": measured_h_mm,
                    "required_height_mm": required_font_height_mm,
                    "status": "PASS" if is_pass else "FAIL",
                    "confidence": round(float(conf), 2)
                })
                full_text_parts.append(text.strip())
                
    except Exception as e:
        logger.error(f"PaddleOCR processing error: {e}")
        
    full_text = " ".join(full_text_parts)
    return full_text, token_boxes
