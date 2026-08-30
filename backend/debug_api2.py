import requests

url = "http://localhost:8000/api/v1/audit/scan"
image_paths = ['/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/.user_uploaded/uploaded_media_1788100120194.png']
files = [('files', ('bottom.png', open(p, 'rb'), 'image/png')) for p in image_paths]
data = {'package_height_mm': 130, 'package_width_mm': 65, 'container_type': 'cylindrical', 'category': 'general'}

response = requests.post(url, files=files, data=data)
res = response.json()

print(f"Boxes:")
for b in res['surfaces'][0]['bounding_boxes']:
    print(f"  {b['text']} -> {b['label']}")

print(f"\nMRP present: {res.get('mrp', {}).get('present')}")
print(f"MRP price: {res.get('mrp', {}).get('declared_price')}")
print(f"MFG date: {res.get('declarations', {}).get('mfg_date', {}).get('text')}")
