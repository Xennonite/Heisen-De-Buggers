import math
from typing import Tuple, Dict, Any


def calculate_pdp_area(
    height_mm: float,
    width_mm: float,
    container_type: str = "rectangular",
    depth_mm: float = 0.0,
    diameter_mm: float = 0.0,
    circumference_mm: float = 0.0,
    surface_area_cm2: float = 0.0,
) -> float:
    """
    Calculates the Principal Display Panel (PDP) Surface Area (A) in cm²
    under Rule 7(4) of the Legal Metrology (Packaged Commodities) Rules, 2011.
    """
    container_type = container_type.lower().strip()

    if container_type == "cylindrical":
        # Rule 7(4)(b): Cylindrical or nearly cylindrical container:
        # A = 40% of (Height * Circumference)
        if circumference_mm > 0:
            c = circumference_mm
        elif diameter_mm > 0:
            c = math.pi * diameter_mm
        else:
            # Fallback: width is treated as diameter
            c = math.pi * width_mm
        
        area_mm2 = 0.40 * height_mm * c
        return round(area_mm2 / 100.0, 2)

    elif container_type == "irregular":
        # Rule 7(4)(c): Irregular or other shapes:
        # A = 40% of Total Package Surface Area
        if surface_area_cm2 > 0:
            return round(0.40 * surface_area_cm2, 2)
            
        # Fallback approximation: 2*(H*W + W*D + H*D)
        d = depth_mm if depth_mm > 0 else width_mm * 0.5
        total_surface_mm2 = 2.0 * (height_mm * width_mm + width_mm * d + height_mm * d)
        area_mm2 = 0.40 * total_surface_mm2
        return round(area_mm2 / 100.0, 2)

    else:
        # Rule 7(4)(a): Rectangular container:
        # A = Height * Width
        area_mm2 = height_mm * width_mm
        return round(area_mm2 / 100.0, 2)


def get_required_font_height(pdp_area_cm2: float, is_blown_or_molded: bool = False) -> float:
    """
    Computes minimum statutory font height (in mm) as mandated by Rule 7(2) Table-I.
    """
    if pdp_area_cm2 <= 50.0:
        return 1.5 if is_blown_or_molded else 1.0
    elif pdp_area_cm2 <= 100.0:
        return 3.0 if is_blown_or_molded else 1.5
    elif pdp_area_cm2 <= 500.0:
        return 4.0 if is_blown_or_molded else 2.5
    elif pdp_area_cm2 <= 2500.0:
        return 6.0 if is_blown_or_molded else 4.0
    else:
        return 6.0


def compute_scale_factor(package_height_px: float, package_height_mm: float) -> float:
    """
    Calculates the Metric Scale Ratio S (pixels per mm).
    S = Package Height (pixels) / Package Height (mm)
    """
    if package_height_mm <= 0:
        raise ValueError("Package height in mm must be strictly positive.")
    return package_height_px / package_height_mm


def pixels_to_mm(pixels: float, scale_factor: float) -> float:
    """
    Converts pixel measurement to physical millimeters using scale factor.
    """
    if scale_factor <= 0:
        return 0.0
    return round(pixels / scale_factor, 2)


def mm_to_pixels(mm: float, scale_factor: float) -> int:
    """
    Converts physical millimeters to pixel measurement using scale factor.
    """
    return int(round(mm * scale_factor))


def validate_character_aspect_ratio(
    char_width_mm: float, char_height_mm: float, character: str = ""
) -> bool:
    """
    Enforces Rule 7(3): Character width must be >= 1/3 of character height.
    Exempt characters: numeral '1', letters 'i', 'I', 'l'.
    """
    if character in ["1", "i", "I", "l", "|", "!", "."]:
        return True
    if char_height_mm <= 0:
        return True
    return (char_width_mm / char_height_mm) >= (1.0 / 3.0)
