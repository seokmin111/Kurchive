import os
import re
import json
from typing import Optional, Dict, Any, Tuple
from urllib.parse import urlparse, parse_qs

import requests
from bs4 import BeautifulSoup

# =================================================
# 환경 변수 (필수: KAKAO_REST_API_KEY)
# 선택: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET (네이버 장소검색 사용시)
# =================================================
KAKAO_REST_API_KEY = os.environ.get("KAKAO_REST_API_KEY")
NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET")

KAKAO_HEADERS = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"} if KAKAO_REST_API_KEY else {}
NAVER_HEADERS = {
    "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID or "",
    "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET or "",
}

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

def safe_float(x: Any) -> Optional[float]:
    try:
        return float(x)
    except Exception:
        return None

def extract_place_name_from_html(full_url: str) -> Optional[str]:
    """
    HTML의 og:title 또는 title에서 장소명 추출.
    카카오/네이버에서 흔한 꼬리말 제거.
    """
    try:
        res = requests.get(full_url, headers=UA, timeout=7)
        soup = BeautifulSoup(res.text, "html.parser")

        # 우선 og:title
        og = soup.find("meta", {"property": "og:title"})
        if og and og.get("content"):
            name = og["content"]
        else:
            t = soup.find("title")
            name = t.text if t and t.text else None

        if not name:
            return None

        # 서비스 꼬리말 제거
        tails = [
            "- 카카오맵", " | 카카오맵",
            " : 네이버", " - 네이버지도", "네이버 지도"
        ]
        for tail in tails:
            name = name.replace(tail, "")
        name = name.strip()
        return name if name else None
    except Exception:
        return None

# =================================================
# (구버전 호환) place id 추출기
# =================================================
def extract_naver_place_id(full_url: str) -> Optional[str]:
    """.../place/123456 같은 패턴에서 place id 추출"""
    try:
        m = re.search(r"/place/(\d+)", full_url)
        return m.group(1) if m else None
    except Exception:
        return None

def extract_kakao_place_id(full_url: str) -> Optional[str]:
    """
    map.kakao.com/link/map?itemId=... 또는 기타 쿼리에서 itemId 추출
    (단, 좌표가 있으면 좌표 우선 활용)
    """
    p = urlparse(full_url)
    q = parse_qs(p.query)
    item_id = q.get("itemId")
    return item_id[0] if item_id else None

# =================================================
# Kakao 도구들
# =================================================
def kakao_transcoord_wcongnamul_to_wgs84(x: float, y: float) -> Optional[Tuple[float, float]]:
    """WCONGNAMUL -> WGS84 좌표계 변환"""
    url = "https://dapi.kakao.com/v2/local/geo/transcoord.json"
    params = {"x": x, "y": y, "input_coord": "WCONGNAMUL", "output_coord": "WGS84"}
    r = requests.get(url, headers=KAKAO_HEADERS, params=params, timeout=7)
    r.raise_for_status()
    docs = r.json().get("documents", [])
    if not docs:
        return None
    return safe_float(docs[0].get("y")), safe_float(docs[0].get("x"))

def kakao_coord2address(lng: float, lat: float) -> Dict[str, Optional[str]]:
    """WGS84(lng, lat) -> 도로명/지번 주소"""
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
    """장소명으로 좌표/주소 검색"""
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
    """
    map.kakao.com/link/map?x=..&y=..  또는  ?urlX=..&urlY=..(WCONGNAMUL) 패턴 처리
    반환: (lat, lng)
    """
    p = urlparse(url)
    q = parse_qs(p.query)

    # link/map?x=..&y=..  (이미 WGS84)
    if "x" in q and "y" in q:
        lng, lat = safe_float(q["x"][0]), safe_float(q["y"][0])
        if lat and lng:
            return lat, lng

    # urlX/urlY  (WCONGNAMUL → 변환)
    if "urlX" in q and "urlY" in q:
        x, y = safe_float(q["urlX"][0]), safe_float(q["urlY"][0])
        if x and y:
            return kakao_transcoord_wcongnamul_to_wgs84(x, y)

    return None

# =================================================
# Naver 도구들
# =================================================
def naver_geocode_by_text(query: str) -> Optional[Tuple[float, float, Dict[str, Optional[str]]]]:
    """네이버 장소검색 (공식 게이트웨이)"""
    url = "https://naveropenapi.apigw.ntruss.com/map-place/v1/search"
    params = {"query": query}
    r = requests.get(url, headers=NAVER_HEADERS, params=params, timeout=7)
    r.raise_for_status()
    places = r.json().get("places", [])
    if not places:
        return None
    p = places[0]
    lat, lng = safe_float(p.get("y") or p.get("lat")), safe_float(p.get("x") or p.get("lng"))
    if lat is None or lng is None:
        return None
    return lat, lng, {"road_address": p.get("road_address"), "address": p.get("jibun_address")}

def extract_naver_coords(url: str) -> Optional[Tuple[float, float]]:
    """
    네이버 지도 URL에서 c=lng,lat,zoom 패턴 좌표 추출
    반환: (lat, lng)
    """
    p = urlparse(url)
    q = parse_qs(p.query)
    if "c" in q:
        parts = q["c"][0].split(",")
        if len(parts) >= 2:
            lng, lat = safe_float(parts[0]), safe_float(parts[1])
            if lat and lng:
                return lat, lng
    return None

# =================================================
# 직접 주소 호출
# =================================================
def get_naver_address(url: str) -> Optional[str]:
    full_url = expand_short_url(url) or url
    place_id = extract_naver_place_id(full_url)

    # 1) placeId → 비공식 summary API
    if place_id:
        try:
            api = f"https://map.naver.com/p/api/place/summary/{place_id}"
            headers = {
                "User-Agent": UA["User-Agent"],
                "Referer": f"https://map.naver.com/p/entry/place/{place_id}",
            }
            res = requests.get(api, headers=headers, timeout=7)
            data = res.json()
            road_address = data.get("data", {}).get("nmapSummaryBusiness", {}).get("roadAddress")
            if road_address:
                return road_address
        except Exception:
            pass

    # 2) HTML → title → 공식 검색 API
    name = extract_place_name_from_html(full_url)
    if not name:
        return None

    if NAVER_CLIENT_ID and NAVER_CLIENT_SECRET:
        r = naver_geocode_by_text(name)
        if r:
            _, _, info = r
            return info.get("road_address") or info.get("address")

    # 3) Kakao fallback
    if KAKAO_REST_API_KEY:
        r2 = kakao_keyword_search(name)
        if r2:
            _, _, info, _ = r2
            return info.get("road_address") or info.get("address")

    return None


def get_kakao_address(url: str) -> Optional[str]:
    """
    1) 단축 URL 확장 → 좌표/좌표계 변환 → coord2address
    2) 좌표 없으면 → place id/제목에서 장소명 → 키워드 검색
    """
    full_url = expand_short_url(url) or url

    # 1) 좌표 직접 포함
    coords = extract_kakao_coords(full_url)
    if coords and KAKAO_REST_API_KEY:
        lat, lng = coords
        info = kakao_coord2address(lng, lat)
        return info.get("road_address") or info.get("address")

    # 2) 제목 → keyword search
    name = extract_place_name_from_html(full_url)
    if name and KAKAO_REST_API_KEY:
        r = kakao_keyword_search(name)
        if r:
            _, _, info, _ = r
            return info.get("road_address") or info.get("address")

    return None

# =================================================
# 통합 추출기 (신규 구조)
# =================================================
def extract_location_from_link(url: str) -> Optional[Dict[str, Any]]:
    """
    URL → {name, lat, lng, road_address, address, source}
    """
    full = expand_short_url(url) or url
    print(full)
    host = urlparse(full).netloc
    print(host)

    # ---------- Kakao ----------
    if "kakao.com" in host:
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

    # ---------- Naver ----------
    if "naver.com" in host or "naver.me" in host:
        place_id = extract_naver_place_id(full)
        print("place id : ", place_id)
        if place_id:
            try:
                api = f"https://map.naver.com/p/api/place/summary/{place_id}"
                headers = {
                    "User-Agent": UA["User-Agent"],
                    "Referer": f"https://map.naver.com/p/entry/place/{place_id}",
                }
                res = requests.get(api, headers=headers, timeout=7)
                data = res.json()
                road_address = data.get("data", {}).get("nmapSummaryBusiness", {}).get("roadAddress")
                print("주소 : ", road_address)
                if road_address:
                    # 네이버 공식 geocoding API로 위경도 변환
                    geo_url = "https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode"
                    params = {"query": road_address}
                    g = requests.get(geo_url, headers=NAVER_HEADERS, params=params, timeout=7)
                    g.raise_for_status()
                    items = g.json().get("addresses", [])
                    if items:
                        lat, lng = safe_float(items[0].get("y")), safe_float(items[0].get("x"))
                        return {
                            "name": None,
                            "lat": lat,
                            "lng": lng,
                            "road_address": road_address,
                            "address": road_address,
                            "source": "naver_summary+geocode"
                        }
                    # 주소는 찾았는데 geocode 실패한 경우
                    return {
                        "name": None,
                        "lat": None,
                        "lng": None,
                        "road_address": road_address,
                        "address": road_address,
                        "source": "naver_summary"
                    }
            except Exception as e:
                print("네이버 summary API 실패:", e)

        # summary API도 안 되면 title 추출 → naver/kakao 검색 fallback
        name = extract_place_name_from_html(full)
        if name:
            if NAVER_CLIENT_ID and NAVER_CLIENT_SECRET:
                r = naver_geocode_by_text(name)
                if r:
                    lat, lng, info = r
                    return {
                        "name": name,
                        "lat": lat,
                        "lng": lng,
                        "road_address": info.get("road_address"),
                        "address": info.get("address"),
                        "source": "naver_fallback"
                    }
            if KAKAO_REST_API_KEY:
                r2 = kakao_keyword_search(name)
                if r2:
                    lat, lng, info, cname = r2
                    return {
                        "name": cname,
                        "lat": lat,
                        "lng": lng,
                        "road_address": info.get("road_address"),
                        "address": info.get("address"),
                        "source": "kakao_keyword"
                    }

        return None

# =================================================
# (구버전 호환) 주소 전용 간단 API
# =================================================
def get_address(url: str) -> str:
    """
    구버전과 동일한 인터페이스 유지:
    - 네이버 링크면 get_naver_address
    - 카카오 링크면 get_kakao_address
    - 그 외: 미지원
    """
    full_url = expand_short_url(url) or url
    host = urlparse(full_url).netloc

    if "naver.com" in host or "naver.me" in host:
        addr = get_naver_address(full_url)
        return addr or "주소를 찾을 수 없습니다."

    if "kakao.com" in host:
        addr = get_kakao_address(full_url)
        return addr or "주소를 찾을 수 없습니다."

    return "지원하지 않는 링크 형식입니다."


def get_coords_from_address(address: str) -> Optional[Tuple[float, float]]:
    """
    도로명/지번 주소 문자열 → (lat, lng)
    Kakao REST /v2/local/search/address.json 사용
    """
    if not KAKAO_REST_API_KEY:
        return None
    try:
        url = "https://dapi.kakao.com/v2/local/search/address.json"
        params = {"query": address, "size": 1}
        r = requests.get(url, headers=KAKAO_HEADERS, params=params, timeout=7)
        r.raise_for_status()
        docs = r.json().get("documents", [])
        if not docs:
            return None
        top = docs[0]
        lat, lng = safe_float(top.get("y")), safe_float(top.get("x"))
        if lat is None or lng is None:
            return None
        return (lat, lng)
    except Exception:
        return None

# =================================================
# 테스트
# =================================================
'''
if __name__ == "__main__":
    test_urls = [
        # 네이버 단축
        "https://naver.me/GubwElwt",
        # 카카오 좌표 포함
        "https://map.kakao.com/link/map?itemId=26338954&x=127.0276368&y=37.4979502",
        # 카카오 WCONGNAMUL 좌표
        "https://map.kakao.com/?urlX=476170.0&urlY=1114183.0",
        # 카카오 단축 도메인 예시(있을 수 있음)
        "https://kko.kakao.com/9oC2Kr7EFq",
    ]
    for u in test_urls:
        print("\n=== URL:", u)
        loc = extract_location_from_link(u)
        print(json.dumps(loc, ensure_ascii=False, indent=2))
        print("주소 전용(get_address):", get_address(u))
'''