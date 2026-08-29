import cv2
import pytesseract
import sys

img_path = sys.argv[1]
img = cv2.imread(img_path)

# Look at the right side of the image (e.g. rightmost 25%)
h, w = img.shape[:2]
crop = img[:, int(w*0.7):]

# Rotate 90 degrees counter-clockwise to make it readable
crop_ccw = cv2.rotate(crop, cv2.ROTATE_90_COUNTERCLOCKWISE)

cv2.imwrite("scratch/crop.png", crop_ccw)

# Binarize
gray = cv2.cvtColor(crop_ccw, cv2.COLOR_BGR2GRAY)
_, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
cv2.imwrite("scratch/crop_thresh.png", thresh)

data = pytesseract.image_to_data(crop_ccw, config="--psm 11", output_type=pytesseract.Output.DICT)
text = [t for t, c in zip(data['text'], data['conf']) if t.strip() and int(c) > 10]
print("CROP CCW PSM 11:", text)

data2 = pytesseract.image_to_data(thresh, config="--psm 11", output_type=pytesseract.Output.DICT)
text2 = [t for t, c in zip(data2['text'], data2['conf']) if t.strip() and int(c) > 10]
print("CROP CCW THRESH PSM 11:", text2)

# Try PSM 6
data3 = pytesseract.image_to_data(crop_ccw, config="--psm 6", output_type=pytesseract.Output.DICT)
text3 = [t for t, c in zip(data3['text'], data3['conf']) if t.strip() and int(c) > 10]
print("CROP CCW PSM 6:", text3)

