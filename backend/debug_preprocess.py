import cv2
import numpy as np
import sys
sys.path.insert(0, '.')
from app.vision.ocr_wrapper import _ocr_single_pass

img = cv2.imread('/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/.user_uploaded/uploaded_media_1788100120194.png')
scale = 7.7

# Strategy 1: Heavy CLAHE + Unsharp Mask
print("=== Strategy 1: CLAHE + Unsharp Mask ===")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
clahe = cv2.createCLAHE(clipLimit=6.0, tileGridSize=(4, 4))
enhanced = clahe.apply(gray)
# Unsharp mask: blur then subtract
blurred = cv2.GaussianBlur(enhanced, (0, 0), 3)
sharpened = cv2.addWeighted(enhanced, 2.0, blurred, -1.0, 0)
bgr1 = cv2.cvtColor(sharpened, cv2.COLOR_GRAY2BGR)
tp1, bx1 = _ocr_single_pass(bgr1, scale, 2.5, "s1")
for b in bx1:
    print(f"  conf={b['confidence']:.2f} | {b['text']}")

# Strategy 2: Morphological closing to thicken thin dot-matrix strokes
print("\n=== Strategy 2: CLAHE + Morph Close + Sharpen ===")
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
closed = cv2.morphologyEx(enhanced, cv2.MORPH_CLOSE, kernel)
blurred2 = cv2.GaussianBlur(closed, (0, 0), 2)
sharpened2 = cv2.addWeighted(closed, 1.5, blurred2, -0.5, 0)
bgr2 = cv2.cvtColor(sharpened2, cv2.COLOR_GRAY2BGR)
tp2, bx2 = _ocr_single_pass(bgr2, scale, 2.5, "s2")
for b in bx2:
    print(f"  conf={b['confidence']:.2f} | {b['text']}")

# Strategy 3: Invert colors (light text on dark might confuse OCR)
print("\n=== Strategy 3: CLAHE + Invert ===")
inverted = cv2.bitwise_not(enhanced)
bgr3 = cv2.cvtColor(inverted, cv2.COLOR_GRAY2BGR)
tp3, bx3 = _ocr_single_pass(bgr3, scale, 2.5, "s3")
for b in bx3:
    print(f"  conf={b['confidence']:.2f} | {b['text']}")

# Strategy 4: OTSU threshold
print("\n=== Strategy 4: CLAHE + OTSU ===")
_, otsu = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
bgr4 = cv2.cvtColor(otsu, cv2.COLOR_GRAY2BGR)
tp4, bx4 = _ocr_single_pass(bgr4, scale, 2.5, "s4")
for b in bx4:
    print(f"  conf={b['confidence']:.2f} | {b['text']}")
