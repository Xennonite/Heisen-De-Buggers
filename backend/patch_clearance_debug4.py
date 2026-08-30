import requests

url = "http://localhost:8000/api/v1/audit/scan"
image_paths = [
    '/home/binaryraptor/Projects/Heisen-De-Buggers/backend/uploads/MV-2026-F066C8_surface_6.jpeg',
]
files = [('files', (f'img{i}.jpeg', open(p, 'rb'), 'image/jpeg')) for i, p in enumerate(image_paths)]
data = {'package_height_mm': 130, 'package_width_mm': 65, 'container_type': 'cylindrical', 'category': 'general'}

res = requests.post(url, files=files, data=data).json()

print(f"MRP present: {res.get('mrp', {}).get('present')}")
print(f"MRP price: {res.get('mrp', {}).get('declared_price')}")

print("\nBoxes:")
for i, s in enumerate(res['surfaces']):
    for b in s['bounding_boxes']:
        print(f"Surface {i} Box: text={b.get('text')}, label={b.get('label')}")
