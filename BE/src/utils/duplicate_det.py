# BE.src.utils.duplicate_det.py
'''식당 중복 판별 함수'''
import math

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