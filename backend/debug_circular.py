import cv2
import sys
sys.path.insert(0, '.')
from app.vision.preprocessor import get_product_pixel_bounds, load_image_with_exif, auto_rectify_label

# Load the actual bottom image
img = cv2.imread('/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/.user_uploaded/uploaded_media_1788100120194.png')
rectified, _ = auto_rectify_label(img)
img_h, img_w = rectified.shape[:2]

true_h, true_w = get_product_pixel_bounds(rectified)

product_aspect = true_w / true_h if true_h > 0 else 0

print(f"Image dims: {img_w}x{img_h}")
print(f"Product bounds: h={true_h}, w={true_w}")
print(f"Product aspect ratio: {product_aspect:.3f}")
print(f"Is circular (0.85-1.15)? {0.85 <= product_aspect <= 1.15}")
print(f"Why it fails: get_product_pixel_bounds uses threshold>240 (white bg only)")
print(f"This image has a striped tablecloth, so product_bounds == full image!")
