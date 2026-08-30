with open("backend/app/core/rules_engine.py", "r") as f:
    lines = f.readlines()

# The logic for best_match is:
# best_match = max(net_qty_matches, key=lambda x: x["measured_height_mm"])
# We need to change this to:
# first try to find one that passes clearance. If multiple pass, pick the largest.
# If none pass, pick the largest.

