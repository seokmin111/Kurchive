import os
import re
from typing import Optional, Dict, Any, Tuple
from urllib.parse import urlparse, parse_qs
import requests
from bs4 import BeautifulSoup
import json

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

def extract_place_name_from_html(full_url: str) -> Optional[str]:
    try:
        res = requests.get(full_url, headers=UA, timeout=7)
        soup = BeautifulSoup(res.text, "html.parser")

        og = soup.find("meta", {"property": "og:title"})
        if og and og.get("content"):
            name = og["content"]
        else:
            t = soup.find("title")
            name = t.text if t and t.text else None

        if not name:
            return None

        tails = ["- 카카오맵", " | 카카오맵"]
        for tail in tails:
            name = name.replace(tail, "")
        return name.strip()
    except Exception:
        return None

# =================================================
# Kakao 도구들
# =================================================
def kakao_transcoord_wcongnamul_to_wgs84(x: float, y: float) -> Optional[Tuple[float, float]]:
    url = "https://dapi.kakao.com/v2/local/geo/transcoord.json"
    params = {"x": x, "y": y, "input_coord": "WCONGNAMUL", "output_coord": "WGS84"}
    r = requests.get(url, headers=KAKAO_HEADERS, params=params, timeout=7)
    r.raise_for_status()
    docs = r.json().get("documents", [])
    if not docs:
        return None
    return safe_float(docs[0].get("y")), safe_float(docs[0].get("x"))

def kakao_coord2address(lng: float, lat: float) -> Dict[str, Optional[str]]:
    url = "https://dapi.kakao.com/v2/local/geo/coord2address.json"
    params = {"x": lng, "y": lat}
    r = requests.get(url, headers=KAKAO_HEADERS, params=params, timeout=7)
    r.raise_for_status()
    docs = r.json().get("documents", [])
    if not docs:
        return {"road_address": None, "address": None}
    road = (docs[0].get("road_address") or {}).get("address_name")
    jibun = (docs[0].get("address") or {}).get("address_name")
    return {"road_address": road, "address": jibun}

def kakao_keyword_search(place_name: str) -> Optional[Tuple[float, float, Dict[str, Optional[str]], str]]:
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    params = {"query": place_name, "size": 1}
    r = requests.get(url, headers=KAKAO_HEADERS, params=params, timeout=7)
    r.raise_for_status()
    docs = r.json().get("documents", [])
    if not docs:
        return None
    top = docs[0]
    lat, lng = safe_float(top.get("y")), safe_float(top.get("x"))
    if lat is None or lng is None:
        return None
    info = {"road_address": top.get("road_address_name"), "address": top.get("address_name")}
    return lat, lng, info, top.get("place_name")

def extract_kakao_coords(url: str) -> Optional[Tuple[float, float]]:
    p = urlparse(url)
    q = parse_qs(p.query)

    if "x" in q and "y" in q:
        lng, lat = safe_float(q["x"][0]), safe_float(q["y"][0])
        if lat and lng:
            return lat, lng

    if "urlX" in q and "urlY" in q:
        x, y = safe_float(q["urlX"][0]), safe_float(q["urlY"][0])
        if x and y:
            return kakao_transcoord_wcongnamul_to_wgs84(x, y)

    return None

# =================================================
# Google Maps 도구들
# =================================================
def extract_google_coords(url: str) -> Optional[Tuple[float, float]]:
    if "maps.app.goo.gl" in url:
        expanded = expand_short_url(url)
        url = expanded or url

    m = re.search(r"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)", url)
    if m:
        return safe_float(m.group(1)), safe_float(m.group(2))

    m = re.search(r"@(-?\d+\.\d+),(-?\d+\.\d+)", url)
    if m:
        return safe_float(m.group(1)), safe_float(m.group(2))

    return None

# =================================================
# 통합 추출기 (카카오 + 구글)
# =================================================
def extract_location_from_link(url: str) -> Optional[Dict[str, Any]]:
    full = expand_short_url(url) or url
    host = urlparse(full).netloc

    # ---------- Google ----------
    if "google.com" in host or "goo.gl" in host:
        coords = extract_google_coords(full)
        if coords:
            lat, lng = coords
            info = kakao_coord2address(lng, lat) if KAKAO_REST_API_KEY else {"road_address": None, "address": None}
            return {"name": None, "lat": lat, "lng": lng, **info, "source": "google_maps"}

    # ---------- Kakao ----------
    if "kakao.com" in host or "kko.kakao.com" in host:
        coords = extract_kakao_coords(full)
        if coords and KAKAO_REST_API_KEY:
            lat, lng = coords
            info = kakao_coord2address(lng, lat)
            return {"name": None, "lat": lat, "lng": lng, **info, "source": "kakao_coords"}

        name = extract_place_name_from_html(full)
        if name and KAKAO_REST_API_KEY:
            r = kakao_keyword_search(name)
            if r:
                lat, lng, info, cname = r
                return {"name": cname, "lat": lat, "lng": lng, **info, "source": "kakao_keyword"}

    return None
'''

if __name__ == "__main__":
    test_urls = [
        # ✅ 카카오 (좌표 포함)
        "https://map.kakao.com/link/map?itemId=26338954&x=127.0276368&y=37.4979502",

        # ✅ 카카오 (WCONGNAMUL 좌표)
        "https://map.kakao.com/?urlX=476170.0&urlY=1114183.0",

        # ✅ 카카오 (단축 도메인 예시)
        "https://kko.kakao.com/9oC2Kr7EFq",

        # ✅ 구글 (단축 URL)
        "https://maps.app.goo.gl/BakAhgef9G6Z5Gnn8",

        # ✅ 구글 (풀 URL, 좌표 포함)
        "https://www.google.com/maps/place/허머스키친/@37.509386,127.0617053,17z/data=!3m1!4b1",
    ]

    for u in test_urls:
        print("\n=== URL:", u)
        loc = extract_location_from_link(u)
        print(json.dumps(loc, ensure_ascii=False, indent=2))
'''

