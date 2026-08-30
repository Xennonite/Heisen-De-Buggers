import requests

url = "http://localhost:8000/api/v1/audit/scan"
image_paths = [
    '/home/binaryraptor/Projects/Heisen-De-Buggers/backend/uploads/MV-2026-F066C8_surface_0.jpeg',
    '/home/binaryraptor/Projects/Heisen-De-Buggers/backend/uploads/MV-2026-F066C8_surface_1.jpeg',
]
files = [('files', (f'img{i}.jpeg', open(p, 'rb'), 'image/jpeg')) for i, p in enumerate(image_paths)]
data = {'package_height_mm': 130, 'package_width_mm': 65, 'container_type': 'cylindrical', 'category': 'general'}

res = requests.post(url, files=files, data=data).json()

for i, s in enumerate(res['surfaces']):
    for b in s['bounding_boxes']:
        if b.get('label') == 'Net Quantity':
            print(f"Surface {i} Net Qty: status={b.get('status')}, height={b.get('measured_height_mm')}")
