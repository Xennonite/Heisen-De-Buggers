import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import APP_TITLE, APP_DESCRIPTION, APP_VERSION, UPLOAD_DIR, REPORTS_DIR
from app.storage.database import init_db
from app.api import audit, physical_test, report

# Initialize Database tables
init_db()

app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static folders for serving raw and annotated packaging images
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include API routers under /api/v1 prefix
app.include_router(audit.router, prefix="/api/v1")
app.include_router(physical_test.router, prefix="/api/v1")
app.include_router(report.router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "app": APP_TITLE,
        "version": APP_VERSION,
        "status": "ONLINE",
        "endpoints": {
            "audit_scan": "/api/v1/audit/scan",
            "audit_history": "/api/v1/audit/history",
            "physical_mpe_test": "/api/v1/test/mpe-check",
            "export_report": "/api/v1/report/export",
            "api_docs": "/docs",
        },
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "MetroVerity Backend Engine"}
