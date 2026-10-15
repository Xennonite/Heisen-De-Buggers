# MetroVerity — Metrological Computer Vision & Statutory Enforcement Platform

MetroVerity is an automated Legal Metrology compliance verification and statutory enforcement MVP designed to protect consumers and empower enforcement officers under **The Legal Metrology Act, 2009** and **The Legal Metrology (Packaged Commodities) Rules, 2011**.

> [!NOTE]
> **Organization:** Ministry of Consumer Affairs, Food & Public Distribution

## 🚀 Key Features

### 1. Spatial Document AI & Pre-Processing
- **Tri-Modal Ingestion:** Supports physical multi-angle photos, warehouse bulk lot sampling, and automated e-commerce web crawling under Rule 6(10).
- **Perspective Rectification:** Auto-detects label contours and applies OpenCV 4-point perspective transforms to flatten cylinders and pouches.
- **Spatial Bounding & Text Hierarchy:** Utilizes **LayoutLMv3** and **PaddleOCR** to extract text tokens while retaining 2D spatial coordinates and visual bounding hierarchies.
- **Metric Scale Calibration:** Converts image pixel heights to exact physical millimeters for mathematically perfect font-to-PDP scaling.

### 2. Statutory NLP Rule Engine
- **Principal Display Panel (PDP) Engine:** Calculates surface area for rectangular, cylindrical, and irregular containers (Rule 7(4)).
- **Dynamic Millimeter Font Height Engine:** Evaluates numeral/letter heights against Rule 7 Table-I (1.0mm - 6.0mm).
- **Clearance Mask Generator:** Verifies Rule 8(1) free space ($\ge 1\times$ Above/Below, $\ge 2\times$ Sides) around net quantity declarations.
- **Syntax & Semantics Validator:** Extracts and validates mandatory declarations, strict MRP syntax ("incl. of all taxes"), and SI Units (Rule 13).
- **Deceptive Term Classifier:** Flags misleading qualifiers like "Approx", "Min", or unauthorized "When Packed" (Rule 12(6)).

### 3. E-Commerce LMPC Enforcement Module (Rule 6(10) & 26(g))
- **Automated Digital Scraping:** Headless Playwright scraper bypasses basic anti-bot, triggers lazy-loaded image galleries, and extracts raw web text.
- **High-Res Gallery Extraction:** Regex engine strips e-commerce thumbnail modifiers (e.g., Amazon `._AC_UL320_`, Flipkart `/300/300/`) to retrieve pristine, ultra-high-resolution images for OCR.
- **Cross-Verification Integrity:** Automatically cross-references mandatory web declarations against physical packaging labels (via OCR) to detect deceptive pricing or quantity mismatches online.
- **Smart Consumer Care NLP:** Expanded regex models detect hidden e-commerce contact variants (e.g., "support@", "contact", "grievance") to prevent false positives.

### 4. Physical Testing & Enforcement Suite
- **First Schedule MPE Engine:** Computes exact Maximum Permissible Error limits across all quantity tiers and evaluates statistical batch samples.
- **Compounding Fee Calculator:** Auto-assesses statutory fines (₹2,000 to ₹50,000) based on Sections 29 & 36, adapting penalties specifically for E-commerce violations.
- **Statutory Notice Generation:** Auto-populates Seventh Schedule Forms A & B and seals them as cryptographically signed, Tamper-Evident PDFs.

### 5. Role-Based Access Control & Security
- **Clerk Identity Management:** Secure authentication wrapper protecting all inspection endpoints.
- **Granular RBAC:** Supports strictly mapped `ADMIN`, `LMPC_OFFICER`, and `MANUFACTURER` user profiles.
- **Statutory Audit Logs:** Immutable SQLite tracking of all scans, scraped e-commerce URLs, and penalty records, accessible based on clearance level.

## 🛠 Technology Stack

| Layer | Technologies & Frameworks | Role in MetroVerity |
| :--- | :--- | :--- |
| **Document AI & OCR** | LayoutLMv3, PaddleOCR | Extracts text tokens while retaining 2D spatial coordinates and visual bounding hierarchies. |
| **Computer Vision** | OpenCV, NumPy, Pyzbar | Performs surface unwarping, pixel-per-metric font scaling, clearance buffer masking, and barcode decoding. |
| **Web Crawling / E-Comm** | Playwright, BeautifulSoup4 | Headless automated extraction of digital product listings, metadata, and packaging photos from e-commerce portals. |
| **Backend & Rule Engine** | Python, FastAPI | Lightning-fast asynchronous REST API handling computer vision tasks and the NLP rule engine. |
| **Frontend & Inspector UI** | React.js, TailwindCSS | High-contrast dashboard featuring interactive bounding-box overlays, live inspection feeds, and manual weight entry. |
| **Database & Storage** | PostgreSQL (JSONB), MinIO / S3 | Relational metadata tracking, inspection logs, and secure object storage for full-resolution raw packaging photos. |
| **Authentication & IAM** | Clerk, PyJWT, Cryptography | Headless auth, JWKS signature verification, and React UI enclave protection. |
| **Security & Export** | ReportLab, PyMuPDF, OpenSSL | Statutory Seventh Schedule (Forms A & B) generation, SHA-256 evidence hashing, and digital signature sealing. |

## ⚡ Quick Start & Setup Guide

MetroVerity uses **PaddleOCR** for robust text extraction.

**Prerequisites:**
- **Node.js** (v18 or higher) & **npm**
- **Python 3.10** (On Windows, check "Add Python to PATH" during installation)
- **Microsoft Visual C++ Redistributable** (Required for PaddleOCR on Windows)
- `libzbar0` and OpenGL libraries (Required on Linux/Debian systems)

### Backend Setup

<details>
<summary><b>Windows</b></summary>

```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
</details>
<details>
<summary><b>Linux / macOS</b></summary>

```bash
cd backend
python3.10 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
</details>


### Full Authentication Setup (Optional)
If you want to fully test the RBAC pipeline in production, you must configure Clerk:
1. Create a free account at [Clerk](https://clerk.com).
2. Set `VITE_CLERK_PUBLISHABLE_KEY` in `frontend/.env.local`.
3. Set `CLERK_SECRET_KEY` in `backend/.env`.
4. Edit the Clerk Session Token to include `{"public_metadata": "{{user.public_metadata}}"}`.
5. Manually assign roles (`ADMIN`, `LMPC_OFFICER`, `MANUFACTURER`) to your test users via the Clerk Dashboard Public Metadata.

See `docs/DOCUMENTATION.md` for deeper instructions.

### Zero-Config Offline Development
If you just cloned the repo and do not want to set up Clerk Authentication, you can bypass the login screen entirely by using our built-in dev mock scripts:

```bash
cd frontend
npm install

# Test the Admin UI (Full Access, includes 'Clear All' functionality)
npm run dev:admin

# Test the Officer UI (Inspection capabilities, no delete rights)
npm run dev:officer

# Test the Manufacturer UI (Read-only historical view, ingestion forms are hidden)
npm run dev:manufacturer
```
*Note: These commands inject a secure `X-Mock-Role` header. The FastAPI backend is configured to accept this header for seamless mock authentication, provided the environment is not explicitly set to production.*

### Frontend Setup

<details>
<summary><b>Windows</b></summary>

```cmd
cd frontend
npm install
npm run dev
```
</details>
<details>
<summary><b>Linux / macOS</b></summary>

```bash
cd frontend
npm install
npm run dev
```
</details>

## 📖 Documentation
For comprehensive details on system architecture, metrological mathematical foundations, and a step-by-step inspector workflow, please refer to the [Documentation](docs/DOCUMENTATION.md).
