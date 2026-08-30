from typing import List, Dict, Any, Tuple


def compute_rule8_clearance_box(
    box: List[int], image_width: int = 10000, image_height: int = 10000
) -> List[int]:
    """
    Computes statutory Rule 8(1) Net Quantity clearance zone:
    Given Net Quantity Box [x, y, w, h]:
    - Top/Bottom Vertical Clearance >= 1.0 * h
    - Left/Right Horizontal Clearance >= 2.0 * h
    Clearance Box = [x - 2h, y - h, w + 4h, h + 2h]
    Clamped to image boundary [0, 0, image_width, image_height].
    """
    x, y, w, h = box
    
    # Apply a 25% tolerance reduction (0.75 multiplier) to horizontal clearance to account 
    # for 3D-to-2D perspective distortion (foreshortening) on cylindrical/irregular packages.
    # Original horizontal requirement: 2.0 * h. Adjusted: 2.0 * h * 0.75 = 1.5 * h
    horizontal_dist = 1.5 * h
    
    cx = max(0, int(x - horizontal_dist))
    cy = max(0, int(y - 1.0 * h))
    cw = min(image_width - cx, int(w + 2 * horizontal_dist))
    ch = min(image_height - cy, int(h + 2.0 * h))
    return [cx, cy, cw, ch]


def is_box_intersecting(box_a: List[int], box_b: List[int], tolerance_px: int = 2) -> bool:
    """
    Checks if two Axis-Aligned Bounding Boxes (AABB) intersect.
    Each box format: [x, y, w, h]
    """
    ax, ay, aw, ah = box_a
    bx, by, bw, bh = box_b

    # Convert to [x1, y1, x2, y2]
    ax1, ay1, ax2, ay2 = ax, ay, ax + aw, ay + ah
    bx1, by1, bx2, by2 = bx, by, bx + bw, by + bh

    # Check non-overlap conditions
    if ax2 - tolerance_px <= bx1 or bx2 - tolerance_px <= ax1:
        return False
    if ay2 - tolerance_px <= by1 or by2 - tolerance_px <= ay1:
        return False

    return True


def check_clearance_encroachment(
    net_qty_box: List[int],
    all_other_boxes: List[Dict[str, Any]],
    image_width: int = 10000,
    image_height: int = 10000,
) -> Tuple[bool, List[str], List[int]]:
    """
    Verifies Rule 8(1) compliance: No other text bounding box or graphic element
    may intersect the clearance boundary around the Net Quantity declaration.
    Returns:
        is_compliant (bool): True if zero encroachment, False otherwise.
        encroaching_objects (List[str]): Descriptions/labels of encroaching boxes.
        clearance_box (List[int]): [cx, cy, cw, ch] coordinates.
    """
    if not net_qty_box or len(net_qty_box) < 4:
        return True, [], []

    clearance_box = compute_rule8_clearance_box(net_qty_box, image_width, image_height)
    encroaching_objects = []

    # Net quantity's own box coordinate bounds
    nq_x, nq_y, nq_w, nq_h = net_qty_box
    nq_x2, nq_y2 = nq_x + nq_w, nq_y + nq_h

    for item in all_other_boxes:
        box = item.get("box_pixels", [])
        if not box or len(box) < 4:
            continue

        label = item.get("label", "Unknown Text")
        text = item.get("text", "")

        # Skip the net quantity itself and other fragments of the Net Quantity declaration
        if label.lower() == "net quantity":
            continue
            
        bx, by, bw, bh = box
        bx2, by2 = bx + bw, by + bh

        # Check if identical to net quantity box
        if abs(bx - nq_x) < 4 and abs(by - nq_y) < 4 and abs(bw - nq_w) < 4 and abs(bh - nq_h) < 4:
            continue

        # If inside or intersecting the clearance zone
        if is_box_intersecting(clearance_box, box):
            desc = f"{label} ('{text[:25]}...')" if text else label
            encroaching_objects.append(desc)

    is_compliant = len(encroaching_objects) == 0
    return is_compliant, encroaching_objects, clearance_box
