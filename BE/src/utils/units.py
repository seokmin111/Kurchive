from typing import Optional
from sqlalchemy.orm import Session
from BE.src.models.recipes import Unit, UnitConversion

# 단위 변환 계수 계산
def get_conversion_coefficient(db, from_unit_name: str, to_unit_name: str) -> Optional[float]:
    if from_unit_name == to_unit_name:
        return 1.0

    from_unit = db.query(Unit).filter(Unit.unit_name == from_unit_name).first()
    to_unit = db.query(Unit).filter(Unit.unit_name == to_unit_name).first()
    if not from_unit or not to_unit:
        return None

    # 정방향 변환
    conversion = db.query(UnitConversion).filter(
        UnitConversion.from_unit_id == from_unit.unit_id,
        UnitConversion.to_unit_id == to_unit.unit_id
    ).first()
    if conversion:
        return conversion.coefficient

    # 역방향 변환
    reverse_conversion = db.query(UnitConversion).filter(
        UnitConversion.from_unit_id == to_unit.unit_id,
        UnitConversion.to_unit_id == from_unit.unit_id
    ).first()
    if reverse_conversion and reverse_conversion.coefficient:
        return 1 / reverse_conversion.coefficient

    return None


# 간접 단위 변환
def convert_via_intermediate_unit(db, qty, from_unit_name, to_unit_name, intermediate_unit="ml"):
    # intermediate_unit이 from이나 to와 같으면 1.0 처리
    to_intermediate = 1.0 if from_unit_name == intermediate_unit else get_conversion_coefficient(db, from_unit_name, intermediate_unit)
    from_intermediate = 1.0 if to_unit_name == intermediate_unit else get_conversion_coefficient(db, intermediate_unit, to_unit_name)

    if to_intermediate is not None and from_intermediate is not None:
        return qty * to_intermediate * from_intermediate, to_unit_name
    return None

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
    def type_of(db, unit_name: str):
        unit = db.query(Unit).filter(Unit.unit_name == unit_name).first()
        return unit.unit_type if unit else None


    from_type = type_of(db, from_unit_name)
    to_type = type_of(db, to_unit_name)

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

        # 간접 변환 시도 (예: tbsp -> ml -> tsp)
        via = convert_via_intermediate_unit(db, qty, from_unit_name, to_unit_name)
        if via:
            return via


   # 3. weight <-> volume
    if from_type == "weight" and to_type == "volume" and getattr(ingredient, "density", None):
        # g → ml
        ml_value = qty / ingredient.density
        if to_unit_name == "ml":
            return ml_value, "ml"
        coeff = get_conversion_coefficient(db, "ml", to_unit_name)
        if coeff:
            return ml_value * coeff, to_unit_name

    if from_type == "volume" and to_type == "weight" and getattr(ingredient, "density", None):
        # 먼저 from_unit → ml 변환
        coeff = get_conversion_coefficient(db, from_unit_name, "ml")
        if coeff:
            ml_value = qty * coeff
        else:
            ml_value = qty  # 이미 ml일 경우 그대로

        # ml → g
        g_value = ml_value * ingredient.density

        if to_unit_name == "g":
            return g_value, "g"
        coeff2 = get_conversion_coefficient(db, "g", to_unit_name)
        if coeff2:
            return g_value * coeff2, to_unit_name


    # 변환 실패
    return qty, from_unit_name
