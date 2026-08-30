import cv2
import numpy as np

def auto_crop_background(image: np.ndarray) -> np.ndarray:
    """
    Automatically detects and crops out solid white (or near-white) backgrounds 
    commonly found in e-commerce digital renders.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Threshold: Object becomes white (255), background (if >240) becomes black (0)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    
    coords = cv2.findNonZero(thresh)
    if coords is None:
        return image
        
    x, y, w, h = cv2.boundingRect(coords)
    
    # Ignore if it thinks the object is tiny (e.g. less than 10% of image)
    img_h, img_w = image.shape[:2]
    if w < (img_w * 0.1) or h < (img_h * 0.1):
        return image
        
    pad = 5
    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(img_w, x + w + pad)
    y2 = min(img_h, y + h + pad)
    
    return image[y1:y2, x1:x2]
