import cv2
from app.vision.ocr_wrapper import run_ocr
import logging

logging.basicConfig(level=logging.INFO)

img = cv2.imread('/home/binaryraptor/Projects/Heisen-De-Buggers/backend/uploads/MV-2026-F066C8_surface_6.jpeg')

text, boxes = run_ocr(img, is_metallic_surface=True)
print(f"Boxes found: {len(boxes)}")
for b in boxes:
    print(f"  {b['text']} | conf: {b['confidence']}")
