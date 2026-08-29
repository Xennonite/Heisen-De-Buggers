import pytest
from app.vision.spatial_scaler import (
    calculate_pdp_area,
    get_required_font_height,
    compute_scale_factor,
    pixels_to_mm,
    validate_character_aspect_ratio,
)


def test_calculate_pdp_area_rectangular():
    # Height = 200mm, Width = 120mm -> Area = 240.0 cm²
    area = calculate_pdp_area(height_mm=200.0, width_mm=120.0, container_type="rectangular")
    assert area == 240.0


def test_calculate_pdp_area_cylindrical():
    # Height = 150mm, Diameter = 80mm -> C = pi * 80 -> A = 0.40 * 150 * (pi * 80) / 100
    area = calculate_pdp_area(height_mm=150.0, width_mm=80.0, container_type="cylindrical", diameter_mm=80.0)
    assert 140.0 <= area <= 160.0


def test_calculate_pdp_area_irregular():
    # Height = 100mm, Width = 50mm, Depth = 40mm
    area = calculate_pdp_area(height_mm=100.0, width_mm=50.0, container_type="irregular", depth_mm=40.0)
    assert area > 0


def test_get_required_font_height_table_1():
    # Under Rule 7(2) Table-I:
    assert get_required_font_height(30.0) == 1.0   # <= 50 cm²
    assert get_required_font_height(50.0) == 1.0
    assert get_required_font_height(75.0) == 1.5   # 50 < A <= 100
    assert get_required_font_height(240.0) == 2.5  # 100 < A <= 500
    assert get_required_font_height(1000.0) == 4.0 # 500 < A <= 2500
    assert get_required_font_height(3000.0) == 6.0 # > 2500


def test_compute_scale_factor_and_pixels_to_mm():
    # 800 px image height for 200 mm physical package -> Scale = 4.0 px/mm
    scale = compute_scale_factor(package_height_px=800.0, package_height_mm=200.0)
    assert scale == 4.0

    # 10 px height -> 2.5 mm
    mm_val = pixels_to_mm(pixels=10.0, scale_factor=scale)
    assert mm_val == 2.5


def test_character_aspect_ratio():
    # Width must be >= 1/3 Height
    assert validate_character_aspect_ratio(char_width_mm=1.0, char_height_mm=3.0) is True
    assert validate_character_aspect_ratio(char_width_mm=0.5, char_height_mm=3.0) is False
    # Exempt characters ('1', 'i', 'I', 'l')
    assert validate_character_aspect_ratio(char_width_mm=0.2, char_height_mm=3.0, character="1") is True
    assert validate_character_aspect_ratio(char_width_mm=0.2, char_height_mm=3.0, character="l") is True
