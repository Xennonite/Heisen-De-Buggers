from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DeclarationDetail(BaseModel):
    present: bool = False
    text: Optional[str] = None
    code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: str = "PASS"  # "PASS" | "FAIL"


class NetQuantityDetail(BaseModel):
    present: bool = False
    declared_value: Optional[float] = None
    unit: Optional[str] = None
    raw_text: Optional[str] = None
    measured_font_height_mm: Optional[float] = None
    font_compliant: bool = True
    status: str = "PASS"


class MrpDetail(BaseModel):
    present: bool = False
    declared_price: Optional[float] = None
    has_inclusive_of_taxes_tag: bool = False
    raw_text: Optional[str] = None
    status: str = "PASS"


class ClearanceZoneDetail(BaseModel):
    is_compliant: bool = True
    encroaching_objects: List[str] = Field(default_factory=list)
    clearance_box: Optional[List[int]] = None  # [x, y, w, h]


class DeceptiveTermsDetail(BaseModel):
    detected: bool = False
    terms_found: List[str] = Field(default_factory=list)


class ViolationDetail(BaseModel):
    rule: str
    severity: str  # "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    description: str
    compounding_section: Optional[str] = None
    estimated_fine_inr: Optional[int] = None


class BoundingBoxItem(BaseModel):
    id: Optional[str] = None
    label: str
    text: Optional[str] = ""
    box_pixels: List[int]  # [x, y, w, h]
    measured_height_mm: float
    required_height_mm: Optional[float] = None
    status: str  # "PASS" | "FAIL" | "WARNING"
    rule_violation: Optional[str] = None
    confidence: Optional[float] = 1.0


class BarcodeItem(BaseModel):
    barcode_type: str
    data: str
    is_valid_gtin: bool = True


class RuleChecklist(BaseModel):
    rule_6_mandatory_fields: bool = True
    rule_6_1_e_mrp_syntax: bool = True
    rule_7_font_height: bool = True
    rule_8_clearance: bool = True
    rule_10_origin_pin: bool = True
    rule_12_deceptive_terms: bool = True
    rule_13_si_units: bool = True
    second_schedule_pack_size: bool = True


class ScanResponse(BaseModel):
    scan_id: str
    timestamp: str
    package_height_mm: float
    package_width_mm: float
    package_depth_mm: Optional[float] = None
    container_type: str
    category: str
    pdp_area_cm2: float
    required_font_height_mm: float
    compliance_score: int
    status: str  # "COMPLIANT" | "PARTIALLY_COMPLIANT" | "NON_COMPLIANT"
    estimated_compounding_fine_inr: int
    rule_checklist: RuleChecklist
    declarations: Dict[str, DeclarationDetail]
    net_quantity: NetQuantityDetail
    mrp: MrpDetail
    clearance_zone: ClearanceZoneDetail
    deceptive_terms: DeceptiveTermsDetail
    units_compliance: Dict[str, Any]
    standard_pack_size: Dict[str, Any]
    violations: List[ViolationDetail]
    bounding_boxes: List[BoundingBoxItem]
    barcodes: List[BarcodeItem] = Field(default_factory=list)
    image_url: Optional[str] = None
    original_dimensions: Dict[str, int] = Field(default_factory=dict)  # {"width": px, "height": px}


class MpeSampleItem(BaseModel):
    sample_id: int
    gross_weight_g: float
    tare_weight_g: float = 0.0
    net_weight_g: float
    deficiency_g: float
    is_defective: bool
    is_zero_tolerance_violation: bool


class MpeTestRequest(BaseModel):
    declared_quantity: float
    unit: str = "g"  # "g" | "ml"
    sample_weights: List[float]  # Net or gross weights
    tare_weight: float = 0.0
    lot_size: int = 32  # 32 or 80 or custom
    commodity_name: Optional[str] = "Packaged Commodity"
    manufacturer_name: Optional[str] = "Unknown Manufacturer"
    inspection_location: Optional[str] = "Inspectorate Lab"


class MpeTestResponse(BaseModel):
    declared_quantity: float
    unit: str
    sample_count: int
    allowed_mpe_value: float
    allowed_mpe_percentage: Optional[float]
    sample_mean: float
    mean_compliant: bool
    defective_units_count: int
    max_allowed_defective_units: int
    defective_count_compliant: bool
    zero_tolerance_limit: float
    zero_tolerance_violations_count: int
    zero_tolerance_compliant: bool
    overall_mpe_compliant: bool
    compounding_fee_section_36_2: int
    samples: List[MpeSampleItem]
    summary_verdict: str


class ExportRequest(BaseModel):
    scan_id: Optional[str] = None
    export_type: str = "pdf"  # "pdf" | "docx" | "csv" | "seventh_schedule_form_a"
    scan_data: Optional[Dict[str, Any]] = None
    mpe_data: Optional[Dict[str, Any]] = None
