---
title: Resolution Plan for Cylindrical Object OCR & Clearance Bugs
description: Addressing the "dogshit" bounding boxes, hallucinated MRP values, and Net Quantity clearance failures on cylindrical objects.
---

## Goal Description
You reported three critical issues when scanning the Coke can:
1. **Dogshit Bounding Box on Circular Face**: The UI drew a tiny, completely disconnected bounding box on the far left edge of the can bottom.
2. **Hallucinated MRP**: The engine reported an incorrect MRP (e.g., `Rs. 10.6`) instead of the correct `40/-` and didn't draw a bounding box around it.
3. **Net Quantity Clearance Failing**: The whitespace clearance was failing despite the curvature tolerance previously added.

I have thoroughly investigated the logs, the OCR pipeline, and your uploaded screenshots, and I have found the exact chain of events causing this.

### The Root Cause: `auto_rectify_label`
The core issue causing the "dogshit bounding box" and the wrong MRP was the `auto_rectify_label` function in the image preprocessing pipeline.
When you uploaded the image of the circular bottom of the can, `auto_rectify_label` attempted to find a flat, rectangular label. It incorrectly latched onto a tiny, random rectangular pattern on the **background cloth** and cropped/warped the image to just that tiny square!
- **Why the MRP was wrong**: The OCR engine was forced to read a tiny, warped patch of the background cloth, where it completely missed the actual `RS 40/-` text and hallucinated random characters (which the regex picked up as the wrong price).
- **Why the box was dogshit**: The bounding box coordinates returned by the OCR were relative to that tiny warped crop. When the React UI tried to draw those coordinates over the *original* uncropped image, they appeared as a tiny, disconnected dot on the far left.

### Why Clearance Failed
Because the OCR was fed a warped image, it struggled to confidently extract the Net Quantity (`300ml`) on the correct surfaces.
Furthermore, the Net Quantity fallback regex mistakenly prioritized `rast 7.45mm` (a random length hallucination) over `300ml` because it appeared earlier in the concatenated text. Since `7.45mm` was on a highly crowded surface, it failed the clearance zone check.

*(Note: In your recent test, it appears you accidentally uploaded a screenshot of the React UI itself as the package image! This caused the API to extract "Rs 10.6" directly from the UI legend in the screenshot, but the root cause in your actual prior run was the `auto_rectify_label` bug!)*

## Proposed Changes

### [MODIFY] `backend/app/api/audit.py`
I will completely disable the `auto_rectify_label` function. The OCR engine is already fully capable of reading tilted and curved text. Removing this dangerous crop will ensure the bounding boxes exactly map to the original image in the UI, fixing the "dogshit" bounding boxes on circular faces.

### [MODIFY] `backend/app/core/rules_engine.py`
1. **Net Quantity Fallback Scoring**: I will upgrade the fallback regex to score matches. It will now prioritize standard FMCG sizes (like `300`) and Volume/Weight units (`ml`, `g`) over Length units (`mm`). This guarantees it picks the real `300ml` instead of random noise like `7.45mm`.
2. **Space-Insensitive Labeling**: I will make the string matching for bounding box labels space-insensitive so that `300 mL` (Surface 0) and `300ml` (Surface 2) both get correctly labeled, allowing the Best-Score-Wins deduplication to pick the cleanest surface.

### [MODIFY] `backend/app/vision/clearance_mask.py`
I will ensure the `container_type = 'cylindrical'` argument is passed down properly to apply a dynamic curvature tolerance, reducing horizontal clearance requirements to prevent false positives from text wrapping around the sides.

## User Review Required
> [!IMPORTANT]
> The clearance zone on the side of the Coke can might still legitimately fail because the text `RECYCLE ME` is printed directly below `300ml`. The statutory law requires a **vertical** whitespace clearance of at least `1.0 * height`. Since vertical space is unaffected by cylinder curvature, this is a true violation by Coca-Cola! 
> 
> **Do you approve removing the auto-rectifier to fix the bounding boxes?**
