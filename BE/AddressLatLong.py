import os
import re
from typing import Optional, Dict, Any, Tuple
from urllib.parse import urlparse, parse_qs
import requests
from bs4 import BeautifulSoup
import json

# =================================================
# 환경 변수
# =================================================
KAKAO_REST_API_KEY = os.environ.get("KAKAO_REST_API_KEY")
KAKAO_HEADERS = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"} if KAKAO_REST_API_KEY else {}
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"}

# =================================================
# 공통 유틸
# =================================================
def expand_short_url(short_url: str, timeout: int = 7) -> Optional[str]:
    """단축 URL(kko.to, naver.me, goo.gl 등)을 원본 URL로 확장"""
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
# Kakao 도구들
# =================================================
def kakao_coord2address(lng: float, lat: float) -> Dict[str, Optional[str]]:
    """좌표 -> 주소 변환"""
    url = "https://dapi.kakao.com/v2/local/geo/coord2address.json"
    params = {"x": lng, "y": lat}
    try:
        r = requests.get(url, headers=KAKAO_HEADERS, params=params, timeout=7)
        r.raise_for_status()
        docs = r.json().get("documents", [])
        if not docs:
            return {"road_address": None, "address": None}
        road = (docs[0].get("road_address") or {}).get("address_name")
        jibun = (docs[0].get("address") or {}).get("address_name")
        return {"road_address": road, "address": jibun}
    except Exception:
        return {"road_address": None, "address": None}

def kakao_keyword_search(place_name: str) -> Optional[Tuple[float, float, Dict[str, Optional[str]], str]]:
    """장소명으로 카카오 검색"""
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    params = {"query": place_name, "size": 1}
    try:
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
    except Exception:
        return None

def extract_place_name_from_kakao_html(full_url: str) -> Optional[str]:
    """카카오맵 HTML 파싱하여 장소명 추출"""
    try:
        res = requests.get(full_url, headers=UA, timeout=7)
        soup = BeautifulSoup(res.text, "html.parser")
        
        # 1. og:title 확인
        og = soup.find("meta", {"property": "og:title"})
        if og and og.get("content"):
            name = og["content"]
        else:
            # 2. title 태그 확인
            t = soup.find("title")
            name = t.text if t else None

        if not name:
            return None

        # 불필요한 접미사 제거
        tails = [" | 카카오맵", " - 카카오맵"]
        for tail in tails:
            name = name.replace(tail, "")
        return name.strip()
    except Exception:
        return None

# =================================================
# Naver 도구들 (추가됨)
# =================================================
def extract_naver_place_info(url: str) -> Optional[Dict[str, Any]]:
    """네이버 지도 URL에서 ID 추출 후 내부 API로 정보 조회"""
    # 1. Place ID 추출 정규식
    # https://map.naver.com/p/entry/place/12345678
    # https://m.place.naver.com/restaurant/12345678
    match = re.search(r'/place/(\d+)', url) or re.search(r'/restaurant/(\d+)', url)
    
    if not match:
        return None
    
    place_id = match.group(1)
    
    # 2. 네이버 비공식(Internal) API 사용 (가장 정확함)
    api_url = f"https://map.naver.com/v5/api/sites/summary/{place_id}?lang=ko"
    
    try:
        res = requests.get(api_url, headers=UA, timeout=7)
        res.raise_for_status()
        data = res.json()
        
        name = data.get("name")
        y = data.get("y") # lat
        x = data.get("x") # lng
        road_addr = data.get("address") # 도로명 우선인 경우가 많음
        jibun_addr = data.get("jibunAddress") # 없을 수도 있음

        lat, lng = safe_float(y), safe_float(x)
        
        if lat and lng:
            return {
                "name": name,
                "lat": lat,
                "lng": lng,
                "road_address": road_addr,
                "address": jibun_addr, # 지번
                "source": "naver_api"
            }
    except Exception as e:
        print(f"Naver API Error: {e}")
        return None
    
    return None

# =================================================
# Google Maps 도구들
# =================================================
def extract_google_coords(url: str) -> Optional[Tuple[float, float]]:
    # Google Maps URL에서 좌표 추출
    m = re.search(r"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)", url)
    if m:
        return safe_float(m.group(1)), safe_float(m.group(2))

    m = re.search(r"@(-?\d+\.\d+),(-?\d+\.\d+)", url)
    if m:
        return safe_float(m.group(1)), safe_float(m.group(2))

    return None

# =================================================
# 통합 추출기 (메인 함수)
# =================================================
def extract_location_from_link(url: str) -> Optional[Dict[str, Any]]:
    # 1. 단축 URL 확장 (naver.me, kko.to 등)
    full = expand_short_url(url) or url
    host = urlparse(full).netloc

    # ---------- Naver Maps ----------
    if "naver.com" in host or "naver.me" in host:
        info = extract_naver_place_info(full)
        if info:
            return info

    # ---------- Kakao Maps ----------
    if "kakao.com" in host or "kko.to" in host:
        # A. URL 파라미터에 좌표가 있는 경우 (구버전 링크 등)
        # B. HTML 파싱해서 장소명 추출 -> 키워드 검색
        name = extract_place_name_from_kakao_html(full)
        if name and KAKAO_REST_API_KEY:
            # 이름으로 카카오 검색 API 호출
            r = kakao_keyword_search(name)
            if r:
                lat, lng, info, cname = r
                return {"name": cname, "lat": lat, "lng": lng, **info, "source": "kakao_keyword"}

    # ---------- Google Maps ----------
    if "google.com" in host or "goo.gl" in host:
        coords = extract_google_coords(full)
        if coords:
            lat, lng = coords
            # 좌표로 주소 변환 (Kakao API 활용)
            info = kakao_coord2address(lng, lat) if KAKAO_REST_API_KEY else {"road_address": None, "address": None}
            return {"name": None, "lat": lat, "lng": lng, **info, "source": "google_maps"}

    return None

# 테스트용 코드
if __name__ == "__main__":
    test_urls = [
        "https://kko.to/M_2sE8_u4j", # 카카오 단축
        "https://place.map.kakao.com/26338954", # 카카오 place
        "https://naver.me/GubwElwt", # 네이버 단축
        "https://map.naver.com/p/entry/place/13565685?c=15.00,0,0,0,dh", # 네이버 PC
        "https://maps.app.goo.gl/BakAhgef9G6Z5Gnn8", # 구글 단축
    ]

    for u in test_urls:
        print(f"\nTesting: {u}")
        result = extract_location_from_link(u)
        print(json.dumps(result, ensure_ascii=False, indent=2))