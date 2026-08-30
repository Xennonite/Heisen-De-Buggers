import requests
import json

url = "http://localhost:8000/api/v1/audit/scan"

# Upload multiple images like the user did
image_paths = [
    '/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/.user_uploaded/uploaded_media_0_1788093507900.png',
    '/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/.user_uploaded/uploaded_media_1_1788093507900.png',
    '/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/.user_uploaded/uploaded_media_2_1788093507900.png',
    '/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/.user_uploaded/uploaded_media_1788100120194.png',
]
files = [('files', (f'img{i}.png', open(p, 'rb'), 'image/png')) for i, p in enumerate(image_paths)]
data = {
    'package_height_mm': 130,
    'package_width_mm': 65,
    'container_type': 'cylindrical',
    'category': 'general'
}
response = requests.post(url, files=files, data=data)
res = response.json()

print(f"Total surfaces: {len(res['surfaces'])}")
for i, s in enumerate(res['surfaces']):
    boxes = s.get('bounding_boxes', [])
    print(f"\nSurface {i}: {len(boxes)} boxes")
    for b in boxes[:3]:
        print(f"  {b.get('label')} | {b.get('status')} | {b.get('text')}")

# Check MRP and date detection
print(f"\nMRP present: {res.get('mrp', {}).get('present')}")
print(f"MRP price: {res.get('mrp', {}).get('declared_price')}")

# Check declarations
decl = res.get('declarations', {})
for k, v in decl.items():
    if isinstance(v, dict):
        print(f"{k}: present={v.get('present')}, text={v.get('text', v.get('code'))}")
