import cv2
import numpy as np

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
