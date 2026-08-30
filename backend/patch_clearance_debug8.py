import cv2
from app.vision.ocr_wrapper import run_ocr
import logging

logging.basicConfig(level=logging.INFO)

img = cv2.imread('/home/binaryraptor/Projects/Heisen-De-Buggers/backend/uploads/MV-2026-F066C8_surface_6.jpeg')

for scale in [1.0, 0.5, 0.25]:
    print(f"\n--- Testing scale {scale} ---")
    resized = cv2.resize(img, (0,0), fx=scale, fy=scale)
    text, boxes = run_ocr(resized, is_metallic_surface=True)
    print(f"Boxes found: {len(boxes)}")
    for b in boxes:
        print(f"  {b['text']} | conf: {b['confidence']}")
