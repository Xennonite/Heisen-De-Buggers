with open("docs/DEVELOPER_GUIDE.md", "r") as f:
    text = f.read()

# 1. Clearance Buffer
text = text.replace(
    "- **Horizontal Clearance (Left/Right):** Free space $\ge 2.0 \\times h$",
    "- **Horizontal Clearance (Left/Right):** Free space $\ge 1.0 \\times h$ (Reduced from 2.0x for visual clarity)"
)
text = text.replace(
    "\\text{Clearance Bounding Box} = [x - 2h, \\; y - h, \\; w + 4h, \\; h + 2h]",
    "\\text{Clearance Bounding Box} = [x - h, \\; y - h, \\; w + 2h, \\; h + 2h]"
)

# 2. OCR Wrapper
text = text.replace(
    "- `run_ocr(image_bgr, scale_factor, required_font_height_mm)`: Extracts text tokens, computes bounding box heights in millimeters, and flags font compliance.",
    "- `run_ocr(image_bgr, scale_factor, required_font_height_mm, is_metallic_surface)`: Uses **PaddleOCR** to extract text tokens. Features an automatic downscaling pipeline (`max_dim=600px`) for metallic surfaces to fuse disconnected dot-matrix text on high-res images, before inversely scaling bounding boxes."
)

# 3. API Data Contracts
old_api_req = """- `file`: Image file (`.jpg`, `.png`)
- `package_height_mm`: float (e.g. `150.0`)
- `package_width_mm`: float (e.g. `80.0`)
- `package_depth_mm`: float (optional, e.g. `30.0`)
- `container_type`: string (`"rectangular"` | `"cylindrical"` | `"irregular"`)
- `category`: string (`"biscuits"` | `"tea"` | `"soap"` | `"edible_oil"` | `"general"`)"""

new_api_req = """- `files`: Array of image files (`.jpg`, `.png`) for multi-surface scanning
- `package_height_mm`: float (e.g. `150.0`)
- `package_width_mm`: float (e.g. `80.0`)
- `package_depth_mm`: float (optional, e.g. `30.0`)
- `container_type`: string (`"rectangular"` | `"cylindrical"` | `"irregular"`)
- `category`: string (`"biscuits"` | `"tea"` | `"soap"` | `"edible_oil"` | `"general"`)"""

old_api_res = """"pdp_area_cm2": 120.0,
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
  "clearance_zone": { ... },
  "deceptive_terms": { ... },
  "violations": [ ... ],
  "bounding_boxes": [ ... ],
  "barcodes": [ ... ]"""

new_api_res = """"pdp_area_cm2": 120.0,
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
  ]"""

text = text.replace(old_api_req, new_api_req)
text = text.replace(old_api_res, new_api_res)

with open("docs/DEVELOPER_GUIDE.md", "w") as f:
    f.write(text)
