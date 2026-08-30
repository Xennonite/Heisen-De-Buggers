with open("backend/app/vision/clearance_mask.py", "r") as f:
    code = f.read()

code = code.replace(
    "horizontal_dist = 1.5 * h if container_type == 'cylindrical' else 2.0 * h",
    "horizontal_dist = 1.0 * h if container_type == 'cylindrical' else 2.0 * h"
)

with open("backend/app/vision/clearance_mask.py", "w") as f:
    f.write(code)
