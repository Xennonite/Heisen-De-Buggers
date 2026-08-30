import cv2
import numpy as np
import sys
sys.path.insert(0, '.')
from app.vision.ocr_wrapper import _ocr_single_pass

img = cv2.imread('/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/.user_uploaded/uploaded_media_1788100120194.png')
scale = 5.0

# Try multiple CLAHE strengths
for clip in [4.0, 6.0, 10.0]:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=clip, tileGridSize=(4, 4))
    enhanced = clahe.apply(gray)
    denoised = cv2.bilateralFilter(enhanced, 9, 75, 75)
    # Try with inverted as well (dark text on light bg -> light text on dark bg)
    binary = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 8)
    bgr = cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)
    tp, bx = _ocr_single_pass(bgr, scale, 2.5, f"clip{clip}")
    print(f"CLAHE clip={clip}: {len(bx)} boxes")
    for b in bx:
        print(f"  conf={b['confidence']} | {b['text']}")
    print()

# Try with just heavy CLAHE + no binarization
print("=== Heavy CLAHE only (no binarization) ===")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
clahe = cv2.createCLAHE(clipLimit=10.0, tileGridSize=(4, 4))
enhanced = clahe.apply(gray)
bgr2 = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)
tp, bx = _ocr_single_pass(bgr2, scale, 2.5, "clahe_only")
print(f"Heavy CLAHE only: {len(bx)} boxes")
for b in bx:
    print(f"  conf={b['confidence']} | {b['text']}")
