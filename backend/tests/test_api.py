import pytest
import io
from fastapi.testclient import TestClient
from PIL import Image
from app.main import app

client = TestClient(app)


def create_mock_image_bytes():
    img = Image.new("RGB", (300, 400), color=(73, 109, 137))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ONLINE"


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_audit_scan_endpoint():
    img_buf = create_mock_image_bytes()
    response = client.post("/api/v1/audit/scan", headers={"X-Mock-Role": "ADMIN"},
        files={"files": ("test_package.jpg", img_buf, "image/jpeg")},
        data={
            "package_height_mm": "150.0",
            "package_width_mm": "80.0",
            "package_depth_mm": "30.0",
            "container_type": "rectangular",
            "category": "biscuits",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "scan_id" in data
    assert data["pdp_area_cm2"] == 120.0
    assert data["required_font_height_mm"] == 2.5
    assert "rule_checklist" in data
    assert "declarations" in data
    assert "violations" in data


def test_mpe_check_endpoint():
    response = client.post("/api/v1/test/mpe-check", headers={"X-Mock-Role": "ADMIN"},
        json={
            "declared_quantity": 100.0,
            "unit": "g",
            "sample_weights": [100.0, 101.0, 100.5, 99.5] * 8,  # 32 units
            "tare_weight": 0.0,
            "lot_size": 32,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["overall_mpe_compliant"] is True
    assert data["sample_count"] == 32
    assert data["allowed_mpe_value"] == 4.5


def test_export_report_pdf():
    response = client.post("/api/v1/report/export", headers={"X-Mock-Role": "ADMIN"},
        json={
            "scan_id": "TEST-001",
            "export_type": "pdf",
            "scan_data": {
                "scan_id": "TEST-001",
                "timestamp": "2026-08-29T20:00:00Z",
                "pdp_area_cm2": 240.0,
                "required_font_height_mm": 2.5,
                "compliance_score": 95,
                "status": "COMPLIANT",
                "estimated_compounding_fine_inr": 0,
                "declarations": {},
                "violations": [],
            },
        },
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 500


def test_export_report_docx():
    response = client.post("/api/v1/report/export", headers={"X-Mock-Role": "ADMIN"},
        json={
            "scan_id": "TEST-001",
            "export_type": "docx",
            "scan_data": {
                "scan_id": "TEST-001",
                "timestamp": "2026-08-29T20:00:00Z",
                "compliance_score": 95,
                "status": "COMPLIANT",
            },
        },
    )
    assert response.status_code == 200
    assert "wordprocessingml" in response.headers["content-type"]
    assert len(response.content) > 500


def test_export_report_csv():
    response = client.post("/api/v1/report/export", headers={"X-Mock-Role": "ADMIN"},
        json={
            "scan_id": "TEST-001",
            "export_type": "csv",
            "scan_data": {
                "scan_id": "TEST-001",
                "timestamp": "2026-08-29T20:00:00Z",
                "compliance_score": 95,
                "status": "COMPLIANT",
            },
        },
    )
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert "TEST-001" in response.text
