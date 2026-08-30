import requests
import json

url = "http://localhost:8000/api/v1/audit/scan"
files = {'files': open('/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/.user_uploaded/uploaded_media_0_1788093507900.png', 'rb')}
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
    for b in boxes[:10]:
        print(f"{b['label']} | {b['status']} | {b['text']}")
else:
    print("Error:", response.status_code, response.text)
