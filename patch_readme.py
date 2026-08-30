with open("README.md", "r") as f:
    text = f.read()

text = text.replace(
    "Hybrid OCR, barcode decoding, token spatial mapping",
    "PaddleOCR multi-surface text extraction, barcode decoding, token spatial mapping"
)

text = text.replace(
    "OpenCV (`opencv-python-headless`), NumPy, Pillow, Pyzbar",
    "PaddleOCR, OpenCV (`opencv-python-headless`), NumPy, Pillow, Pyzbar"
)

text = text.replace(
    "Python 3.10+ (Python 3.12 recommended, managed via `uv`)",
    "Python 3.10 (Specifically required for PaddleOCR compatibility, managed via `uv` or `venv`)"
)
text = text.replace("uv venv --python 3.12 backend/.venv", "uv venv --python 3.10 backend/.venv")


with open("README.md", "w") as f:
    f.write(text)
