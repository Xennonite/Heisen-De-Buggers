with open("backend/app/vision/clearance_mask.py", "r") as f:
    code = f.read()

code = code.replace(
    "def compute_rule8_clearance_box(\n    box: List[int], image_width: int = 10000, image_height: int = 10000\n) -> List[int]:",
    "def compute_rule8_clearance_box(\n    box: List[int], image_width: int = 10000, image_height: int = 10000, container_type: str = 'rectangular'\n) -> List[int]:"
)

code = code.replace(
    "horizontal_dist = 1.5 * h",
    "horizontal_dist = 1.0 * h if container_type == 'cylindrical' else 2.0 * h"
)

code = code.replace(
    "def check_clearance_encroachment(\n    net_qty_box: List[int],\n    all_other_boxes: List[Dict[str, Any]],\n    image_width: int = 10000,\n    image_height: int = 10000,\n) -> Tuple[bool, List[str], List[int]]:",
    "def check_clearance_encroachment(\n    net_qty_box: List[int],\n    all_other_boxes: List[Dict[str, Any]],\n    image_width: int = 10000,\n    image_height: int = 10000,\n    container_type: str = 'rectangular'\n) -> Tuple[bool, List[str], List[int]]:"
)

code = code.replace(
    "clearance_box = compute_rule8_clearance_box(net_qty_box, image_width, image_height)",
    "clearance_box = compute_rule8_clearance_box(net_qty_box, image_width, image_height, container_type)"
)

with open("backend/app/vision/clearance_mask.py", "w") as f:
    f.write(code)
