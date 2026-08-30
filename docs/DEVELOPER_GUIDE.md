# MetroVerity — Developer Architecture & Contribution Guide

## 1. System Architecture & High-Level Design

MetroVerity is engineered as a decoupled, high-performance web platform combining a **FastAPI backend** (running computer vision, metrological math, and statutory rule evaluation) with a **React 18 (Vite + TailwindCSS) frontend** (providing responsive canvas visualizations, dynamic rule checklists, and live physical sampling test benches).

```mermaid
graph TD
    subgraph Frontend [React 18 + TailwindCSS Client]
        UI[Ingestion Form & Presets] --> API_REQ[Axios API Client]
        API_RESP[Scan Response JSON] --> CANVAS[SVG Visual Overlay Canvas]
        API_RESP --> CHECKLIST[Compliance Rule Checklist]
        API_RESP --> GAUGE[Score & Penalty Card]
        API_RESP --> EXPORTER[ReportLab / Docx Exporter]
        MODAL[7th Schedule Physical MPE Modal] --> API_REQ
    end

    subgraph Backend [FastAPI 3.12 Backend Core]
        API_REQ --> ROUTER[FastAPI API Router]
        ROUTER --> PREPROC[OpenCV Preprocessing & Perspective Warp]
        ROUTER --> SCALER[Spatial Metric Scaler S = px/mm]
        ROUTER --> OCR[OCR Wrapper & Pyzbar Barcode Decoder]
        ROUTER --> CLEARANCE[Rule 8 Clearance Mask Collision Engine]
        ROUTER --> RULES[Statutory NLP & Metrology Rule Engine]
        ROUTER --> MPE[First Schedule MPE & Rule 19(6) Statistical Engine]
        ROUTER --> PDF_GEN[ReportLab PDF & python-docx Generator]
        ROUTER --> DB[(SQLite Database / SQLAlchemy)]
    end
```

---

## 2. Metrological Mathematical Foundations & Formulations

### A. Principal Display Panel (PDP) Surface Area ($A$) [Rule 7(4)]
The surface area $A$ in $\text{cm}^2$ determines the required font height:
- **Rectangular Container [Rule 7(4)(a)]:**
  $$A = \frac{\text{Height (mm)} \times \text{Width (mm)}}{100}$$
- **Cylindrical / Nearly Cylindrical Container [Rule 7(4)(b)]:**
  $$A = \frac{0.40 \times \text{Height (mm)} \times (\pi \times \text{Diameter (mm)})}{100}$$
- **Irregular / Other Shaped Container [Rule 7(4)(c)]:**
  $$A = \frac{0.40 \times \text{Total Surface Area (mm}^2)}{100} \approx \frac{0.40 \times 2(HW + WD + HD)}{100}$$

Implemented in: [`backend/app/vision/spatial_scaler.py`](file:///home/binaryraptor/Projects/Heisen-De-Buggers/backend/app/vision/spatial_scaler.py#L6-L45)

---

### B. Metric Scale Ratio & Physical Font Height Conversion
$$\text{Scale Ratio } S_{\text{px/mm}} = \frac{\text{Package Height in Image (pixels)}}{\text{User-Input Verified Package Height (mm)}}$$
$$\text{Actual Feature Size (mm)} = \frac{\text{Feature Bounding Box Dimension (pixels)}}{S_{\text{px/mm}}}$$

Implemented in: [`backend/app/vision/spatial_scaler.py`](file:///home/binaryraptor/Projects/Heisen-De-Buggers/backend/app/vision/spatial_scaler.py#L62-L80)

---

### C. Statutory Minimum Font Height Thresholds [Rule 7(2), Table-I]
| Calculated PDP Area ($A$) in $\text{cm}^2$ | Minimum Font Height (Normal Print) | Minimum Font Height (Blown/Molded) |
| :--- | :--- | :--- |
| $A \le 50$ | $1.0\text{ mm}$ | $1.5\text{ mm}$ |
| $50 < A \le 100$ | $1.5\text{ mm}$ | $3.0\text{ mm}$ |
| $100 < A \le 500$ | $2.5\text{ mm}$ | $4.0\text{ mm}$ |
| $500 < A \le 2500$ | $4.0\text{ mm}$ | $6.0\text{ mm}$ |
| $A > 2500$ | $6.0\text{ mm}$ | $6.0\text{ mm}$ |

Implemented in: [`backend/app/vision/spatial_scaler.py`](file:///home/binaryraptor/Projects/Heisen-De-Buggers/backend/app/vision/spatial_scaler.py#L47-L60)

---

### D. Net Quantity Clearance Buffer Geometry [Rule 8(1)]
Given the bounding box of the Net Quantity declaration $[x, y, w, h]$:
- **Vertical Clearance (Top/Bottom):** Free space $\ge 1.0 \times h$
- **Horizontal Clearance (Left/Right):** Free space $\ge 1.0 \times h$ (Reduced from 2.0x for visual clarity)
- **Clearance Polygon Boundary:**
  $$\text{Clearance Bounding Box} = [x - h, \; y - h, \; w + 2h, \; h + 2h]$$
- **Collision Condition:** Evaluated via Axis-Aligned Bounding Box (AABB) intersection against all other text tokens on the surface.

Implemented in: [`backend/app/vision/clearance_mask.py`](file:///home/binaryraptor/Projects/Heisen-De-Buggers/backend/app/vision/clearance_mask.py#L4-L78)

---

### E. Maximum Permissible Error (MPE) [First Schedule, Table-I]
For a declared nominal quantity $Q$ (in grams or milliliters):

$$\text{MPE}(Q) = \begin{cases}
9\% \text{ of } Q & Q \le 50\text{ g/ml} \\
4.5\text{ g/ml} & 50 < Q \le 100\text{ g/ml} \\
4.5\% \text{ of } Q & 100 < Q \le 200\text{ g/ml} \\
9.0\text{ g/ml} & 200 < Q \le 300\text{ g/ml} \\
3\% \text{ of } Q & 300 < Q \le 500\text{ g/ml} \\
15.0\text{ g/ml} & 500 < Q \le 1000\text{ g/ml} \\
1.5\% \text{ of } Q & 1000 < Q \le 10000\text{ g/ml} \\
150.0\text{ g/ml} & 10000 < Q \le 15000\text{ g/ml} \\
1.0\% \text{ of } Q & Q > 15000\text{ g/ml}
\end{cases}$$

**Statistical Batch Conditions [Rule 19(6)]:**
1. Sample Mean $\bar{x} \ge Q$.
2. Number of defective packages with error $> \text{MPE}(Q)$ must be $\le$ Fifth Schedule limits ($\le 2$ for lot size 32; $\le 5$ for lot size 80).
3. **Zero Tolerance:** No individual package deficiency may exceed $2 \times \text{MPE}(Q)$.

Implemented in: [`backend/app/api/physical_test.py`](file:///home/binaryraptor/Projects/Heisen-De-Buggers/backend/app/api/physical_test.py#L8-L38)

---

### F. Quantitative Compliance Scoring & Penalty Assessment
The compliance score begins at 100 and applies weighted statutory deductions:

```python
# 1. Mandatory Declarations (Rule 6, 10): -15 per missing mandatory parameter
# 2. MRP Integrity (Rule 6(1)(e)): -25 if missing MRP, -15 if missing tax tag
# 3. Typography & Clearance (Rule 7 & 8): -20 if under-sized font, -15 if clearance encroachment
# 4. Deceptive Marketing Terms (Rule 12(6)): -25 if deceptive qualifier found
# 5. SI Units Standardization (Rule 13): -10 if non-standard units found
# 6. Second Schedule Pack Size: -15 if non-standard size and not exempt
```

Implemented in: [`backend/app/core/rules_engine.py`](file:///home/binaryraptor/Projects/Heisen-De-Buggers/backend/app/core/rules_engine.py#L295-L330)

---

## 3. Backend Module Breakdown

### 1. `app/vision/preprocessor.py`
- `load_image_with_exif(image_path)`: Reads images using PIL + OpenCV, automatically correcting orientation based on EXIF tags.
- `four_point_transform(image, pts)`: Computes perspective transform matrix and rectifies tilted labels.
- `auto_rectify_label(image)`: Canny edge and contour detection to identify 4-point quadrilateral label boundaries.
- `calculate_contrast_ratio(bgr_crop)`: Text-to-background luminance ratio estimation.

### 2. `app/vision/ocr_wrapper.py`
- `decode_barcodes(image_bgr)`: Uses `pyzbar` to decode 1D/2D barcodes (EAN-13, UPC-A, Code128, QR) and validates GTIN length.
- `extract_text_regions_cv(image_bgr)`: Morphological gradient and Otsu thresholding to extract candidate text bounding boxes.
- `run_ocr(image_bgr, scale_factor, required_font_height_mm, is_metallic_surface)`: Uses **PaddleOCR** to extract text tokens. Features an automatic downscaling pipeline (`max_dim=600px`) for metallic surfaces to fuse disconnected dot-matrix text on high-res images, before inversely scaling bounding boxes.

### 3. `app/core/rules_engine.py`
- `extract_pin_code(text)`: Regex matching 6-digit Indian PIN codes (`\b[1-9][0-9]{5}\b`).
- `extract_country_of_origin(text)`: Identifies origin declarations (`Made in India`, `Country of Origin: ...`).
- `extract_mfg_date(text)`: Parses date of packing/manufacturing formats (`MM/YYYY`, `Month YYYY`, `PKD DD/MM/YY`).
- `extract_consumer_care(text)`: Parses toll-free numbers (`1800...`), helpline numbers, and support emails.
- `extract_mrp(text)`: Extracts declared price and checks for mandatory `"(incl. of all taxes)"` or `"(inclusive of all taxes)"` phrase.
- `extract_net_quantity(text)`: Extracts declared numeric quantity and unit.
- `evaluate_statutory_compliance(...)`: End-to-end evaluation pipeline assembling the checklist, compounding penalties, and score.

### 4. `app/api/physical_test.py`
- `POST /api/v1/test/mpe-check`: Evaluates batch weights against First Schedule MPE piecewise limits, sample mean, Fifth Schedule defective allowances, and zero-tolerance conditions.

### 5. `app/api/report.py`
- `POST /api/v1/report/export`: Generates downloadable documents:
  - `export_type="pdf"`: Complete Inspection Dossier via ReportLab with SHA-256 evidence hash.
  - `export_type="seventh_schedule_form_a"`: Official statutory notice to manufacturer/packer under Rules 27 & 28.
  - `export_type="docx"`: Editable Word document via `python-docx`.
  - `export_type="csv"`: Tabular CSV audit data.

### 6. `app/storage/`
- `models.py`: SQLAlchemy `ScanRecord` model storing scan metadata, measurements, image filename, and full JSON payload.
- `database.py`: Synchronous and asynchronous SQLite session factories.

---

## 4. Frontend Architecture & Canvas Rendering

### Component Structure
```text
frontend/src/
├── components/
│   ├── Navbar.jsx               # Top header, branding, navigation triggers
│   ├── IngestionForm.jsx        # File upload, dimensions (H, W, D), presets
│   ├── VisualOverlay.jsx        # SVG canvas with color-coded bounding boxes & clearance mask
│   ├── ComplianceChecklist.jsx  # Pass/Fail cards for Rules 6, 7, 8, 10, 12, 13, 2nd Sched
│   ├── ComplianceCard.jsx       # 0-100% Score gauge, fine estimate, violation details
│   ├── SeventhScheduleModal.jsx # Weight table, live MPE calculation, Form A download
│   ├── ExportPanel.jsx          # Download triggers (PDF, Form A, DOCX, CSV)
│   └── HistoryDrawer.jsx        # Searchable SQLite scan log drawer
├── services/
│   └── api.js                   # Axios HTTP client connecting to FastAPI
├── App.jsx                      # Root workflow coordinator
└── index.css                    # Tailwind CSS configuration
```

### SVG Overlay Coordinate Mapping
In [`VisualOverlay.jsx`](file:///home/binaryraptor/Projects/Heisen-De-Buggers/frontend/src/components/VisualOverlay.jsx), the SVG overlay layer uses `viewBox="0 0 {origW} {origH}"` with `preserveAspectRatio="none"` over the responsive image. This ensures bounding box coordinates $[x, y, w, h]$ scale 1:1 with the rendered packaging photo regardless of screen size or zoom level.

---

## 5. API Data Contracts

### 1. `POST /api/v1/audit/scan`
**Request (multipart/form-data):**
- `files`: Array of image files (`.jpg`, `.png`) for multi-surface scanning
- `package_height_mm`: float (e.g. `150.0`)
- `package_width_mm`: float (e.g. `80.0`)
- `package_depth_mm`: float (optional, e.g. `30.0`)
- `container_type`: string (`"rectangular"` | `"cylindrical"` | `"irregular"`)
- `category`: string (`"biscuits"` | `"tea"` | `"soap"` | `"edible_oil"` | `"general"`)

**Response (application/json):**
```json
{
  "scan_id": "MV-2026-A1B2C3",
  "timestamp": "2026-08-29T18:15:00Z",
  "package_height_mm": 150.0,
  "package_width_mm": 80.0,
  "container_type": "rectangular",
  "category": "biscuits",
  "pdp_area_cm2": 120.0,
  "required_font_height_mm": 2.5,
  "compliance_score": 95,
  "status": "COMPLIANT",
  "estimated_compounding_fine_inr": 0,
  "rule_checklist": {
    "rule_6_mandatory_fields": true,
    "rule_6_1_e_mrp_syntax": true,
    "rule_7_font_height": true,
    "rule_8_clearance": true,
    "rule_10_origin_pin": true,
    "rule_12_deceptive_terms": true,
    "rule_13_si_units": true,
    "second_schedule_pack_size": true
  },
  "declarations": { ... },
  "net_quantity": { ... },
  "mrp": { ... },
  "deceptive_terms": { ... },
  "violations": [ ... ],
  "surfaces": [
    {
      "surface_id": 0,
      "image_filename": "front.jpg",
      "pdp_area_cm2": 120.0,
      "bounding_boxes": [ ... ],
      "barcodes": [ ... ],
      "clearance_zone": { ... }
    }
  ]
}
```

---

## 6. Automated Testing & Verification

The test suite covers all metrological mathematical formulas, statutory regex parsing, physical MPE calculations, and REST API endpoints:

```bash
# Run pytest test suite
PYTHONPATH=backend backend/.venv/bin/pytest backend/tests -v
```

### Test Modules:
1. `backend/tests/test_scaler.py`: Tests PDP area formulas for rectangular, cylindrical, and irregular packages; Rule 7 Table-I font height ladders; scale factor computation; and Rule 7(3) character aspect ratios.
2. `backend/tests/test_rules.py`: Tests PIN code extraction, origin parsing, packing date detection, consumer care regex, MRP syntax verification, deceptive term classification, and scoring deduction calculations.
3. `backend/tests/test_mpe.py`: Tests First Schedule Table-I piecewise formula across all 9 quantity tiers, Fifth Schedule defective allowances, and zero-tolerance violations.
4. `backend/tests/test_api.py`: Integration tests for `/scan`, `/mpe-check`, and multi-format `/export` endpoints (PDF, DOCX, CSV).

---

## 7. How to Add a New Statutory Rule

To introduce a new Legal Metrology compliance rule to MetroVerity:

1. **Define Schema Property:** Update `RuleChecklist` in [`backend/app/models/schemas.py`](file:///home/binaryraptor/Projects/Heisen-De-Buggers/backend/app/models/schemas.py).
2. **Implement Rule Logic:** Add the regex or geometric validator in [`backend/app/core/rules_engine.py`](file:///home/binaryraptor/Projects/Heisen-De-Buggers/backend/app/core/rules_engine.py).
3. **Add Compounding Section & Penalty:** Register applicable penalty amounts under Rule 32A.
4. **Update Scoring Weights:** Adjust deduction points in `compute_compliance_score`.
5. **Add Frontend Checklist Card:** Include the rule title, description, and status in [`frontend/src/components/ComplianceChecklist.jsx`](file:///home/binaryraptor/Projects/Heisen-De-Buggers/frontend/src/components/ComplianceChecklist.jsx).
6. **Add Unit Tests:** Write corresponding test cases in `backend/tests/test_rules.py`.
