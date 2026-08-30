import cv2
import numpy as np
from PIL import Image, ImageOps
from typing import Tuple, Optional, Dict, Any


def load_image_with_exif(image_path: str) -> np.ndarray:
    """
    Loads an image file, automatically rectifying orientation using EXIF metadata.
    Returns standard OpenCV BGR numpy array.
    """
    pil_img = Image.open(image_path)
    pil_img = ImageOps.exif_transpose(pil_img)
    rgb_img = np.array(pil_img.convert("RGB"))
    return cv2.cvtColor(rgb_img, cv2.COLOR_RGB2BGR)


def get_product_pixel_height(image: np.ndarray) -> int:
    """
    Analyzes the image to find the true pixel height of the object,
    ignoring solid white (or near-white) backgrounds common in e-commerce renders.
    Returns the pixel height of the object. If detection fails, returns the full image height.
    """
    img_h, img_w = image.shape[:2]
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Threshold: Object becomes white (255), background (if >240) becomes black (0)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    
    coords = cv2.findNonZero(thresh)
    if coords is None:
        return img_h
        
    x, y, w, h = cv2.boundingRect(coords)
    
    # Ignore if it thinks the object is tiny (e.g. less than 10% of image height)
    if h < (img_h * 0.1):
        return img_h
        
    return h
import cv2
import numpy as np

def enhance_text_contrast(image: np.ndarray) -> np.ndarray:
    """
    Enhances contrast of the image to help PaddleOCR detect faint or low-contrast text.
    Uses CLAHE on the luminance channel.
    """
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel, a, b = cv2.split(lab)
    
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    cl = clahe.apply(l_channel)
    
    limg = cv2.merge((cl, a, b))
    enhanced_img = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    return enhanced_img
def order_points(pts: np.ndarray) -> np.ndarray:
    """
    Orders 4 coordinates as: top-left, top-right, bottom-right, bottom-left.
    """
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]

    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect


def four_point_transform(image: np.ndarray, pts: np.ndarray) -> np.ndarray:
    """
    Performs OpenCV 4-point perspective transform to rectify tilted package labels.
    """
    rect = order_points(pts)
    (tl, tr, br, bl) = rect

    # Compute width of new image
    width_a = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    width_b = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
    max_width = max(int(width_a), int(width_b))

    # Compute height of new image
    height_a = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    height_b = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
    max_height = max(int(height_a), int(height_b))

    if max_width < 10 or max_height < 10:
        return image

    dst = np.array(
        [[0, 0], [max_width - 1, 0], [max_width - 1, max_height - 1], [0, max_height - 1]],
        dtype="float32",
    )

    m = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(image, m, (max_width, max_height))
    return warped


def auto_rectify_label(image: np.ndarray) -> Tuple[np.ndarray, bool]:
    """
    Attempts automatic label boundary detection and perspective rectification.
    Returns (rectified_image, was_transformed).
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edged = cv2.Canny(blurred, 50, 150)

    contours, _ = cv2.findContours(edged.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]

    for c in contours:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)
        # If contour has 4 points and covers at least 25% of image area
        if len(approx) == 4:
            area = cv2.contourArea(approx)
            img_area = image.shape[0] * image.shape[1]
            if area > 0.25 * img_area:
                pts = approx.reshape(4, 2)
                rectified = four_point_transform(image, pts)
                return rectified, True

    return image, False


def calculate_contrast_ratio(bgr_crop: np.ndarray) -> Dict[str, Any]:
    """
    Evaluates Text-to-Background Luminance Delta-E and Contrast Ratio.
    Rule 7 / General readability requirement.
    """
    if bgr_crop is None or bgr_crop.size == 0:
        return {"contrast_ratio": 1.0, "is_readable": True, "delta_luminance": 0.0}

    gray = cv2.cvtColor(bgr_crop, cv2.COLOR_BGR2GRAY)
    min_val, max_val, _, _ = cv2.minMaxLoc(gray)

    # Relative luminance estimation
    l1 = (max_val + 0.05) / 255.0
    l2 = (min_val + 0.05) / 255.0
    ratio = (l1 + 0.05) / (l2 + 0.05) if l2 > 0 else 21.0

    return {
        "contrast_ratio": round(float(ratio), 2),
        "is_readable": ratio >= 3.0,
        "delta_luminance": round(float(max_val - min_val), 1),
    }
