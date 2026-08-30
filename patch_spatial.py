import re
import sys

with open("backend/app/core/rules_engine.py", "r") as f:
    content = f.read()

# 1. Update extract_net_quantity signature and logic
old_func = """def extract_net_quantity(text: str) -> Dict[str, Any]:
    \"\"\"
    Extracts Net Quantity value and unit under Rule 6(1)(c) & Rule 11.
    \"\"\"
    patterns = [
        r"(?:net\s*(?:quantity|qty|weight|wt|vol|volume))[\s\:\.\=]*([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z]+)",
        r"\b([0-9]+(?:\.[0-9]+)?)\s*(g|kg|ml|mL|L|litre|litres|gm|gms|kgs|meter|m|cm|mm|N|U|units|pieces|pcs)\b",
    ]

    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            val = float(m.group(1))
            unit = m.group(2).strip()
            return {
                "present": True,
                "declared_value": val,
                "unit": unit,
                "raw_text": m.group(0).strip(),
            }

    return {
        "present": False,
        "declared_value": None,
        "unit": None,
        "raw_text": None,
    }"""

new_func = """def extract_net_quantity(text: str, bounding_boxes: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    \"\"\"
    Extracts Net Quantity value and unit using spatial proximity matching and text fallback.
    \"\"\"
    if bounding_boxes is None:
        bounding_boxes = []

    # 1. Try Spatial Proximity First
    anchor_keywords = ["net quantity", "net qty", "net weight", "net wt", "net vol", "net volume"]
    anchor_box = None
    
    for b in bounding_boxes:
        b_text = b.get("text", "").lower()
        if any(kw in b_text for kw in anchor_keywords):
            anchor_box = b
            break
            
    if anchor_box:
        ax, ay, aw, ah = anchor_box.get("box_pixels", [0,0,10,10])
        acx, acy = ax + aw/2, ay + ah/2
        
        nearby_boxes = []
        for b in bounding_boxes:
            if b == anchor_box:
                continue
            bx, by, bw, bh = b.get("box_pixels", [0,0,10,10])
            bcx, bcy = bx + bw/2, by + bh/2
            
            dist = ((acx - bcx)**2 + (acy - bcy)**2)**0.5
            if dist < 8.0 * ah:
                nearby_boxes.append((dist, b))
                
        nearby_boxes.sort(key=lambda x: x[0])
        spatial_text = anchor_box.get("text", "") + " " + " ".join([b[1].get("text", "") for b in nearby_boxes[:4]])
        
        # Match number and optional unit
        m = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z]+)?", spatial_text)
        if m:
            val = float(m.group(1))
            unit = m.group(2).strip() if m.group(2) else None
            return {
                "present": True,
                "declared_value": val,
                "unit": unit,
                "raw_text": m.group(0).strip(),
                "spatial_match": True,
                "spatial_text": spatial_text
            }

    # 2. Fallback to full text regex
    patterns = [
        r"(?:net\s*(?:quantity|qty|weight|wt|vol|volume))[\s\:\.\=]*([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z]+)",
        r"\b([0-9]+(?:\.[0-9]+)?)\s*(g|kg|ml|mL|L|litre|litres|gm|gms|kgs|meter|m|cm|mm|N|U|units|pieces|pcs)\b",
    ]

    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            val = float(m.group(1))
            unit = m.group(2).strip()
            return {
                "present": True,
                "declared_value": val,
                "unit": unit,
                "raw_text": m.group(0).strip(),
                "spatial_match": False
            }

    return {
        "present": False,
        "declared_value": None,
        "unit": None,
        "raw_text": None,
        "spatial_match": False
    }"""

if old_func in content:
    content = content.replace(old_func, new_func)
    print("Patched extract_net_quantity!")
else:
    print("Could not find old extract_net_quantity")

# 3. Add the SI unit check
old_si_check = """    # SI unit compliance check
    non_si_found = []
    for pattern, std in NON_STANDARD_UNITS:
        if re.search(pattern, extracted_text, re.IGNORECASE):
            non_si_found.append(std)"""

new_si_check = """    # SI unit compliance check
    non_si_found = []
    for pattern, std in NON_STANDARD_UNITS:
        if re.search(pattern, extracted_text, re.IGNORECASE):
            non_si_found.append(std)
            
    # Strict Net Quantity SI Unit validation
    if net_qty_dict["present"]:
        u = net_qty_dict.get("unit")
        if u is None:
            non_si_found.append("Rule 13: Net Quantity has no unit.")
        elif u.lower() not in ["g", "kg", "ml", "l", "litre", "litres", "m", "cm", "mm", "n", "u"]:
            non_si_found.append(f"Rule 13: '{u}' is not a valid standard SI unit abbreviation.")"""

if old_si_check in content:
    content = content.replace(old_si_check, new_si_check)
    print("Patched SI unit check!")
else:
    print("Could not find old SI check")

with open("backend/app/core/rules_engine.py", "w") as f:
    f.write(content)

