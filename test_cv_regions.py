import cv2
import sys

img_path = sys.argv[1]
image_bgr = cv2.imread(img_path)
img_h, img_w = image_bgr.shape[:2]

gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
grad = cv2.morphologyEx(gray, cv2.MORPH_GRADIENT, kernel)
_, thresh = cv2.threshold(grad, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

# Use a square kernel instead of horizontal to catch vertical text
rect_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
connected = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, rect_kernel)

contours, _ = cv2.findContours(connected, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
print(f"Found {len(contours)} raw contours")

for c in contours:
    x, y, w, h = cv2.boundingRect(c)
    if 10 < w < img_w * 0.95 and 10 < h < img_h * 0.95:
        # Relax aspect ratio to allow vertical boxes (w/h can be very small for vertical)
        if (w / h) > 0.1 and (h / w) > 0.1:
            print(f"Region: {x}, {y}, {w}, {h}")

