import json

# mock box for 300ml and RECYCL to see how they intersect
h = 100
w = 200
x = 500
y = 500

box_300ml = [x, y, w, h]
cy = int(y - 1.0 * h)
cx = int(x - 1.0 * h)
cw = int(w + 2.0 * h)
ch = int(h + 2.0 * h)
clearance_box = [cx, cy, cw, ch]

box_recycl = [x, y + h + 50, w, 50] # 50px below, which is < 1.0*h (100)

def is_box_intersecting(box_a, box_b):
    ax, ay, aw, ah = box_a
    bx, by, bw, bh = box_b
    ax1, ay1, ax2, ay2 = ax, ay, ax + aw, ay + ah
    bx1, by1, bx2, by2 = bx, by, bx + bw, by + bh
    if ax2 - 2 <= bx1 or bx2 - 2 <= ax1: return False
    if ay2 - 2 <= by1 or by2 - 2 <= ay1: return False
    return True

print(is_box_intersecting(clearance_box, box_recycl))
