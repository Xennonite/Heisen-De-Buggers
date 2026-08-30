plan = """
## Fixes for False Positive Date & Batch Classifications and Bounding Boxes

### 1. The Date & Batch Regex Hallucinations
The current Rules Engine contains an overly broad regex that assigns the label "Date & Batch" to text boxes. 
Specifically, it looks for the substring `ea` (which was meant to catch garbled versions of EXP, but instead matches "Tea", "please", "clean") and it looks for `\d{2}\d{2}\d{2}` without word boundaries (which matches any 6 consecutive digits inside 14-digit FSSAI license numbers and phone numbers).
- **Fix:** We will add word boundaries `\\b` to all acronyms in the regex (`\\b(mfd|mfg|mfu|exp|batch|use by|expiry|bn)\\b`). We will completely remove the dangerous `ea` fallback since it causes too many false positives on generic text.
- **Fix:** We will add word boundaries to the date digit regex so it only matches isolated 6-digit dates, not substrings of 14-digit numbers: `\\b\\d{2}[\\/\\-\\.]?\\d{2}[\\/\\-\\.]?\\d{2}\\b` or similar strict matching. We can also add `date` and `pkd` to the keywords list to properly catch "Date of Packaging".

### 2. Net Quantity Clearance Box Size (Rule 8)
Currently, the Statutory Metrology rules dictate that a horizontal clearance of `2x the height of the numeral` must be maintained. However, because the OCR engine often splits the prefix "Net Quantity" from the value "1.5 kg", drawing a 2x clearance box from the edges of "1.5 kg" causes the purple dashed box to visually engulf the words "Net Quantity" on the left side. While the backend ignores "Net Quantity" during the collision check (which is why it correctly returns PASS), the drawn box is visually confusing and looks too large to users.
- **Fix:** We will adjust the visual clearance mask computation in `clearance_mask.py` for generic packages so that the horizontal clearance is calculated as `1.0 * h` instead of `2.0 * h`. This will bring the drawn box tighter around the value, avoiding visual overlap with the prefix text, resolving the user's complaint while keeping the compliance engine accurate.

## Proposed Changes

### `backend/app/core/rules_engine.py`
#### [MODIFY] rules_engine.py
- Update the regex for "Date & Batch" to use word boundaries and remove generic substrings like `ea`, `eaf`, `eap`.
- Add `pkd` and `date` to the keyword match.

### `backend/app/vision/clearance_mask.py`
#### [MODIFY] clearance_mask.py
- Update the horizontal multiplier for general container types from `2.0 * h` to `1.0 * h` so the visual box is tighter and doesn't encroach on the prefix text.

## User Review Required
No major architectural breaking changes.

## Verification
- Test regex on sample strings ("TATA TEA", "Lic No 100140", "Date of Packaging", "MFD 10/12/23") to ensure correct classification.
"""
with open("/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/bounding_box_fixes_plan.md", "w") as f:
    f.write("---\nrequest_feedback: true\nuser_facing: true\n---\n" + plan)
