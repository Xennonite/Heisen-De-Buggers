import cv2
import pytesseract
import sys

img_path = sys.argv[1]
img = cv2.imread(img_path)

# Rotate 90 degrees clockwise
img_cw = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)

# Run OCR
data_cw = pytesseract.image_to_data(img_cw, config="--psm 11", output_type=pytesseract.Output.DICT)
text_cw = [t for t, c in zip(data_cw['text'], data_cw['conf']) if t.strip() and int(c) > 30]
print("90 CLOCKWISE:", text_cw)

# Rotate 90 degrees counter-clockwise
img_ccw = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)

# Run OCR
data_ccw = pytesseract.image_to_data(img_ccw, config="--psm 11", output_type=pytesseract.Output.DICT)
text_ccw = [t for t, c in zip(data_ccw['text'], data_ccw['conf']) if t.strip() and int(c) > 30]
print("90 COUNTER-CLOCKWISE:", text_ccw)
