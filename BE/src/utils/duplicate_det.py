# BE.src.utils.duplicate_det.py
'''식당 중복 판별 함수 (최적화 버전)'''

import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Tuple

from BE.src.models.restaurants import Restaurant


def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # km

    lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2 +
        math.cos(math.radians(lat1)) *
        math.cos(math.radians(lat2)) *
        math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def is_similar_name(a: str, b: str):
    if not a or not b:
        return False

    a = a.lower().strip()
    b = b.lower().strip()

    return a in b or b in a


def get_bounding_box(lat: float, lon: float, threshold_m: float):
    """
    위도/경도 기준 Bounding Box 계산
    """
    lat_range = threshold_m / 111000  # 위도 1도 ≈ 111km
    lon_range = threshold_m / (111000 * math.cos(math.radians(lat)))

    return (
        lat - lat_range,
        lat + lat_range,
        lon - lon_range,
        lon + lon_range
    )


async def find_duplicate_candidates(
    db: AsyncSession,
    name: str,
    lat: float,
    lon: float,
    threshold_m: float = 50
) -> Tuple[bool, List[dict]]:
    """
    중복 식당 후보 탐색 (최적화)

    return:
        is_duplicate: bool
        candidates: List[{id, name, distance_m}]
    """

    # 1. Bounding Box 계산
    min_lat, max_lat, min_lon, max_lon = get_bounding_box(lat, lon, threshold_m)

    # 2. DB에서 "근처만" 가져오기
    result = await db.execute(
        select(Restaurant).where(
            and_(
                Restaurant.latitude.is_not(None),
                Restaurant.longitude.is_not(None),
                Restaurant.latitude.between(min_lat, max_lat),
                Restaurant.longitude.between(min_lon, max_lon),
            )
        )
    )

    restaurants = result.scalars().all()

    candidates = []
    is_duplicate = False

    # 3. 좁혀진 데이터만 거리 계산
    for r in restaurants:
        try:
            dist_km = haversine(lat, lon, r.latitude, r.longitude)
            dist_m = dist_km * 1000
        except Exception:
            continue

        if dist_m < threshold_m:
            candidates.append({
                "id": r.id,
                "name": r.name,
                "distance_m": round(dist_m, 1)
            })

            # 이름까지 유사하면 "진짜 중복"
            if is_similar_name(name, r.name):
                is_duplicate = True

    return is_duplicate, candidates