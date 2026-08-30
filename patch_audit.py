with open("backend/app/api/audit.py", "r") as f:
    code = f.read()

code = code.replace("if 0.85 <= product_aspect <= 1.15:", "if 0.7 <= product_aspect <= 1.4:")

with open("backend/app/api/audit.py", "w") as f:
    f.write(code)
