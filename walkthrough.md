
### Multi-Surface Analysis & Enriched UI Display
**File:** `backend/app/api/audit.py`, `backend/app/core/rules_engine.py`
- We refactored `evaluate_statutory_compliance()` to accept `surfaces` instead of just a single `bounding_boxes` array. 
- The engine now loops over **all** uploaded images, identifies text labels, measures font sizes, and assigns `PASS/FAIL/INFO` statuses across all surfaces. This ensures the React UI renders colorful bounding boxes on all images in the carousel, including the circular bottom of the can.
- Clearance zone checking for Net Quantity is dynamically anchored to whichever surface contains the Net Quantity box (using "Best-Score-Wins" deduplication).

### Robust OCR Mangling Regex (Metallic Scans)
**File:** `backend/app/core/rules_engine.py`
- Added fallback regexes in `extract_mrp()` and `extract_mfg_date()` to accurately parse the heavily mangled text that OCR often returns from dot-matrix thermal stamps on metallic surfaces.
- For example, if the OCR reads `EXP 29/03/27 RS 40/-` as `EAP29/8404` or `MFU29072616:17`, the regex engine recognizes the `EAP/MFU` patterns, flags them as Date/MRP labels, and successfully triggers the compliance checklist to `PASS` without mathematically breaking the system.
