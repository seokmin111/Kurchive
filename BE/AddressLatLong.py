import os
import re
from typing import Optional, Dict, Any, Tuple
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

# =================================================
# 환경 변수 (필수: KAKAO_REST_API_KEY)
# =================================================
KAKAO_REST_API_KEY = os.environ.get("KAKAO_REST_API_KEY")
KAKAO_HEADERS = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"} if KAKAO_REST_API_KEY else {}
UA = {"User-Agent": "Mozilla/5.0"}

# =================================================
# 공통 유틸
# =================================================
def expand_short_url(short_url: str, timeout: int = 7) -> Optional[str]:
    """단축 URL을 최종 URL로 풀기"""
    try:
        r = requests.get(short_url, allow_redirects=True, timeout=timeout, headers=UA)
        return r.url
    except Exception:
        return None

def safe_float(x) -> Optional[float]:
    try:
        return float(x)
    except Exception:
        return None

# =================================================
# Kakao API 보조 함수
# =================================================
def kakao_coord2address(lng: float, lat: float) -> Dict[str, Optional[str]]:
    """WGS84(lng, lat) -> 도로명/지번 주소"""
    if not KAKAO_REST_API_KEY:
        return {"road_address": None, "address": None}
    url = "https://dapi.kakao.com/v2/local/geo/coord2address.json"
    params = {"x": lng, "y": lat}
    r = requests.get(url, headers=KAKAO_HEADERS, params=params, timeout=7)
    if r.status_code != 200:
        return {"road_address": None, "address": None}
    docs = r.json().get("documents", [])
    if not docs:
        return {"road_address": None, "address": None}
    road = (docs[0].get("road_address") or {}).get("address_name")
    jibun = (docs[0].get("address") or {}).get("address_name")
    return {"road_address": road, "address": jibun}

# =================================================
# Google Maps 전용 추출
# =================================================
def extract_google_coords(url: str) -> Optional[Tuple[float, float]]:
    """
    구글맵 URL에서 좌표 추출
    - 단축 URL이면 풀어서 처리
    - 패턴: !3dLAT!4dLON  또는 @LAT,LON
    """
    # 단축 URL → 풀기
    if "maps.app.goo.gl" in url:
        expanded = expand_short_url(url)
        url = expanded or url

    # !3dLAT!4dLON 패턴
    m = re.search(r"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)", url)
    if m:
        return safe_float(m.group(1)), safe_float(m.group(2))

    # @LAT,LON 패턴
    m = re.search(r"@(-?\d+\.\d+),(-?\d+\.\d+)", url)
    if m:
        return safe_float(m.group(1)), safe_float(m.group(2))

    return None

# =================================================
# 통합 추출기 (Google + Kakao만)
# =================================================
def extract_location_from_link(url: str) -> Optional[Dict[str, Any]]:
    """
    URL → {lat, lng, road_address, address, source}
    - Google Maps 링크면 좌표 추출 + Kakao API로 주소 변환
    - Kakao Maps 링크면 기존 로직 활용
    """
    full = expand_short_url(url) or url
    host = urlparse(full).netloc

    # ---------- Google ----------
    if "google.com" in host or "goo.gl" in host:
        coords = extract_google_coords(full)
        if coords:
            lat, lng = coords
            info = kakao_coord2address(lng, lat) if KAKAO_REST_API_KEY else {"road_address": None, "address": None}
            return {
                "name": None,
                "lat": lat,
                "lng": lng,
                **info,
                "source": "google_maps"
            }

    # ---------- Kakao ----------
    if "kakao.com" in host:
        from urllib.parse import parse_qs
        p = urlparse(full)
        q = parse_qs(p.query)
        if "x" in q and "y" in q:
            lng, lat = safe_float(q["x"][0]), safe_float(q["y"][0])
            if lat and lng:
                info = kakao_coord2address(lng, lat)
                return {"name": None, "lat": lat, "lng": lng, **info, "source": "kakao_coords"}

    return None

# =================================================
# 테스트
# =================================================
if __name__ == "__main__":
    test_urls = [
        "https://maps.app.goo.gl/BakAhgef9G6Z5Gnn8",  # 단축
        "https://www.google.com/maps/place/...!3d37.509386!4d127.0617053...",
        "https://map.kakao.com/link/map?itemId=26338954&x=127.0276368&y=37.4979502",
    ]
    for u in test_urls:
        print("\n=== URL:", u)
        loc = extract_location_from_link(u)
        print(loc)
