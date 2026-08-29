import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(String(50), unique=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    package_height_mm = Column(Float)
    package_width_mm = Column(Float)
    package_depth_mm = Column(Float, nullable=True)
    container_type = Column(String(30), default="rectangular")
    category = Column(String(50), default="general")
    pdp_area_cm2 = Column(Float)
    required_font_height_mm = Column(Float)
    compliance_score = Column(Integer)
    status = Column(String(30))  # COMPLIANT | PARTIALLY_COMPLIANT | NON_COMPLIANT
    estimated_compounding_fine_inr = Column(Integer, default=0)
    image_filename = Column(String(255), nullable=True)
    
    # Store full JSON payload for rapid retrieval
    audit_data_json = Column(Text)

    def to_dict(self):
        return {
            "id": self.id,
            "scan_id": self.scan_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "package_height_mm": self.package_height_mm,
            "package_width_mm": self.package_width_mm,
            "container_type": self.container_type,
            "category": self.category,
            "pdp_area_cm2": self.pdp_area_cm2,
            "required_font_height_mm": self.required_font_height_mm,
            "compliance_score": self.compliance_score,
            "status": self.status,
            "estimated_compounding_fine_inr": self.estimated_compounding_fine_inr,
            "image_filename": self.image_filename,
            "data": json.loads(self.audit_data_json) if self.audit_data_json else {},
        }
