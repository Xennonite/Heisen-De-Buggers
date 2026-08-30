# MetroVerity — Metrological Computer Vision & Statutory Enforcement Platform

> **Smart India Hackathon (SIH 2026)**  
> **Problem Statement ID:** 26034  
> **Problem Statement Title:** Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels.  
> **Organization:** Ministry of Consumer Affairs, Food & Public Distribution  
> **Department:** Department of Consumer Affairs (DoCA)  
> **Category:** Software  

---

## 📌 Executive Summary

**MetroVerity** is an automated Legal Metrology compliance verification and statutory enforcement MVP designed to protect consumers and empower enforcement officers under **The Legal Metrology Act, 2009** and **The Legal Metrology (Packaged Commodities) Rules, 2011** (including all subsequent amendments).

The system pairs computer vision, spatial document analysis, deterministic metric scaling, and a comprehensive statutory rule engine to scan packaging images, extract declarations, compute Principal Display Panel (PDP) surface areas, verify character heights in physical millimeters, detect clearance encroachments, classify deceptive terms, verify First Schedule Maximum Permissible Errors (MPE), assess Rule 32A compounding fees, and generate tamper-evident Seventh Schedule Form A notices.

---

## 🚀 Key Features Implemented (MVP)

### 1. Tri-Modal Multi-Surface Ingestion & Metric Calibration
- Upload packaging photos (Frontal, Multi-angle, Wrapper scans).
- Dimension-driven scale calibration: converts image pixel heights to exact physical millimeters ($S = \text{pixels} / \text{mm}$).
- Preloaded one-click demo presets (Biscuits, Edible Oil, Shampoo, Tea) for instant evaluation.

### 2. Spatial Geometry & Computer Vision Pipeline
- **PDP Geometry Engine [Rule 7(4)]**: Calculates Principal Display Panel surface area ($A$ in $\text{cm}^2$) for Rectangular, Cylindrical, and Irregular containers.
- **Statutory Font Height Engine [Rule 7(2), Table-I]**: Evaluates numeral/letter heights ($1.0\text{mm} - 6.0\text{mm}$) against calculated PDP area.
- **Rule 8(1) Clearance Mask Generator**: Computes whitespace clearance polygon around Net Quantity ($\ge 1\times h$ above/below, $\ge 2\times h$ left/right) and detects encroaching text/graphics.
- **Aspect Ratio Constraint [Rule 7(3)]**: Verifies character width $\ge \frac{1}{3} \times \text{height}$ with statutory exemptions.
- **OpenCV Perspective Rectification**: Auto-detects label contours and applies 4-point perspective transforms.
- **1D/2D Barcode & QR Decoding**: Extracts barcode payloads using `pyzbar`.

### 3. Statutory Metrology NLP & Rule Engine
- **Mandatory Declarations [Rule 6 & 10]**: Extracts Manufacturer Name/Address, 6-digit Indian PIN code, Country of Origin, Date of Packing, and Consumer Care details.
- **MRP Syntax & Mandatory Tax Tag [Rule 6(1)(e)]**: Enforces `"(incl. of all taxes)"` or `"(inclusive of all taxes)"`.
- **Prohibited Deceptive Terms [Rule 12(6)]**: Flags misleading qualifiers like `"Approx"`, `"Approximate"`, `"Minimum"`, unauthorized `"When Packed"`.
- **SI Unit Standardization [Rule 13]**: Enforces standardized SI symbols (including capitalized `'L'` for Litre).
- **Second Schedule Pack Sizes**: Verifies prescribed standard SKU pack sizes and ₹1–₹10 value pack exemptions.
- **Rule 32A Compounding Fee Assessment**: Computes statutory compounding penalties under Section 29, Section 36(1), Section 36(2), and Rule 18(2).
- **0–100% Quantitative Compliance Scoring**: Applies legal penalty deductions to output an objective score.

### 4. Physical Testing & First Schedule MPE Engine
- **Maximum Permissible Error Piecewise Calculator**: Computes exact $\text{MPE}(Q)$ across all 9 quantity tiers in First Schedule Table-I.
- **Rule 19(6) Statistical Batch Verification**: Evaluates sample mean $\bar{x} \ge Q$, Fifth Schedule defective unit allowances, and zero-tolerance limits ($> 2\times\text{MPE}$).

### 5. Multi-Format Statutory Dossier & Notice Export
- **PDF Audit Dossier & Seventh Schedule Form A**: High-resolution ReportLab document with tamper-evident SHA-256 evidence hashing and digital certification block.
- **Editable Word Document (.docx)**: Generated via `python-docx`.
- **Tabular Data (.csv)**: Full extraction and measurement log.

---

## 🛠 Technology Stack

| Layer | Technologies | Role |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 5, TailwindCSS, Lucide Icons, Axios | Responsive inspector dashboard, interactive SVG visual canvas, live MPE modal, export controls |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, Uvicorn | High-performance RESTful API and asynchronous CV processing |
| **Computer Vision** | PaddleOCR, OpenCV (`opencv-python-headless`), NumPy, Pillow, Pyzbar | Metric scaling, perspective transform, clearance mask collision, barcode decoding |
| **Rule & NLP Engine** | Python Regex & Heuristics | Statutory LMPC 2011 rule parsing, scoring deduction algorithm, compounding fee calculator |
| **Reports & Documents** | ReportLab, python-docx, CSV | Seventh Schedule Form A notice and multi-format inspection report generation |
| **Persistence** | SQLite, SQLAlchemy, aiosqlite | Inspection history repository and scan audit logging |
| **Testing** | Pytest, Pytest-Asyncio, HTTPX | 100% passing test coverage across rules, geometry, MPE, and API endpoints |

---

## 📂 Repository Structure

```
Heisen-De-Buggers/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── audit.py          # POST /api/v1/audit/scan, GET /api/v1/audit/history
│   │   │   ├── physical_test.py  # POST /api/v1/test/mpe-check
│   │   │   └── report.py         # POST /api/v1/report/export (PDF, DOCX, CSV, Form A)
│   │   ├── core/
│   │   │   ├── config.py         # App configuration, directories, CORS
│   │   │   └── rules_engine.py   # Statutory rule parsing, compliance scoring, fee assessment
│   │   ├── vision/
│   │   │   ├── preprocessor.py   # OpenCV perspective rectification & unwarping
│   │   │   ├── spatial_scaler.py # Metric scale ratio px/mm, PDP area calculation
│   │   │   ├── clearance_mask.py # Rule 8(1) clearance polygon collision logic
│   │   │   └── ocr_wrapper.py    # PaddleOCR multi-surface text extraction, barcode decoding, token spatial mapping
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic request/response data contracts
│   │   ├── storage/
│   │   │   ├── database.py       # SQLite database session and engine
│   │   │   └── models.py         # SQLAlchemy inspection record models
│   │   └── main.py               # FastAPI entry point
│   ├── tests/
│   │   ├── test_api.py           # Endpoint integration tests
│   │   ├── test_rules.py         # Rule engine unit tests
│   │   ├── test_scaler.py        # PDP and pixel-to-mm tests
│   │   └── test_mpe.py           # First Schedule MPE and statistical tests
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Header branding & top-level actions
│   │   │   ├── IngestionForm.jsx     # Upload, dimensions input, presets
│   │   │   ├── VisualOverlay.jsx     # Interactive canvas with color-coded bounding boxes
│   │   │   ├── ComplianceChecklist.jsx # Pass/Fail rule cards with statutory citations
│   │   │   ├── ComplianceCard.jsx    # Gauge score, compounding penalty, violation breakdown
│   │   │   ├── SeventhScheduleModal.jsx # Sampling weight table + live MPE check
│   │   │   ├── HistoryDrawer.jsx     # Inspection history drawer & search
│   │   │   └── ExportPanel.jsx       # One-click export triggers (PDF, Form A, DOCX, CSV)
│   │   ├── services/
│   │   │   └── api.js                # Axios client for backend endpoints
│   │   ├── App.jsx                   # Main layout and workflow coordinator
│   │   ├── main.jsx                  # React DOM root
│   │   └── index.css                 # Tailwind utilities
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/
│   ├── USER_MANUAL.md            # Comprehensive Inspector & User Manual
│   └── DEVELOPER_GUIDE.md        # Technical Architecture & Developer Contribution Guide
└── README.md                     # Project overview and quick start guide
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Python 3.10 (Specifically required for PaddleOCR compatibility, managed via `uv` or `venv`)
- Node.js 18+ & npm
- `libzbar0` and OpenGL libraries (pre-installed on Linux/Debian)

### 1. Setup Backend
```bash
# From repository root:
# 1. Create Python virtual environment using uv or venv
uv venv --python 3.10 backend/.venv

# 2. Install backend dependencies
uv pip install -r backend/requirements.txt --python backend/.venv

# 3. Run automated test suite
PYTHONPATH=backend backend/.venv/bin/pytest backend/tests

# 4. Start FastAPI server
PYTHONPATH=backend backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI documentation will be available at `http://localhost:8000/docs`.

### 2. Setup Frontend
```bash
# In another terminal:
cd frontend

# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📖 Comprehensive Documentation

For detailed instructions, please refer to our side-by-side documentation:
- **[User / Inspector Manual](file:///home/binaryraptor/Projects/Heisen-De-Buggers/docs/USER_MANUAL.md)**: Complete guide for enforcement officers on operating the system, conducting inspections, running physical sampling tests, and generating statutory legal notices.
- **[Developer & Architecture Guide](file:///home/binaryraptor/Projects/Heisen-De-Buggers/docs/DEVELOPER_GUIDE.md)**: In-depth technical guide explaining metrological mathematical models, CV algorithms, rule engine design, API data contracts, and contribution guidelines.
