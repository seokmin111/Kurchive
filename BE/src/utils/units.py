from typing import Optional
from sqlalchemy.orm import Session
from BE.src.models.recipes import Unit, UnitConversion


# 함수
def get_conversion_coefficient(db, from_unit_name: str, to_unit_name: str) -> Optional[float]:
    """
    unit_name(문자열) 기반으로 from/to Unit을 찾고
    unit_conversions 테이블에서 coefficient를 반환.
    - from_unit × coefficient = to_unit
    """
    # 같은 단위면 coefficient = 1
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

def convert_unit(db, ingredient, qty, from_unit_name: str, to_unit_id: int):
    """
    단위 변환:
    1. 같은 type (weight->weight, volume->volume) => unit_conversions 테이블
    2. count -> weight/volume: average_weight 또는 average_volume 기반
    3. weight <-> volume: density 기반
    """
    # 목표 단위 정보
    to_unit = db.query(Unit).filter(Unit.id == to_unit_id).first()
    if not to_unit:
        return qty, from_unit_name

    # 단위가 같으면 그대로
    if to_unit.unit_name == from_unit_name:
        return qty, from_unit_name

    # 현재 단위 타입 추론 (단순화)
    if from_unit_name in ["g", "kg"]:
        from_type = "weight"
    elif from_unit_name in ["ml", "L"]:
        from_type = "volume"
    else:
        from_type = "count"

    to_type = to_unit.unit_type

    # -------------------------
    # 1. count -> weight 변환
    # -------------------------
    if from_type == "count" and to_type == "weight" and getattr(ingredient, "average_weight", None):
        # 1개 -> g
        grams = qty * ingredient.average_weight
        # g -> 목표 단위 (unit_conversions 이용)
        if to_unit.unit_name == "g":
            return grams, "g"

        coeff = get_conversion_coefficient(db, "g", to_unit.unit_name)
        if coeff:
            return grams * coeff, to_unit.unit_name


    # -------------------------
    # 2. 같은 타입 간 변환 (weight->weight, volume->volume)
    # -------------------------
    if from_type == to_type:
        coeff = get_conversion_coefficient(db, from_unit_name, to_unit.unit_name)
        if coeff:
            return qty * coeff, to_unit.unit_name

    # -------------------------
    # 3. weight <-> volume (density)
    # -------------------------
    if from_type == "weight" and to_type == "volume" and getattr(ingredient, "density", None):
        ml = qty / ingredient.density  # g -> ml
        coeff = get_conversion_coefficient(db, "ml", to_unit.unit_name)
        if coeff:
            return ml * coeff, to_unit.unit_name
        return ml, "ml"

    if from_type == "volume" and to_type == "weight" and getattr(ingredient, "density", None):
        g = qty * ingredient.density  # ml -> g
        coeff = get_conversion_coefficient(db, "g", to_unit.unit_name)
        if coeff:
            return g * coeff, to_unit.unit_name
        return g, "g"

    # -------------------------
    # 변환 실패 -> 원래 단위 그대로
    # -------------------------
    return qty, from_unit_name
