import cv2
import sys
import numpy as np

img_path = sys.argv[1]
image_bgr = cv2.imread(img_path)
img_h, img_w = image_bgr.shape[:2]

gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
# enhance contrast
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
gray = clahe.apply(gray)

kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
grad = cv2.morphologyEx(gray, cv2.MORPH_GRADIENT, kernel)
_, thresh = cv2.threshold(grad, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

# Morph close to connect components. Use a small square to connect in both directions slightly.
rect_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 5))
connected = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, rect_kernel)

contours, _ = cv2.findContours(connected, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

valid_boxes = []
for c in contours:
    x, y, w, h = cv2.boundingRect(c)
    # Filter noise
    if w > 10 and h > 8 and w < img_w * 0.9 and h < img_h * 0.9:
        valid_boxes.append((x, y, w, h))

print(f"Found {len(valid_boxes)} valid boxes")
