import cv2
import sys
import math
from paddleocr import PaddleOCR

img_path = sys.argv[1]
ocr = PaddleOCR(use_textline_orientation=True, lang='en')
result = ocr.predict(img_path)

print(result)

