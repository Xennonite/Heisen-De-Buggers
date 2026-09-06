import os
import cv2
import numpy as np
from PIL import Image
from typing import List, Dict, Any, Tuple, Optional
from shapely.geometry import Polygon
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
    import os
    os.environ["FLAGS_use_mkldnn"] = "0"
    os.environ["FLAGS_enable_pir_api"] = "0"
    os.environ["FLAGS_enable_pir_in_executor"] = "0"
    os.environ["FLAGS_use_onednn"] = "0"
    from paddleocr import PaddleOCR
    # Initialize PaddleOCR globally to avoid loading weights on every request
    ocr_engine = PaddleOCR(
        use_angle_cls=True, 
        lang='en',
        
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
        results = ocr_engine.ocr(image_bgr)
        
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
    if not PADDLE_AVAILABLE:
        return "OCR Engine Offline", []

    logger.info(f"Running PaddleOCR extraction (metallic={is_metallic_surface})...")
    
    # Pass 1: Standard OCR on the contrast-enhanced image
    enhanced_img = enhance_text_contrast(image_bgr)
    text_parts_1, boxes_1 = _ocr_single_pass(enhanced_img, scale_factor, required_font_height_mm, "std")
    
    if not is_metallic_surface:
        full_text = " ".join(text_parts_1)
        return full_text, boxes_1
        
    # For metallic surfaces (dot matrix), high-res images cause OCR to fail because the dots are too sparse.
    # Downscale the image if it's too large so dots merge into solid strokes.
    h, w = image_bgr.shape[:2]
    max_dim = max(h, w)
    resize_ratio = 1.0
    if max_dim > 600:
        resize_ratio = 600.0 / max_dim
        metallic_bgr = cv2.resize(image_bgr, (0,0), fx=resize_ratio, fy=resize_ratio)
    else:
        metallic_bgr = image_bgr.copy()
        
    # Pass 2: Metallic surface OCR
    metallic_img = enhance_metallic_surface(metallic_bgr)
    text_parts_2, boxes_2 = _ocr_single_pass(metallic_img, scale_factor * resize_ratio, required_font_height_mm, "met")
    
    # Pass 3: Inverted grayscale OCR
    gray = cv2.cvtColor(metallic_bgr, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=6.0, tileGridSize=(4, 4))
    enhanced_gray = clahe.apply(gray)
    inverted = cv2.bitwise_not(enhanced_gray)
    inverted_bgr = cv2.cvtColor(inverted, cv2.COLOR_GRAY2BGR)
    text_parts_3, boxes_3 = _ocr_single_pass(inverted_bgr, scale_factor * resize_ratio, required_font_height_mm, "inv")
    
    # Scale boxes back up to original image space
    if resize_ratio != 1.0:
        for extra_boxes in [boxes_2, boxes_3]:
            for b in extra_boxes:
                b["box_pixels"] = [int(v / resize_ratio) for v in b["box_pixels"]]
                
    # Merge all passes
    merged_boxes = list(boxes_1)
    merged_text_parts = list(text_parts_1)
    
    for extra_boxes in [boxes_2, boxes_3]:
        for b in extra_boxes:
            px = b["box_pixels"]
            # Convert [x,y,w,h] to [[x,y], [x+w,y], [x+w,y+h], [x,y+h]] for shapely Polygon
            b_poly = Polygon([(px[0], px[1]), (px[0]+px[2], px[1]), (px[0]+px[2], px[1]+px[3]), (px[0], px[1]+px[3])]) if len(px) == 4 else None
            
            overlap = False
            for mb in merged_boxes:
                mpx = mb["box_pixels"]
                mb_poly = Polygon([(mpx[0], mpx[1]), (mpx[0]+mpx[2], mpx[1]), (mpx[0]+mpx[2], mpx[1]+mpx[3]), (mpx[0], mpx[1]+mpx[3])]) if len(mpx) == 4 else None
                if b_poly and mb_poly and b_poly.intersects(mb_poly):
                    iou = b_poly.intersection(mb_poly).area / b_poly.union(mb_poly).area
                    if iou > 0.3:
                        overlap = True
                        if b["confidence"] > mb["confidence"]:
                            mb["text"] = b["text"]
                            mb["confidence"] = b["confidence"]
                            mb["box_pixels"] = b["box_pixels"]
                        break
            if not overlap:
                merged_boxes.append(b)
                merged_text_parts.append(b["text"])
                
    # Generate combined text from the final merged boxes
    final_text = " ".join([b["text"] for b in merged_boxes])
    return final_text, merged_boxes

