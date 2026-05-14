# BE/src/utils/duplicate_det.py
'''식당 중복 판별 함수 (최종 버전)'''

import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Dict

from BE.src.models.restaurants import Restaurant


# ---------------------------
# 거리 계산 (Haversine)
# ---------------------------
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


# ---------------------------
# 이름 유사도 (간단 버전)
# ---------------------------
def is_similar_name(a: str, b: str):
    if not a or not b:
        return False

    a = a.lower().replace(" ", "")
    b = b.lower().replace(" ", "")

    return a in b or b in a


# ---------------------------
# Bounding Box 계산
# ---------------------------
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


# ---------------------------
# 중복 후보 탐색
# ---------------------------
async def find_duplicate_candidates(
    db: AsyncSession,
    name: str,
    lat: float,
    lon: float,
    threshold_m: float = 100  # ← 현실적으로 100m 추천
) -> List[Dict]:
    """
    중복 식당 후보 탐색

    return:
        List[{
            id,
            name,
            distance_m,
            address,
            thumbnail_url,
            is_name_similar
        }]
    """

    # 좌표 없으면 탐색 불가
    if lat is None or lon is None:
        return []

    # 1. Bounding Box 계산
    min_lat, max_lat, min_lon, max_lon = get_bounding_box(lat, lon, threshold_m)

    # 2. DB에서 근처 식당만 조회
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

    # 3. 거리 계산 + 필터링
    for r in restaurants:
        try:
            dist_km = haversine(lat, lon, r.latitude, r.longitude)
            dist_m = dist_km * 1000
        except Exception:
            continue

        if dist_m < threshold_m:
            name_similar = is_similar_name(name, r.name)

            candidates.append({
                "id": r.id,
                "name": r.name,
                "distance_m": round(dist_m, 1),
                "address": r.address,
                "thumbnail_url": r.thumbnail_url,
                "is_name_similar": name_similar
            })

    # UX용 정렬 (가까운 순 + 이름 유사 우선)
    candidates.sort(key=lambda x: (not x["is_name_similar"], x["distance_m"]))

    return candidates