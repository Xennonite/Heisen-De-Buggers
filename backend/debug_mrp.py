import re

# This is what the OCR extracts from the can bottom
text = "MFD29/07/2616:17 EA29/0329 400 Pk1/m"

# Current MRP extraction patterns
print("=== Current MRP regex ===")
m1 = re.search(r"\b(mrp|rs\.?|price)\b", text, re.IGNORECASE)
print(f"Match: {m1}")

# The OCR reads "RS 40/-" as "29 400" or similar
# We need to also look for patterns like "Rs" followed by a number
# And "40/-" patterns

# Let's also check what the full combined text looks like
combined = """a) SUGAR. CAFFEINE6.7 mg/100nO ICONTANS AFE ANOER ANS CAFFEINE FIF fex117.33m 300ml MFD29/07/2616:17 EA29/0329 400 Pk1/m"""

print(f"\n=== Combined text ===")
print(combined)

# Check if MRP regex can match
m2 = re.search(r"\b(mrp|rs\.?|price)\b", combined, re.IGNORECASE)
print(f"MRP match in combined: {m2}")

# Check MFD extraction
m3 = re.search(r"(?:mfd|mfg|manufactured|packed|packing)[\s\.\:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})", combined, re.IGNORECASE)
print(f"MFG date match: {m3.group(0) if m3 else None}")
