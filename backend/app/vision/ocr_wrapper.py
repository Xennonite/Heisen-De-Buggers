import os
import cv2
import numpy as np
from PIL import Image
from typing import List, Dict, Any, Tuple, Optional

# Attempt pyzbar import
try:
    from pyzbar import pyzbar
    PYZBAR_AVAILABLE = True
except Exception:
    PYZBAR_AVAILABLE = False

# Attempt pytesseract import
try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
except Exception:
    PYTESSERACT_AVAILABLE = False


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
        print(f"Barcode decoding notice: {e}")

    return barcodes


def extract_text_regions_cv(image_bgr: np.ndarray) -> List[Dict[str, Any]]:
    """
    Uses OpenCV Morphological Gradient and Contour Analysis to detect
    candidate text bounding boxes on the packaging surface.
    """
    regions = []
    if image_bgr is None or image_bgr.size == 0:
        return regions

    img_h, img_w = image_bgr.shape[:2]
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)

    # Morphological gradient to highlight high-frequency text edges
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    grad = cv2.morphologyEx(gray, cv2.MORPH_GRADIENT, kernel)

    # Binarize
    _, thresh = cv2.threshold(grad, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

    # Connect neighboring text characters horizontally
    rect_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 3))
    connected = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, rect_kernel)

    contours, _ = cv2.findContours(connected, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        # Filter noise and entire image bounds
        if 10 < w < img_w * 0.95 and 6 < h < img_h * 0.5:
            # Aspect ratio sanity check
            if (w / h) > 0.5:
                regions.append({
                    "box_pixels": [int(x), int(y), int(w), int(h)],
                    "area": w * h,
                })

    return regions


def run_ocr(
    image_bgr: np.ndarray,
    scale_factor: float = 1.0,
    required_font_height_mm: float = 2.5
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Extracts text tokens and 2D bounding boxes.
    Returns:
        full_text (str): Complete aggregated extracted text.
        token_boxes (List[Dict]): List of extracted tokens with bounding boxes and measurements.
    """
    token_boxes = []
    full_text = ""

    if image_bgr is None or image_bgr.size == 0:
        return full_text, token_boxes

    img_h, img_w = image_bgr.shape[:2]

    # 1. Try pytesseract if installed and working
    if PYTESSERACT_AVAILABLE:
        try:
            rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
            data = pytesseract.image_to_data(rgb, output_type=pytesseract.Output.DICT)
            n_boxes = len(data["text"])
            
            for i in range(n_boxes):
                text = data["text"][i].strip()
                conf = float(data["conf"][i])
                if text and conf > 20:
                    x = int(data["left"][i])
                    y = int(data["top"][i])
                    w = int(data["width"][i])
                    h = int(data["height"][i])

                    measured_h_mm = round(h / scale_factor, 2) if scale_factor > 0 else round(h * 0.1, 2)
                    is_pass = measured_h_mm >= required_font_height_mm

                    token_boxes.append({
                        "id": f"tok_{i}",
                        "label": "Text",
                        "text": text,
                        "box_pixels": [x, y, w, h],
                        "measured_height_mm": measured_h_mm,
                        "required_height_mm": required_font_height_mm,
                        "status": "PASS" if is_pass else "FAIL",
                        "confidence": round(conf / 100.0, 2),
                    })

            full_text = pytesseract.image_to_string(rgb)
        except Exception as e:
            print(f"Tesseract OCR fallback triggered: {e}")

    # 2. If no text was extracted (or pytesseract was not available), use smart spatial CV candidate generation
    if not token_boxes:
        cv_regions = extract_text_regions_cv(image_bgr)
        for i, reg in enumerate(cv_regions[:30]):
            x, y, w, h = reg["box_pixels"]
            measured_h_mm = round(h / scale_factor, 2) if scale_factor > 0 else 2.0
            is_pass = measured_h_mm >= required_font_height_mm
            token_boxes.append({
                "id": f"cv_box_{i}",
                "label": "Text Element",
                "text": "",
                "box_pixels": [x, y, w, h],
                "measured_height_mm": measured_h_mm,
                "required_height_mm": required_font_height_mm,
                "status": "PASS" if is_pass else "FAIL",
                "confidence": 0.85,
            })

    return full_text, token_boxes
