import re

def get_best_match(text):
    patterns = [
        r"(?:net\s*(?:quantity|qty|weight|wt|vol|volume))[\s\:\.\=]*([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z]+)",
        r"(?<!/)(?<!per\s)\b([0-9]+(?:\.[0-9]+)?)\s*(g|kg|ml|mL|L|litre|litres|gm|gms|kgs|meter|m|cm|mm|N|U|units|pieces|pcs)\b",
    ]
    
    matches = []
    # explicit matches
    for m in re.finditer(patterns[0], text, re.IGNORECASE):
        matches.append({
            "val": float(m.group(1)),
            "unit": m.group(2).strip(),
            "raw": m.group(0).strip(),
            "score": 100
        })
        
    # raw unit matches
    for m in re.finditer(patterns[1], text, re.IGNORECASE):
        val = float(m.group(1))
        unit = m.group(2).strip().lower()
        score = 0
        
        if val in [25, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 2000, 3000, 5000]:
            score += 50
            
        if unit in ['g', 'kg', 'ml', 'l', 'litre', 'litres', 'gm', 'gms', 'kgs']:
            score += 20
            
        matches.append({
            "val": val,
            "unit": m.group(2).strip(),
            "raw": m.group(0).strip(),
            "score": score
        })
        
    if not matches:
        return None
        
    best = max(matches, key=lambda x: x["score"])
    return best

print(get_best_match("CAFFEINE 6.7 mg/100ml rast 7.45mm 300ml"))
