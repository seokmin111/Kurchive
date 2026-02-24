from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from BE.src.models.recipes import Unit, UnitConversion

# 단위 변환 계수 계산
async def get_conversion_coefficient(db: AsyncSession, from_unit_name: str, to_unit_name: str) -> Optional[float]:
    if from_unit_name == to_unit_name:
        return 1.0

    # from/to 유닛 조회
    from_unit_result = await db.execute(select(Unit).filter(Unit.unit_name == from_unit_name))
    from_unit = from_unit_result.scalar_one_or_none()

    to_unit_result = await db.execute(select(Unit).filter(Unit.unit_name == to_unit_name))
    to_unit = to_unit_result.scalar_one_or_none()

    if not from_unit or not to_unit:
        return None

    # 정방향 변환
    conversion_result = await db.execute(
        select(UnitConversion).filter(
            UnitConversion.from_unit_id == from_unit.unit_id,
            UnitConversion.to_unit_id == to_unit.unit_id
        )
    )
    conversion = conversion_result.scalar_one_or_none()
    if conversion:
        return conversion.coefficient

    # 역방향 변환
    reverse_result = await db.execute(
        select(UnitConversion).filter(
            UnitConversion.from_unit_id == to_unit.unit_id,
            UnitConversion.to_unit_id == from_unit.unit_id
        )
    )
    reverse_conversion = reverse_result.scalar_one_or_none()
    if reverse_conversion and reverse_conversion.coefficient:
        return 1 / reverse_conversion.coefficient

    return None


# 간접 단위 변환
async def convert_via_intermediate_unit(db: AsyncSession, qty, from_unit_name, to_unit_name, intermediate_unit="ml"):
    to_intermediate = 1.0 if from_unit_name == intermediate_unit else await get_conversion_coefficient(db, from_unit_name, intermediate_unit)
    from_intermediate = 1.0 if to_unit_name == intermediate_unit else await get_conversion_coefficient(db, intermediate_unit, to_unit_name)

    if to_intermediate is not None and from_intermediate is not None:
        return qty * to_intermediate * from_intermediate, to_unit_name
    return None


async def convert_unit(db: AsyncSession, ingredient, qty, from_unit_name: str, to_unit_name: str):
    """
    단위 변환 (비동기):
    - 같은 단위면 그대로
    - 같은 타입 weight/volume → unit_conversions 이용
    - count → weight/volume : average_weight
    - weight <-> volume : density
    """
    if to_unit_name == from_unit_name:
        return qty, from_unit_name

    # 단위 타입 판정
    async def type_of(db: AsyncSession, unit_name: str):
        result = await db.execute(select(Unit).filter(Unit.unit_name == unit_name))
        unit = result.scalar_one_or_none()
        return unit.unit_type if unit else None

    from_type = await type_of(db, from_unit_name)
    to_type = await type_of(db, to_unit_name)

    # 1. count -> weight
    if from_type == "count" and to_type == "weight" and getattr(ingredient, "average_weight", None):
        grams = qty * ingredient.average_weight
        if to_unit_name == "g":
            return grams, "g"
        coeff = await get_conversion_coefficient(db, "g", to_unit_name)
        if coeff:
            return grams * coeff, to_unit_name

    # 2. 같은 타입 변환
    if from_type == to_type:
        coeff = await get_conversion_coefficient(db, from_unit_name, to_unit_name)
        if coeff:
            return qty * coeff, to_unit_name

        via = await convert_via_intermediate_unit(db, qty, from_unit_name, to_unit_name)
        if via:
            return via

    # 3. weight -> volume
    if from_type == "weight" and to_type == "volume" and getattr(ingredient, "density", None):
        ml_value = qty / ingredient.density
        if to_unit_name == "ml":
            return ml_value, "ml"
        coeff = await get_conversion_coefficient(db, "ml", to_unit_name)
        if coeff:
            return ml_value * coeff, to_unit_name

    # 4. volume -> weight
    if from_type == "volume" and to_type == "weight" and getattr(ingredient, "density", None):
        # 먼저 ml 변환
        coeff = await get_conversion_coefficient(db, from_unit_name, "ml")
        if coeff:
            ml_value = qty * coeff
        else:
            ml_value = qty  # 이미 ml일 경우

        g_value = ml_value * ingredient.density

        if to_unit_name == "g":
            return g_value, "g"
        coeff2 = await get_conversion_coefficient(db, "g", to_unit_name)
        if coeff2:
            return g_value * coeff2, to_unit_name
    # 5. weight에서 count
    if from_type == "weight" and to_type == "count" and getattr(ingredient, "average_weight", None):
        # 먼저 g로 맞추기
        if from_unit_name == "g":
            grams = qty
        else:
            coeff = await get_conversion_coefficient(db, from_unit_name, "g")
            if not coeff:
                return qty, from_unit_name
            grams = qty * coeff

        # 개수 계산
        count = grams / ingredient.average_weight

        # "개"로 가려는 경우 그대로
        if to_unit_name == "개":
            return count, "개"

        # count 타입 단위들 사이 변환(예: 개 <-> 쪽 같은 걸 unit_conversions에 넣어둔 경우)
        coeff2 = await get_conversion_coefficient(db, "개", to_unit_name)
        if coeff2:
            return count * coeff2, to_unit_name

        return count, to_unit_name
    # 변환 실패 → 원래 값 반환
    return qty, from_unit_name


