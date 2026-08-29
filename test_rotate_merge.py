import cv2
import pytesseract
import sys

img_path = sys.argv[1]
img = cv2.imread(img_path)
h, w = img.shape[:2]

data_normal = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
normal_text = [t for t, c in zip(data_normal['text'], data_normal['conf']) if t.strip() and int(c) > 20]

# Rotate 90 counter-clockwise
img_ccw = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
data_ccw = pytesseract.image_to_data(img_ccw, output_type=pytesseract.Output.DICT)
ccw_text = [t for t, c in zip(data_ccw['text'], data_ccw['conf']) if t.strip() and int(c) > 20]

print("Normal text count:", len(normal_text))
print("CCW text count:", len(ccw_text))
print("CCW Sample:", ccw_text[:10])

