import cv2
import sys
import math
from paddleocr import PaddleOCR

img_path = sys.argv[1]
ocr = PaddleOCR(use_angle_cls=True, lang='en')
result = ocr.ocr(img_path, cls=True)

for res in result[0]:
    box = res[0] # [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
    text, conf = res[1]
    
    p1, p2, p3, p4 = box
    w_px = math.dist(p1, p2)
    h_px = math.dist(p1, p4)
    
    print(f"TEXT: {text} | CONF: {conf:.2f} | H: {h_px:.1f}")
