with open("backend/app/vision/ocr_wrapper.py", "r") as f:
    code = f.read()

code = code.replace("if max_dim > 1000:", "if max_dim > 600:")
code = code.replace("resize_ratio = 1000.0 / max_dim", "resize_ratio = 600.0 / max_dim")

with open("backend/app/vision/ocr_wrapper.py", "w") as f:
    f.write(code)
