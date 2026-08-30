def is_box_intersecting(box_a, box_b, tolerance_px=2):
    ax, ay, aw, ah = box_a
    bx, by, bw, bh = box_b
    ax1, ay1, ax2, ay2 = ax, ay, ax + aw, ay + ah
    bx1, by1, bx2, by2 = bx, by, bx + bw, by + bh
    
    if ax2 - tolerance_px <= bx1 or bx2 - tolerance_px <= ax1:
        return False
    if ay2 - tolerance_px <= by1 or by2 - tolerance_px <= ay1:
        return False
        
    return True

h = 65
box_300ml = [808, 2626, 256, h]
cy = int(2626 - 0.5 * h)
cx = int(808 - 1.5 * h)
cw = int(256 + 3.0 * h)
ch = int(h + 1.0 * h)
clearance_box = [cx, cy, cw, ch]

print("Clearance Box:", clearance_box)

box_recycle = [1180, 2666, 88, 48]
print("Surface 0 RECYCLE Intersection:", is_box_intersecting(clearance_box, box_recycle))

