import os
import re
import json
import requests
from typing import Optional, Dict, Any, Tuple
from urllib.parse import urlparse, parse_qs, unquote
from bs4 import BeautifulSoup



# .env 로드
import sys
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

sys.path.insert(0, BASE_DIR)
from dotenv import load_dotenv
ENV_PATH = os.path.join(BASE_DIR, ".env")
load_dotenv(ENV_PATH)
# .env 로드






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

#260325 변경사항
def expand_short_url(short_url: str, timeout: int = 10) -> str:
    """단축 URL을 원본 URL로 확장"""
    try:
        # naver.me 등은 Referer가 있으면 403이 뜰 수 있어 헤더를 최소화하여 요청
        headers = {"User-Agent": COMMON_HEADERS["User-Agent"]}
        r = requests.get(short_url, headers=headers, allow_redirects=True, timeout=timeout)
        redirect_meta = None

        # redirect chain 검사
        for resp in r.history:
            loc = resp.headers.get("Location") or resp.headers.get("location")
            if not loc:
                continue

            parsed = urlparse(loc)
            qs = parse_qs(parsed.query)

            lat = safe_float(qs.get("lat", [None])[0])
            lng = safe_float(qs.get("lng", [None])[0])
            pin_id = qs.get("pinId", [None])[0]
            title = qs.get("title", [None])[0]

            if title:
                title = unquote(title)

            # leaking redirect 발견
            if lat is not None and lng is not None:
                redirect_meta = {
                    "lat": lat,
                    "lng": lng,
                    "name": title,
                    "naver_place_id": pin_id,
                    "source": "naver_redirect"
                }
                break

        return r.url, redirect_meta
    except Exception:
        return short_url, None




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
        docs = r.json().get("documents", []) # seems like getting locations. why 전북? 
        print(f"url_log: {docs}") # logs
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
def extract_naver_info(url: str,  redirect_meta: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    if redirect_meta and redirect_meta.get("lat") is not None and redirect_meta.get("lng") is not None:
        return redirect_meta
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
        #print(f"html_log: {soup}") # logs
        place_name = ""
        
        # 1순위: JSON LD (가장 정확)
        script = soup.find("script", {"type": "application/ld+json"})
        if script:
            try:
                data = json.loads(script.string)
                if isinstance(data, list): data = data[0] # 리스트일 경우 첫번째
                if "name" in data:
                    print(f"json_ld_log: {data}") # logs, 여기는 영등포?ㅓ
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
            #print(f"log: {place_name}") # logs
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

    # 1. URL 확장 and 리다이렉트 메타 정보 추출
    full_url, redirect_meta = expand_short_url(link)
    domain = urlparse(full_url).netloc
    

    print(f"   >> Expanded: {full_url}")
    print(f"   >> Redirect meta: {redirect_meta}")

    if "naver.com" in domain or "naver.me" in domain:
        #return extract_naver_info(full_url, None) 여기는 영등포구 어쩌고 저쩌고를 리턴하는데
        return extract_naver_info(full_url, redirect_meta) #여기는 정상적으로 도란도란 리턴해줌
    

    if "kakao.com" in domain or "kko.to" in domain:
        return extract_kakao_info(full_url)

    if "google.com" in domain or "goo.gl" in domain:
        return extract_google_info(full_url)

    return None

if __name__ == "__main__":
    # 테스트 케이스
    test_cases = [
        "https://naver.me/xHEC0k3d"

    ]

    print(f"KAKAO_KEY Loaded: {bool(KAKAO_REST_API_KEY)}")
    print("-" * 60)

    for url in test_cases:
        #print(f"Input: {url}")
        try:
            result = extract_location_from_link(url)
            if result:
                print(f"✅ Success: {result['name']} / {result['lat']}, {result['lng']}")
            else:
                print("❌ Failed")
        except Exception as e:
            print(f"❌ Error: {e}")
        print("-" * 60)