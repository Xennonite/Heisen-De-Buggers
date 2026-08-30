import requests
import json

url = "http://localhost:8000/api/v1/audit/scan"
files = [
    ('files', ('bottom.png', open('/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/.user_uploaded/uploaded_media_1788100120194.png', 'rb'), 'image/png'))
]
data = {
    'package_height_mm': 130,
    'package_width_mm': 65,
    'container_type': 'cylindrical',
    'category': 'general'
}
response = requests.post(url, files=files, data=data)
if response.status_code == 200:
    res = response.json()
    boxes = res['surfaces'][0]['bounding_boxes']
    print(f"Total boxes detected: {len(boxes)}")
    for b in boxes:
        print(f"  {b['label']} | {b['status']} | conf={b['confidence']} | {b['text']}")
    
    print(f"\nExtracted text snippet: {res.get('surfaces', [{}])[0].get('bounding_boxes', [{}])[0].get('text', 'N/A')}")
else:
    print(f"Error {response.status_code}: {response.text}")
