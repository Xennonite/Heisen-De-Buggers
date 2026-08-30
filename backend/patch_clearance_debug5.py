import requests

url = "http://localhost:8000/api/v1/audit/scan"
image_paths = [
    '/home/binaryraptor/Projects/Heisen-De-Buggers/backend/uploads/MV-2026-F066C8_surface_6.jpeg',
]
files = [('files', (f'img0.jpeg', open(image_paths[0], 'rb'), 'image/jpeg'))]
data = {'package_height_mm': 130, 'package_width_mm': 65, 'container_type': 'cylindrical', 'category': 'general'}

res = requests.post(url, files=files, data=data).json()

print(f"Surface 0 Box Count: {len(res['surfaces'][0]['bounding_boxes'])}")
for b in res['surfaces'][0]['bounding_boxes']:
    print(b['text'], b['box_pixels'])

