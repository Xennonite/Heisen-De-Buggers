## Goal Description
Thoroughly review and update the documentation (`README.md`, `docs/USER_MANUAL.md`, `docs/DEVELOPER_GUIDE.md`) to perfectly reflect all recent codebase changes:
1. Complete removal of Tesseract OCR in favor of PaddleOCR.
2. The shift from single-image to multi-surface scanning in the API data contracts.
3. The addition of the metallic dot-matrix downscaling pipeline.
4. The reduction of the visual horizontal clearance mask from `2.0x` to `1.0x`.

## Proposed Changes

### `README.md`
#### [MODIFY] README.md
- Replace "Hybrid OCR" with "PaddleOCR multi-surface extraction".
- Add `PaddleOCR` to the Computer Vision Tech Stack table.
- Update the Quick Start guide to recommend Python 3.10 instead of 3.12 (since PaddleOCR heavily relies on 3.10 compatibility, especially on Windows).

### `docs/DEVELOPER_GUIDE.md`
#### [MODIFY] docs/DEVELOPER_GUIDE.md
- **Section 2.D:** Update the horizontal clearance polygon math from `2.0 * h` to `1.0 * h` to match the new visual implementation.
- **Section 3.2:** Explicitly mention PaddleOCR and the `max_dim=600px` downscaling pipeline for metallic dot-matrix surfaces.
- **Section 5:** Update the API Data Contract for `/scan` to reflect `files` (array) instead of `file`, and the inclusion of the `surfaces` array in the JSON response, removing root-level `bounding_boxes` and `clearance_zone`.

### `docs/USER_MANUAL.md`
#### [MODIFY] docs/USER_MANUAL.md
- **Section 2 (Right Panel):** Update the clearance description to mention $1\times h$ left/right instead of $2\times h$.
- **Section 3 (Step 2, Point 3):** Update the clearance description to $1\times h$ left/right.

## Verification
Manually verify that all documents render correctly and accurately reflect the current state of the MVP.
