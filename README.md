# MetroVerity — Metrological Computer Vision & Statutory Enforcement Platform

MetroVerity is an automated Legal Metrology compliance verification and statutory enforcement MVP designed to protect consumers and empower enforcement officers under **The Legal Metrology Act, 2009** and **The Legal Metrology (Packaged Commodities) Rules, 2011**.

> [!NOTE]
> **Smart India Hackathon (SIH 2026)** | **Problem Statement ID:** 26034 | **Organization:** Ministry of Consumer Affairs, Food & Public Distribution

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

### 3. Physical Testing & Enforcement Suite
- **First Schedule MPE Engine:** Computes exact Maximum Permissible Error limits across all quantity tiers and evaluates statistical batch samples.
- **Compounding Fee Calculator:** Auto-assesses statutory fines (₹2,000 to ₹50,000) based on Sections 29 & 36.
- **Statutory Notice Generation:** Auto-populates Seventh Schedule Forms A & B and seals them as cryptographically signed, Tamper-Evident PDFs.

## 🛠 Technology Stack

| Layer | Technologies & Frameworks | Role in MetroVerity |
| :--- | :--- | :--- |
| **Document AI & OCR** | LayoutLMv3, PaddleOCR | Extracts text tokens while retaining 2D spatial coordinates and visual bounding hierarchies. |
| **Computer Vision** | OpenCV, NumPy, Pyzbar | Performs surface unwarping, pixel-per-metric font scaling, clearance buffer masking, and barcode decoding. |
| **Web Crawling / E-Comm** | Playwright, BeautifulSoup4 | Headless automated extraction of digital product listings, metadata, and packaging photos from e-commerce portals. |
| **Backend & Rule Engine** | Python, FastAPI | Lightning-fast asynchronous REST API handling computer vision tasks and the NLP rule engine. |
| **Frontend & Inspector UI** | React.js, TailwindCSS | High-contrast dashboard featuring interactive bounding-box overlays, live inspection feeds, and manual weight entry. |
| **Database & Storage** | PostgreSQL (JSONB), MinIO / S3 | Relational metadata tracking, inspection logs, and secure object storage for full-resolution raw packaging photos. |
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
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
</details>

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
