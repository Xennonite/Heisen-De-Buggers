import cv2
import sys
sys.path.insert(0, '.')
from app.vision.preprocessor import get_product_pixel_bounds, load_image_with_exif, auto_rectify_label
from app.vision.ocr_wrapper import run_ocr
from app.vision.spatial_scaler import compute_scale_factor

# Simulate the EXACT audit.py logic for this image
img = cv2.imread('/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/.user_uploaded/uploaded_media_1788100120194.png')
rectified, _ = auto_rectify_label(img)
img_h, img_w = rectified.shape[:2]

package_height_mm = 130.0
package_width_mm = 65.0
container_type = "cylindrical"

true_h, true_w = get_product_pixel_bounds(rectified)

img_aspect = img_w / img_h
phys_aspect = package_width_mm / package_height_mm

current_h_mm = package_height_mm
current_w_mm = package_width_mm

if (img_aspect > 1 and phys_aspect < 1) or (img_aspect < 1 and phys_aspect > 1):
    current_h_mm, current_w_mm = package_width_mm, package_height_mm
    print(f"Orientation SWAPPED: using h={current_h_mm}mm, w={current_w_mm}mm")
else:
    print(f"Orientation kept: h={current_h_mm}mm, w={current_w_mm}mm")

is_circular_face = False
if container_type == "cylindrical" and true_h > 0:
    product_aspect = true_w / true_h
    print(f"Product aspect: {product_aspect:.3f}")
    if 0.85 <= product_aspect <= 1.15:
        is_circular_face = True
        current_h_mm = current_w_mm
        print(f"CIRCULAR FACE DETECTED! Using diameter={current_h_mm}mm for scaling")

scale_factor = compute_scale_factor(package_height_px=true_h, package_height_mm=current_h_mm)
print(f"\nis_circular_face: {is_circular_face}")
print(f"scale_factor: {scale_factor:.3f} px/mm")
print(f"true_h={true_h}, true_w={true_w}")

# Now test OCR
text, boxes = run_ocr(rectified, scale_factor, 2.5, is_metallic_surface=is_circular_face)
print(f"\nOCR Results ({len(boxes)} boxes):")
for b in boxes:
    print(f"  {b['text']} (conf={b['confidence']})")
print(f"\nFull text: {text}")
