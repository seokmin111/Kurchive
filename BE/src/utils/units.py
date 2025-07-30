from typing import Optional
from sqlalchemy.orm import Session
from BE.src.models.recipes import Unit, UnitConversion

def get_conversion_coefficient(db, from_unit_name: str, to_unit_name: str) -> Optional[float]:
    if from_unit_name == to_unit_name:
        return 1.0

    from_unit = db.query(Unit).filter(Unit.unit_name == from_unit_name).first()
    to_unit = db.query(Unit).filter(Unit.unit_name == to_unit_name).first()
    if not from_unit or not to_unit:
        return None

    conversion = db.query(UnitConversion).filter(
        UnitConversion.from_unit_id == from_unit.id,
        UnitConversion.to_unit_id == to_unit.id
    ).first()

    return conversion.coefficient if conversion else None


def convert_unit(db, ingredient, qty, from_unit_name: str, to_unit_name: str):
    """
    단위 변환:
    - 같은 단위면 그대로
    - 같은 타입 weight/volume → unit_conversions 이용
    - count → weight/volume : average_weight
    - weight <-> volume : density
    """
    # 단위가 같으면 그대로
    if to_unit_name == from_unit_name:
        return qty, from_unit_name

    # 단위 타입 판정
    def type_of(unit_name: str):
        if unit_name in ["g", "kg"]:
            return "weight"
        elif unit_name in ["ml", "L"]:
            return "volume"
        else:
            return "count"

    from_type = type_of(from_unit_name)
    to_type = type_of(to_unit_name)

    # 1. count -> weight
    if from_type == "count" and to_type == "weight" and getattr(ingredient, "average_weight", None):
        grams = qty * ingredient.average_weight
        if to_unit_name == "g":
            return grams, "g"
        coeff = get_conversion_coefficient(db, "g", to_unit_name)
        if coeff:
            return grams * coeff, to_unit_name

    # 2. 같은 타입 변환
    if from_type == to_type:
        coeff = get_conversion_coefficient(db, from_unit_name, to_unit_name)
        if coeff:
            return qty * coeff, to_unit_name

    # 3. weight <-> volume
    if from_type == "weight" and to_type == "volume" and getattr(ingredient, "density", None):
        ml = qty / ingredient.density
        if to_unit_name == "ml":
            return ml, "ml"
        coeff = get_conversion_coefficient(db, "ml", to_unit_name)
        if coeff:
            return ml * coeff, to_unit_name

    if from_type == "volume" and to_type == "weight" and getattr(ingredient, "density", None):
        g = qty * ingredient.density
        if to_unit_name == "g":
            return g, "g"
        coeff = get_conversion_coefficient(db, "g", to_unit_name)
        if coeff:
            return g * coeff, to_unit_name

    # 변환 실패
    return qty, from_unit_name
