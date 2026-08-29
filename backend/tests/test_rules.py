import pytest
from app.core.rules_engine import (
    extract_pin_code,
    extract_country_of_origin,
    extract_mfg_date,
    extract_consumer_care,
    extract_mrp,
    extract_net_quantity,
    evaluate_statutory_compliance,
)


def test_extract_pin_code():
    assert extract_pin_code("Manufactured at 5/1A Hungerford St, Kolkata - 700017")[0] is True
    assert extract_pin_code("Manufactured at 5/1A Hungerford St, Kolkata - 700017")[1] == "700017"
    assert extract_pin_code("No pin code in this string")[0] is False


def test_extract_country_of_origin():
    assert extract_country_of_origin("Country of Origin: India")[0] is True
    assert extract_country_of_origin("Made in India")[0] is True
    assert extract_country_of_origin("Random text without origin")[0] is False


def test_extract_mfg_date():
    assert extract_mfg_date("PKD: 07/2026")[0] is True
    assert extract_mfg_date("Date of Mfg: Aug 2026")[0] is True


def test_extract_consumer_care():
    res = extract_consumer_care("For feedback call 1800-425-444 or email feedback@britannia.com")
    assert res["present"] is True
    assert res["phone"] is not None
    assert res["email"] == "feedback@britannia.com"


def test_extract_mrp_syntax():
    # Compliant MRP
    res1 = extract_mrp("MRP Rs. 20.00 (incl. of all taxes)")
    assert res1["present"] is True
    assert res1["declared_price"] == 20.0
    assert res1["has_inclusive_of_taxes_tag"] is True

    # Non-compliant MRP (missing statutory tax phrase)
    res2 = extract_mrp("MRP Rs. 50.00")
    assert res2["present"] is True
    assert res2["has_inclusive_of_taxes_tag"] is False


def test_extract_net_quantity():
    res = extract_net_quantity("Net Qty: 100 g")
    assert res["present"] is True
    assert res["declared_value"] == 100.0
    assert res["unit"] == "g"


def test_evaluate_compliance_full_pass():
    sample_text = """
    Britannia Industries Ltd, 5/1A Hungerford Street, Kolkata - 700017
    Country of Origin: India
    PKD: 07/2026
    For consumer care contact 1800425444 or care@britannia.com
    Net Quantity: 100 g
    MRP Rs. 20.00 (incl. of all taxes)
    """
    result = evaluate_statutory_compliance(
        extracted_text=sample_text,
        package_height_mm=100.0,
        package_width_mm=50.0,
        container_type="rectangular",
        category="biscuits",
    )
    assert result["compliance_score"] >= 90
    assert result["status"] == "COMPLIANT"
    assert result["rule_checklist"]["rule_6_mandatory_fields"] is True
    assert result["rule_checklist"]["rule_6_1_e_mrp_syntax"] is True


def test_evaluate_compliance_deceptive_terms():
    sample_text = """
    XYZ Limited, Industrial Estate - 560001, India
    Net Quantity: Approx 100 g
    MRP Rs. 20.00 (incl. of all taxes)
    """
    result = evaluate_statutory_compliance(
        extracted_text=sample_text,
        package_height_mm=100.0,
        package_width_mm=50.0,
        container_type="rectangular",
    )
    assert result["deceptive_terms"]["detected"] is True
    assert result["rule_checklist"]["rule_12_deceptive_terms"] is False
    assert result["compliance_score"] < 100
