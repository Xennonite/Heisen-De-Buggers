import cv2
import sys
sys.path.insert(0, '.')
from app.vision.ocr_wrapper import _ocr_single_pass, run_ocr
from app.vision.preprocessor import enhance_text_contrast, enhance_metallic_surface

img = cv2.imread('/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/.user_uploaded/uploaded_media_1788100120194.png')
scale = 5.0  # approximate

print("=== PASS 1: Standard (CLAHE) ===")
enhanced = enhance_text_contrast(img)
tp1, bx1 = _ocr_single_pass(enhanced, scale, 2.5, "std")
for b in bx1:
    print(f"  conf={b['confidence']} | {b['text']}")

print("\n=== PASS 2: Metallic (Aggressive) ===")
metallic = enhance_metallic_surface(img)
tp2, bx2 = _ocr_single_pass(metallic, scale, 2.5, "met")
for b in bx2:
    print(f"  conf={b['confidence']} | {b['text']}")

print(f"\nStandard found {len(bx1)} boxes, Metallic found {len(bx2)} boxes")
