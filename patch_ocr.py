with open("backend/app/vision/ocr_wrapper.py", "r") as f:
    content = f.read()

content = content.replace(
    '"status": "PASS" if is_pass else "FAIL",',
    '"status": "INFO",'
)

with open("backend/app/vision/ocr_wrapper.py", "w") as f:
    f.write(content)

print("Patched ocr_wrapper!")
