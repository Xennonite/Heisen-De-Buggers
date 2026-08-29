import cv2
import pytesseract
import sys

img_path = sys.argv[1]
img = cv2.imread(img_path)

if img is None:
    print("Image not found")
    sys.exit(1)

# Default
data_default = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
text_default = [t for t, c in zip(data_default['text'], data_default['conf']) if t.strip() and int(c) > 20]
print("DEFAULT:", text_default)

# PSM 11 (Sparse)
data_11 = pytesseract.image_to_data(img, config="--psm 11", output_type=pytesseract.Output.DICT)
text_11 = [t for t, c in zip(data_11['text'], data_11['conf']) if t.strip() and int(c) > 20]
print("PSM 11:", text_11)

# PSM 12 (Sparse with OSD)
try:
    data_12 = pytesseract.image_to_data(img, config="--psm 12", output_type=pytesseract.Output.DICT)
    text_12 = [t for t, c in zip(data_12['text'], data_12['conf']) if t.strip() and int(c) > 20]
    print("PSM 12:", text_12)
except Exception as e:
    print("PSM 12 failed", e)

# Binarized
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
enhanced = clahe.apply(gray)
_, thresh = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

data_thresh = pytesseract.image_to_data(thresh, config="--psm 11", output_type=pytesseract.Output.DICT)
text_thresh = [t for t, c in zip(data_thresh['text'], data_thresh['conf']) if t.strip() and int(c) > 20]
print("THRESH PSM 11:", text_thresh)
