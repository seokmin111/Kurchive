import os
import re
import json
import requests
from typing import Optional, Dict, Any, Tuple
from urllib.parse import urlparse, parse_qs, unquote
from bs4 import BeautifulSoup


KAKAO_REST_API_KEY = os.environ.get("KAKAO_REST_API_KEY")
KAKAO_HEADERS = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"} if KAKAO_REST_API_KEY else {}

COMMON_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7"
}

# =================================================
# 공통
# =================================================
def expand_short_url(short_url: str, timeout: int = 10) -> str:
    """단축 URL을 원본 URL로 확장"""
    try:
        # naver.me 등은 Referer가 있으면 403이 뜰 수 있어 헤더를 최소화하여 요청
        headers = {"User-Agent": COMMON_HEADERS["User-Agent"]}
        r = requests.get(short_url, headers=headers, allow_redirects=True, timeout=timeout)
        return r.url
    except Exception:
        return short_url

def safe_float(x) -> Optional[float]:
    try:
        return float(x)
    except:
        return None

# =================================================
# 카카오 
# =================================================
def kakao_keyword_search(query: str) -> Optional[Dict[str, Any]]:
    """카카오 로컬 API 키워드 검색"""
    if not KAKAO_REST_API_KEY: return None
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    
    clean_query = re.sub(r'\(.*?\)', '', query).strip()
    
    params = {"query": clean_query, "size": 1}
    try:
        r = requests.get(url, headers=KAKAO_HEADERS, params=params, timeout=5)
        r.raise_for_status()
        docs = r.json().get("documents", [])
        if docs:
            top = docs[0]
            lat, lng = safe_float(top.get("y")), safe_float(top.get("x"))
            if lat and lng:
                return {
                    "lat": lat,
                    "lng": lng,
                    "name": top.get("place_name"),
                    "road_address": top.get("road_address_name"),
                    "address": top.get("address_name"),
                    "source": "kakao_keyword_fallback"
                }
    except Exception as e:
        print(f"[Kakao Search Error] {e}")
    return None

def extract_kakao_info(url: str) -> Optional[Dict[str, Any]]:
    parsed = urlparse(url)
    qs = parse_qs(parsed.query)
    
    item_id = None
    
    if "itemId" in qs: 
        item_id = qs["itemId"][0]
    elif "id" in qs and "map.kakao.com/scheme/place" in url:
        item_id = qs["id"][0]
    else:
        # place.map.kakao.com/1234
        match = re.search(r'place\.map\.kakao\.com/(?:m/)?(\d+)', url)
        if match: item_id = match.group(1)

    target_url = url
    if item_id:
        target_url = f"https://place.map.kakao.com/{item_id}"

    try:
        res = requests.get(target_url, headers=COMMON_HEADERS, timeout=7)
        res.encoding = "utf-8"
        soup = BeautifulSoup(res.text, "html.parser")
        
        place_name = ""
        
        # PC 버전 meta 태그 우선
        og_title = soup.find("meta", {"property": "og:title"})
        if og_title and og_title.get("content"):
            place_name = og_title["content"]
        
        # 실패 시 title 태그
        if not place_name:
            t = soup.find("title")
            if t: place_name = t.text

        place_name = place_name.replace(" - 카카오맵", "").replace(" | 카카오맵", "").strip()
        
        # "카카오맵" 이라는 이름만 남으면 실패로 간주
        if place_name == "카카오맵":
            place_name = ""

        if place_name:
            return kakao_keyword_search(place_name)

    except Exception as e:
        print(f"[Kakao Parsing Error] {e}")

    return None

# =================================================
# 네이버 
# =================================================
def extract_naver_info(url: str) -> Optional[Dict[str, Any]]:
    # Place ID 추출
    patterns = [
        r'/place/(\d+)',
        r'/restaurant/(\d+)',
        r'/entry/place/(\d+)'
    ]
    
    place_id = None
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            place_id = match.group(1)
            break
            
    if not place_id:
        qs = parse_qs(urlparse(url).query)
        if 'id' in qs: place_id = qs['id'][0]

    if not place_id:
        return None

    # HTML 파싱
    headers = COMMON_HEADERS.copy()
    headers["Referer"] = "https://m.place.naver.com/"

    try:
        # 모바일 홈 URL이 가장 가벼움
        html_url = f"https://m.place.naver.com/restaurant/{place_id}/home"
        res = requests.get(html_url, headers=headers, timeout=5)
        res.encoding = "utf-8"
        soup = BeautifulSoup(res.text, "html.parser")

        place_name = ""
        
        # 1순위: JSON LD (가장 정확)
        script = soup.find("script", {"type": "application/ld+json"})
        if script:
            try:
                data = json.loads(script.string)
                if isinstance(data, list): data = data[0] # 리스트일 경우 첫번째
                if "name" in data:
                    place_name = data["name"]
            except:
                pass

        # 2순위: meta og:title
        if not place_name:
            og_title = soup.find("meta", {"property": "og:title"})
            if og_title and og_title.get("content"):
                place_name = og_title["content"]

        # 3순위: title 태그
        if not place_name:
            t = soup.find("title")
            if t: place_name = t.text

        # 정제
        if place_name:
            place_name = re.split(r'\s*:\s*네이버', place_name)[0]
            place_name = place_name.replace(" - 네이버 지도", "").strip()
            
            if place_name and KAKAO_REST_API_KEY:
                return kakao_keyword_search(place_name)

    except Exception as e:
        print(f"[Naver Scraping Error] {e}")

    return None

# =================================================
# 구글
# =================================================
def extract_google_info(url: str) -> Optional[Dict[str, Any]]:
    # URL Decode (한글 처리)
    decoded_url = unquote(url)
    
    # 좌표 추출
    lat, lng = None, None
    
    m = re.search(r'!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)', decoded_url)
    if m: lat, lng = safe_float(m.group(1)), safe_float(m.group(2))
    
    if not lat:
        m = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', decoded_url)
        if m: lat, lng = safe_float(m.group(1)), safe_float(m.group(2))

    # 3. 좌표가 있다면 -> 주소 변환
    if lat and lng:
        info = {}
        if KAKAO_REST_API_KEY:
            k_url = "https://dapi.kakao.com/v2/local/geo/coord2address.json"
            try:
                r = requests.get(k_url, headers=KAKAO_HEADERS, params={"x": lng, "y": lat}, timeout=5)
                docs = r.json().get("documents", [])
                if docs:
                    info["road_address"] = docs[0].get("road_address", {}).get("address_name")
                    info["address"] = docs[0].get("address", {}).get("address_name")
            except:
                pass
        
        return {
            "name": None, 
            "lat": lat,
            "lng": lng,
            **info,
            "source": "google_maps_coord"
        }

    # 좌표가 없다면 -> URL에서 장소명 추출 
    match = re.search(r'/maps/place/([^/]+)', decoded_url)
    if match:
        raw_name = match.group(1)
        place_name = raw_name.replace('+', ' ') 
        
        if place_name and KAKAO_REST_API_KEY:
            return kakao_keyword_search(place_name)

    return None

# =================================================
# Main Handler
# =================================================
def extract_location_from_link(link: str) -> Optional[Dict[str, Any]]:
    if not link: return None

    # 1. URL 확장
    full_url = expand_short_url(link)
    domain = urlparse(full_url).netloc
    
    print(f"   >> Expanded: {full_url}")

    if "naver.com" in domain or "naver.me" in domain:
        return extract_naver_info(full_url)

    if "kakao.com" in domain or "kko.to" in domain:
        return extract_kakao_info(full_url)

    if "google.com" in domain or "goo.gl" in domain:
        return extract_google_info(full_url)

    return None

if __name__ == "__main__":
    # 테스트 케이스
    test_cases = [
        "https://map.kakao.com/?map_type=TYPE_MAP&itemId=17067705&urlLevel=3&urlX=513558&urlY=1038202",
        "https://kko.to/4ceAbRJOxC",
        "https://kko.kakao.com/4ceAbRJOxC",
        "https://place.map.kakao.com/17067705",
        "https://naver.me/FuVEJDp0",
        "https://map.naver.com/p/entry/place/35228977",
        "https://m.place.naver.com/restaurant/35228977/home",
        "https://maps.app.goo.gl/4szoJcJkuczmMfyZ9",
        "https://www.google.com/maps/place/%EC%97%B0%ED%99%94%EB%8B%B4"
    ]

    print(f"KAKAO_KEY Loaded: {bool(KAKAO_REST_API_KEY)}")
    print("-" * 60)

    for url in test_cases:
        print(f"Input: {url}")
        try:
            result = extract_location_from_link(url)
            if result:
                print(f"✅ Success: {result['name']} / {result['lat']}, {result['lng']}")
            else:
                print("❌ Failed")
        except Exception as e:
            print(f"❌ Error: {e}")
        print("-" * 60)