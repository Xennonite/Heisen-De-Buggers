import requests

url = "http://localhost:8000/api/v1/audit/scan"
image_paths = [
    '/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/.user_uploaded/uploaded_media_0_1788108848880.png',
    '/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/.user_uploaded/uploaded_media_1_1788108848880.png'
]
files = [('files', (f'image_{i}.png', open(p, 'rb'), 'image/png')) for i, p in enumerate(image_paths)]
data = {'package_height_mm': 130, 'package_width_mm': 65, 'container_type': 'cylindrical', 'category': 'general'}

response = requests.post(url, files=files, data=data)
res = response.json()

print(f"Total surfaces: {len(res.get('surfaces', []))}")
for i, surface in enumerate(res.get('surfaces', [])):
    boxes = surface.get("bounding_boxes", [])
    print(f"\nSurface {i}: {len(boxes)} boxes")
    for b in boxes:
        print(f"  {b.get('label')} | {b.get('status')} | {b.get('text')}")

print(f"\nMRP present: {res.get('mrp', {}).get('present')}")
print(f"MRP price: {res.get('mrp', {}).get('declared_price')}")
print(f"Extracted Text: {repr(res.get('extracted_text'))}")
