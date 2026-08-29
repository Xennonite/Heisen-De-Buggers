# MetroVerity — Inspector & User Operational Manual

## 1. Introduction & Overview

**MetroVerity** is a computer-vision-powered metrological compliance verification platform built for Legal Metrology Officers, Consumer Affairs Enforcement Authorities, and Quality Assurance Inspectors. It automates the inspection of packaged commodities under **The Legal Metrology Act, 2009** and **The Legal Metrology (Packaged Commodities) Rules, 2011 (LMPC Rules, 2011)**.

This manual provides step-by-step guidance on how to perform label inspections, verify physical dimensions and font heights, run statistical batch sampling against Maximum Permissible Error (MPE) thresholds, and issue statutory legal notices (Seventh Schedule Form A).

---

## 2. Dashboard Interface Tour

When you open MetroVerity (`http://localhost:5173`), the dashboard presents a clean, high-contrast, inspection-grade interface divided into key operational zones:

1. **Top Navigation Bar:**
   - **System Status Indicator:** Confirms that the backend rule engine and CV services are online.
   - **Physical MPE Test Button:** Opens the Fifth & First Schedule batch weight sampling modal.
   - **Inspection Log Button:** Opens the drawer containing previously scanned commodities archived in the SQLite database.
2. **Left Panel — Ingestion & Dimensions Form:**
   - Image upload / drag-and-drop zone.
   - Quick-load demo presets for instant one-click demonstration.
   - Precise physical package dimension inputs in millimeters ($H, W, D$).
   - Container geometry selector (Rectangular, Cylindrical, Irregular).
   - Commodity category dropdown (Biscuits, Tea, Soap, Edible Oil, General).
3. **Right Panel — Interactive Spatial Visual Overlay Canvas:**
   - Real-time rendering of package imagery.
   - Color-coded bounding box overlays (Green = PASS, Red = FAIL).
   - Rule 8(1) Net Quantity Clearance Zone buffer mask (dashed purple/red box).
   - Interactive zoom, pan, and hover measurement tooltips.
4. **Bottom Left Panel — Quantitative Scoring & Compounding Fee Card:**
   - 0–100% Quantitative score gauge.
   - Legal status badge (`COMPLIANT`, `PARTIALLY_COMPLIANT`, `NON_COMPLIANT`).
   - Assessed compounding fine in INR (₹) under Rule 32A.
   - Itemized list of statutory violations with legal severity rankings.
5. **Bottom Right Panel — Statutory Compliance Checklist:**
   - Visual Pass/Fail checklist covering Rules 6, 7, 8, 10, 12(6), 13, and Second Schedule.
6. **Export Panel:**
   - One-click buttons to export full PDF dossiers, Seventh Schedule Form A notices, editable DOCX reports, and raw CSV files.

---

## 3. Step-by-Step Inspection Workflow

### Step 1: Ingestion & Physical Dimension Calibration

To guarantee mathematically precise font height calculations, the system must calibrate pixels against real physical millimeters:

1. **Upload Label Image:**
   - Click on the upload zone or drag and drop a `.jpg` or `.png` photograph of the product packaging.
   - *Tip:* Alternatively, click any of the **Quick-Load Demo Presets** (e.g. *Britannia Biscuit*, *Fortune Oil Pouch*, *Herbal Shampoo*, or *Value Tea Pack*) to automatically load realistic sample packaging and dimensions.
2. **Enter Verified Dimensions (in mm):**
   - Measure the physical package height ($H$) in millimeters and enter it into the **Height (mm)** field.
   - Measure and enter the package width ($W$) in millimeters into the **Width (mm)** field.
   - Measure and enter the package depth ($D$) in millimeters (optional, used for irregular packages).
3. **Select Container Geometry [Rule 7(4)]:**
   - **Rectangular:** For cartons, pouches, and standard boxes where PDP Area $A = (H \times W) / 100 \text{ cm}^2$.
   - **Cylindrical:** For cans, bottles, and jars where PDP Area $A = 0.40 \times H \times (\pi \times W) / 100 \text{ cm}^2$.
   - **Irregular / Other:** For conical or uniquely shaped packages where PDP Area $A = 0.40 \times \text{Total Surface Area} / 100 \text{ cm}^2$.
4. **Select Commodity Category:**
   - Select the commodity type (e.g., Biscuits, Tea, Edible Oil, Soap, General) to verify compliance against Second Schedule standard pack sizes.
5. **Click "Run Automated Compliance Inspection"**:
   - The system initiates perspective rectification, OCR text extraction, metric scale computation, clearance collision checking, and rule evaluations.

---

### Step 2: Interpreting the Spatial Visual Canvas

Once processing completes, the **Spatial Visual Overlay Canvas** renders interactive annotations over the product image:

1. **Bounding Boxes:**
   - 🟢 **Green Bounding Box:** Indicates that the text element meets or exceeds the statutory minimum font height required for the calculated PDP surface area.
   - 🔴 **Red Bounding Box:** Indicates an under-sized font violation under Rule 7(2) Table-I.
2. **Interactive Tooltip Inspection:**
   - Click or hover over any bounding box to open the inspector card.
   - View:
     - **Extracted Text String**
     - **Measured Physical Font Height (mm)**
     - **Statutory Required Minimum Font Height (mm)**
     - **Rule Violation Reason (if non-compliant)**
3. **Rule 8(1) Clearance Buffer Zone:**
   - Toggle the **"Rule 8 Clearance Zone"** button in the canvas toolbar.
   - A dashed boundary appears around the Net Quantity declaration ($1\times h$ above/below, $2\times h$ left/right).
   - If other text elements (e.g. promotional slogans or graphic boxes) encroach inside this boundary, the clearance box turns **Red**, indicating a violation of Rule 8(1).
4. **Canvas Controls:**
   - Use the **Zoom In (+)**, **Zoom Out (-)**, and **Reset (↻)** buttons to inspect small micro-print or fine text.

---

### Step 3: Reviewing the Statutory Rule Checklist

The **Statutory Metrology Compliance Checklist** provides an exhaustive Pass/Fail breakdown across all relevant LMPC clauses:

| Statutory Rule | What is Checked | Pass Condition |
| :--- | :--- | :--- |
| **Rule 6(1)** | Mandatory Declarations | Manufacturer/Packer Name, Complete Address, Packing Date, Consumer Care contact present. |
| **Rule 6(1)(e)** | MRP Syntax & Tax Tag | Price declared with mandatory statutory phrase `"(incl. of all taxes)"` or `"(inclusive of all taxes)"`. |
| **Rule 7(2) Table-I** | Font Size vs. PDP Area | Numeral and letter heights $\ge$ statutory minimum threshold ($1.0\text{mm}$ to $6.0\text{mm}$) based on package area. |
| **Rule 8(1)** | Net Quantity Clearance | Minimum free space of $1\times h$ top/bottom and $2\times h$ left/right without encroaching text. |
| **Rule 10 & 6(1)(fa)** | PIN Code & Origin | Valid 6-digit Indian postal PIN code and Country of Origin declaration present. |
| **Rule 12(6)** | Deceptive Qualifiers | Absence of misleading terms like `"Approx"`, `"Approximate"`, `"Minimum"`, unauthorized `"When Packed"`. |
| **Rule 13** | SI Unit Standardization | Standard metric symbols used (e.g. capital `'L'` for Litre, `'g'`, `'kg'`, `'ml'`). |
| **Second Schedule** | Standard Pack Sizes | Nominal quantity matches Second Schedule standard SKUs (or is exempt as a ₹1–₹10 value pack). |

---

### Step 4: Assessing Compounding Penalties & Scoring

The **Quantitative Scoring & Compounding Fee Card** summarizes the legal audit:
1. **0–100% Compliance Score:**
   - Starts at 100 and applies statutory deductions for each observed breach.
   - $\ge 90\%$: Statutorily Compliant
   - $50\% - 89\%$: Partially Compliant (Minor defects)
   - $< 50\%$: Non-Compliant (Critical statutory violations)
2. **Rule 32A Compounding Fine Assessment:**
   - **Section 29 (General declaration defaults):** ₹10,000 (Manufacturer) / ₹2,000 (Retailer)
   - **Section 36(1) (Non-standard pack size / font breaches / deceptive terms):** ₹25,000 (Manufacturer) / ₹5,000 (Retailer)
   - **Section 36(2) (Net quantity error exceeding MPE):** ₹50,000 (Manufacturer) / ₹10,000 (Retailer)
   - **Rule 18(2) (Selling above MRP):** ₹5,000 (Manufacturer) / ₹2,000 (Retailer)

---

### Step 5: Physical Weight Sampling & First Schedule MPE Verification

When physical warehouse or laboratory package weighing is conducted:

1. Click **"Physical MPE Test"** in the top navigation bar.
2. Enter the **Declared Nominal Quantity ($Q$)** and select units (`g` or `ml`).
3. Enter the **Tare Weight** of the packaging material.
4. Select the **Fifth Schedule Lot Size** (e.g., 32 units for standard inspection, 80 units for large lots).
5. Enter the measured gross weights in the interactive 32-cell grid (or click **"Passing Run"** / **"Failing Run"** for demonstration).
6. **Review the Three Statistical Verifications [Rule 19(6)]:**
   - **Verification 1 (Sample Mean $\bar{x}$):** The average net weight across all sample units must be $\ge$ the declared nominal quantity $Q$.
   - **Verification 2 (Defective Unit Allowance):** The number of individual packages with a deficiency greater than the First Schedule Table-I $\text{MPE}(Q)$ must not exceed the Fifth Schedule limit (maximum 2 allowed for a 32-unit lot).
   - **Verification 3 (Zero-Tolerance Limit):** No individual package may have a deficiency exceeding $2 \times \text{MPE}(Q)$.
7. **Generate Seventh Schedule Form A:**
   - If non-compliant, click **"Generate 7th Sched. Form A Notice (PDF)"** to download the formal statutory notice issued to the manufacturer/packer under Rules 27 & 28.

---

### Step 6: Multi-Format Report & Evidence Export

From the **Statutory Reports & Legal Notice Export** panel, click any of the 4 export buttons:

1. **Full PDF Dossier:** A formal, multi-page inspection report generated via ReportLab containing inspection metadata, declaration status tables, typography measurements, violation descriptions, fine assessments, SHA-256 evidence hash, and a digital certification block.
2. **7th Sched. Form A (PDF):** The official statutory notice under Rules 27 & 28 of LMPC Rules, 2011.
3. **Editable DOCX:** Microsoft Word document formatted for enforcement case files.
4. **Raw CSV Audit:** Structured CSV spreadsheet containing all raw data rows for integration with departmental ERP or statistical databases.

---

### Step 7: Inspection History Repository

1. Click **"Inspection Log"** in the top navbar.
2. The drawer displays past inspection records stored in the SQLite database.
3. Search by **Scan ID** (e.g., `MV-2026-XXXX`), **Category**, or **Compliance Status**.
4. Click any inspection card to instantly reload its image, bounding boxes, score, and findings onto the dashboard canvas.
