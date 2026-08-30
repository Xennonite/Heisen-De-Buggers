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
