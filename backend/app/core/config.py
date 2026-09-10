import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
SAMPLE_DIR = BASE_DIR / "app" / "sample_data"
SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR = BASE_DIR / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{BASE_DIR}/metroverity_v2.db")
SYNC_DATABASE_URL = os.getenv("SYNC_DATABASE_URL", f"sqlite:///{BASE_DIR}/metroverity_v2.db")

APP_TITLE = "MetroVerity API"
APP_DESCRIPTION = "Automated Legal Metrology Compliance & Statutory Enforcement System (LMPC Rules, 2011)"
APP_VERSION = "1.0.0"
