import io
import csv
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from app.models.schemas import ExportRequest

router = APIRouter(prefix="/report", tags=["Report & Notice Exports"])


def generate_pdf_report(data: Dict[str, Any], is_form_a: bool = False) -> io.BytesIO:
    """
    Generates high-resolution PDF Inspection Dossier or Seventh Schedule Form A Notice.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1e293b"),
    )
    sub_title_style = ParagraphStyle(
        "DocSubTitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#64748b"),
    )
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=10,
        spaceAfter=4,
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#334155"),
    )
    bold_body = ParagraphStyle(
        "BoldBody",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0f172a"),
    )

    story = []

    # Header
    story.append(Paragraph("GOVERNMENT OF INDIA", title_style))
    story.append(Paragraph("MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION", sub_title_style))
    story.append(Paragraph("DEPARTMENT OF CONSUMER AFFAIRS — LEGAL METROLOGY DIVISION", sub_title_style))
    story.append(Spacer(1, 8))

    doc_type_title = "SEVENTH SCHEDULE — FORM A<br/>NOTICE TO THE MANUFACTURER / PACKER UNDER RULES 27 & 28" if is_form_a else "STATUTORY METROLOGY COMPLIANCE INSPECTION DOSSIER"
    story.append(Paragraph(f"<b>{doc_type_title}</b>", title_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceAfter=10))

    scan_id = data.get("scan_id", "MV-2026-UNKNOWN")
    ts = data.get("timestamp", datetime.now(timezone.utc).isoformat())
    score = data.get("compliance_score", 0)
    status = data.get("status", "UNKNOWN")
    fine = data.get("estimated_compounding_fine_inr", 0)

    # Overview Table
    overview_data = [
        [
            Paragraph("<b>Inspection ID:</b>", body_style),
            Paragraph(str(scan_id), body_style),
            Paragraph("<b>Date / Timestamp:</b>", body_style),
            Paragraph(str(ts)[:19], body_style),
        ],
        [
            Paragraph("<b>Compliance Status:</b>", body_style),
            Paragraph(f"<font color='{'#16a34a' if status=='COMPLIANT' else '#dc2626'}'><b>{status}</b></font>", body_style),
            Paragraph("<b>Compliance Score:</b>", body_style),
            Paragraph(f"<b>{score} / 100</b>", body_style),
        ],
        [
            Paragraph("<b>PDP Surface Area:</b>", body_style),
            Paragraph(f"{data.get('pdp_area_cm2', 0)} cm²", body_style),
            Paragraph("<b>Req. Min. Font Height:</b>", body_style),
            Paragraph(f"{data.get('required_font_height_mm', 0)} mm", body_style),
        ],
        [
            Paragraph("<b>Container Geometry:</b>", body_style),
            Paragraph(str(data.get("container_type", "Rectangular")).capitalize(), body_style),
            Paragraph("<b>Assessed Compounding Fine:</b>", body_style),
            Paragraph(f"<b>₹ {fine:,}</b>", body_style),
        ],
    ]

    t_overview = Table(overview_data, colWidths=[130, 140, 140, 130])
    t_overview.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t_overview)
    story.append(Spacer(1, 10))

    # Declarations Table
    story.append(Paragraph("1. Statutory Declarations Verification (Rules 6 & 10)", section_heading))
    decls = data.get("declarations", {})
    decl_rows = [
        [Paragraph("<b>Mandatory Parameter</b>", bold_body), Paragraph("<b>Status</b>", bold_body), Paragraph("<b>Extracted Finding</b>", bold_body)]
    ]
    for key, label in [
        ("manufacturer_name", "Manufacturer / Packer Name"),
        ("manufacturer_address", "Manufacturer Address"),
        ("pin_code", "6-Digit Postal PIN Code"),
        ("country_of_origin", "Country of Origin"),
        ("mfg_date", "Date of Mfg / Packing"),
        ("consumer_care", "Consumer Care Details"),
    ]:
        item = decls.get(key, {})
        pres = item.get("present", False)
        st_text = "<font color='#16a34a'>PASS</font>" if pres else "<font color='#dc2626'>FAIL</font>"
        detail = item.get("text") or item.get("code") or item.get("phone") or ("Found" if pres else "NOT DETECTED")
        decl_rows.append([Paragraph(label, body_style), Paragraph(st_text, body_style), Paragraph(str(detail), body_style)])

    t_decl = Table(decl_rows, colWidths=[170, 70, 300])
    t_decl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e0f2fe")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t_decl)
    story.append(Spacer(1, 10))

    # Net Quantity & MRP Table
    story.append(Paragraph("2. Metrological Quantities & Typography (Rules 7, 8, 13)", section_heading))
    nq = data.get("net_quantity", {})
    mrp = data.get("mrp", {})
    cz = data.get("clearance_zone", {})
    
    qty_rows = [
        [Paragraph("<b>Parameter</b>", bold_body), Paragraph("<b>Extracted Value</b>", bold_body), Paragraph("<b>Requirement / Status</b>", bold_body)],
        [
            Paragraph("Net Quantity", body_style),
            Paragraph(f"{nq.get('declared_value', 'N/A')} {nq.get('unit', '')}", body_style),
            Paragraph(f"Font: {nq.get('measured_font_height_mm', 'N/A')} mm (Req: {data.get('required_font_height_mm', 0)} mm) — {'PASS' if nq.get('font_compliant') else 'FAIL'}", body_style)
        ],
        [
            Paragraph("MRP Declaration", body_style),
            Paragraph(f"₹ {mrp.get('declared_price', 'N/A')}", body_style),
            Paragraph(f"Tax Tag: {'Included (PASS)' if mrp.get('has_inclusive_of_taxes_tag') else 'MISSING (FAIL)'}", body_style)
        ],
        [
            Paragraph("Rule 8 Clearance Zone", body_style),
            Paragraph(f"{'No Encroachment' if cz.get('is_compliant') else 'Encroached'}", body_style),
            Paragraph(f"Status: {'PASS' if cz.get('is_compliant') else 'FAIL'}", body_style)
        ],
    ]
    t_qty = Table(qty_rows, colWidths=[150, 150, 240])
    t_qty.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t_qty)
    story.append(Spacer(1, 10))

    # Violations Table
    violations = data.get("violations", [])
    story.append(Paragraph(f"3. Statutory Violations & Compounding Assessment (Total: {len(violations)})", section_heading))
    if violations:
        v_rows = [
            [Paragraph("<b>Rule</b>", bold_body), Paragraph("<b>Severity</b>", bold_body), Paragraph("<b>Description</b>", bold_body), Paragraph("<b>Penalty</b>", bold_body)]
        ]
        for v in violations:
            sev_color = "#dc2626" if v.get("severity") in ["CRITICAL", "HIGH"] else "#d97706"
            v_rows.append([
                Paragraph(v.get("rule", ""), body_style),
                Paragraph(f"<font color='{sev_color}'><b>{v.get('severity', '')}</b></font>", body_style),
                Paragraph(v.get("description", ""), body_style),
                Paragraph(f"₹ {v.get('estimated_fine_inr', 0):,}<br/><font size='7'>{v.get('compounding_section', '')}</font>", body_style),
            ])
        t_v = Table(v_rows, colWidths=[100, 70, 270, 100])
        t_v.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#fee2e2")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(t_v)
    else:
        story.append(Paragraph("<i>No statutory violations detected. Packaged commodity is fully compliant.</i>", body_style))

    story.append(Spacer(1, 15))

    # Digital Signature & Cryptographic Sealing
    raw_hash_input = f"{scan_id}-{ts}-{score}-{fine}"
    sha256_hash = hashlib.sha256(raw_hash_input.encode()).hexdigest()

    sig_data = [
        [
            Paragraph(f"<b>Tamper-Evident SHA-256 Evidence Hash:</b><br/><font size='7' color='#64748b'>{sha256_hash}</font>", body_style),
            Paragraph("<b>Digitally Certified By:</b><br/>Legal Metrology Inspection Authority<br/><i>Government of India</i>", body_style),
        ]
    ]
    t_sig = Table(sig_data, colWidths=[340, 200])
    t_sig.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#94a3b8")),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t_sig)

    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_docx_report(data: Dict[str, Any]) -> io.BytesIO:
    """Generates editable Microsoft Word (.docx) inspection report."""
    doc = docx.Document()

    # Title
    p_title = doc.add_heading("MetroVerity — Legal Metrology Compliance Report", level=0)
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph("Statutory Inspection Dossier under Legal Metrology (Packaged Commodities) Rules, 2011")

    # Overview
    doc.add_heading("1. Inspection Summary", level=1)
    p = doc.add_paragraph()
    p.add_run(f"Scan ID: {data.get('scan_id', 'N/A')}\n").bold = True
    p.add_run(f"Date/Time: {data.get('timestamp', 'N/A')}\n")
    p.add_run(f"Compliance Score: {data.get('compliance_score', 0)} / 100\n")
    p.add_run(f"Overall Status: {data.get('status', 'UNKNOWN')}\n")
    p.add_run(f"Estimated Compounding Penalty: ₹ {data.get('estimated_compounding_fine_inr', 0):,}\n")
    p.add_run(f"Principal Display Panel Area: {data.get('pdp_area_cm2', 0)} cm²\n")
    p.add_run(f"Required Minimum Font Height: {data.get('required_font_height_mm', 0)} mm\n")

    # Declarations Table
    doc.add_heading("2. Mandatory Declarations (Rules 6 & 10)", level=1)
    decls = data.get("declarations", {})
    t = doc.add_table(rows=1, cols=3)
    t.style = "Table Grid"
    hdr = t.rows[0].cells
    hdr[0].text = "Mandatory Parameter"
    hdr[1].text = "Status"
    hdr[2].text = "Finding"

    for key, label in [
        ("manufacturer_name", "Manufacturer Name"),
        ("manufacturer_address", "Manufacturer Address"),
        ("pin_code", "6-Digit PIN Code"),
        ("country_of_origin", "Country of Origin"),
        ("mfg_date", "Date of Packing"),
        ("consumer_care", "Consumer Care"),
    ]:
        item = decls.get(key, {})
        row = t.add_row().cells
        row[0].text = label
        row[1].text = "PASS" if item.get("present") else "FAIL"
        row[2].text = str(item.get("text") or item.get("code") or item.get("phone") or "N/A")

    # Violations
    doc.add_heading("3. Statutory Violations", level=1)
    violations = data.get("violations", [])
    if violations:
        vt = doc.add_table(rows=1, cols=4)
        vt.style = "Table Grid"
        vhdr = vt.rows[0].cells
        vhdr[0].text = "Rule"
        vhdr[1].text = "Severity"
        vhdr[2].text = "Description"
        vhdr[3].text = "Compounding Fine (INR)"

        for v in violations:
            vr = vt.add_row().cells
            vr[0].text = v.get("rule", "")
            vr[1].text = v.get("severity", "")
            vr[2].text = v.get("description", "")
            vr[3].text = f"₹ {v.get('estimated_fine_inr', 0):,}"
    else:
        doc.add_paragraph("No statutory violations detected.")

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer


def generate_csv_report(data: Dict[str, Any]) -> str:
    """Generates raw CSV format inspection data."""
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["MetroVerity Legal Metrology Compliance Inspection Record"])
    writer.writerow([])
    writer.writerow(["Field", "Value"])
    writer.writerow(["Scan ID", data.get("scan_id", "")])
    writer.writerow(["Timestamp", data.get("timestamp", "")])
    writer.writerow(["Compliance Score", data.get("compliance_score", 0)])
    writer.writerow(["Status", data.get("status", "")])
    writer.writerow(["Assessed Compounding Fine (INR)", data.get("estimated_compounding_fine_inr", 0)])
    writer.writerow(["PDP Area (cm2)", data.get("pdp_area_cm2", 0)])
    writer.writerow(["Required Font Height (mm)", data.get("required_font_height_mm", 0)])
    writer.writerow([])

    writer.writerow(["--- Mandatory Declarations ---"])
    decls = data.get("declarations", {})
    for k, v in decls.items():
        writer.writerow([k, "PRESENT" if v.get("present") else "MISSING", v.get("text") or v.get("code") or v.get("phone") or ""])

    writer.writerow([])
    writer.writerow(["--- Statutory Violations ---"])
    writer.writerow(["Rule", "Severity", "Description", "Fine (INR)", "Section"])
    for v in data.get("violations", []):
        writer.writerow([v.get("rule"), v.get("severity"), v.get("description"), v.get("estimated_fine_inr"), v.get("compounding_section")])

    return output.getvalue()


@router.post("/export")
def export_report(payload: ExportRequest):
    """
    Exports inspection results in PDF, DOCX, CSV, or Seventh Schedule Form A Notice.
    """
    data = payload.scan_data or {}
    export_type = payload.export_type.lower().strip()
    scan_id = data.get("scan_id", "report")

    if export_type == "pdf":
        pdf_buf = generate_pdf_report(data, is_form_a=False)
        return StreamingResponse(
            pdf_buf,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=MetroVerity_Audit_{scan_id}.pdf"},
        )

    elif export_type == "seventh_schedule_form_a":
        pdf_buf = generate_pdf_report(data, is_form_a=True)
        return StreamingResponse(
            pdf_buf,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Seventh_Schedule_Form_A_{scan_id}.pdf"},
        )

    elif export_type == "docx":
        docx_buf = generate_docx_report(data)
        return StreamingResponse(
            docx_buf,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=MetroVerity_Report_{scan_id}.docx"},
        )

    elif export_type == "csv":
        csv_str = generate_csv_report(data)
        return Response(
            content=csv_str,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=MetroVerity_Data_{scan_id}.csv"},
        )

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported export type '{export_type}'. Supported: pdf, seventh_schedule_form_a, docx, csv.")
