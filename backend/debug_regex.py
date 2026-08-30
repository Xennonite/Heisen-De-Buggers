import re
text = "MFU29072616:17 EAP29/8404 Pk1/m"
# Extreme fallback
mrp_match = re.search(r"([0-9]{1,4})[\s]*(?:/-|/-|/=|/ -|404\b)", text, re.IGNORECASE)
print(f"Fallback MRP match: {mrp_match.group(1) if mrp_match else None}")

# MFG date
patterns = [
    r"(?:mfd|mfg|mfu|pkd|packed|pkg|date of mfg|date of packing)[:\s\.\-]*([0-9]{1,2}[\/\-\.]?[0-9]{1,2}[\/\-\.]?[0-9]{2,4}|[A-Za-z]{3,9}[\s\-\/][0-9]{2,4})",
    r"\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2}", # DD/MM/YY fallback
]
for p in patterns:
    m = re.search(p, text, re.IGNORECASE)
    print(f"MFG pattern {p}: {m.group(0) if m else None}")
