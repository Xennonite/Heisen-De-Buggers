import re

text = "TOTAL SUGARS 10.6 g"

mrp_match = re.search(r"\b(?:Rs\.?|₹|INR)[\s]*([0-9]{1,4}(?:\.[0-9]{1,2})?)(?:/-)?", text, re.IGNORECASE)
if mrp_match:
    print(f"Match: {mrp_match.group(0)} -> {mrp_match.group(1)}")
else:
    print("No match")
