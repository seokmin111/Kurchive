# 시드 데이터 넣는 용. 카카오맵 링크를 위도경도로 변환하는 코드
# 여러 개 한번에 가능. 줄바꿈으로 구분

import sys
import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv 

# 환경설정과 경로설정
load_dotenv() 
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, BASE_DIR)

try:
    from set_path import *
except ImportError:
    pass

KAKAO_REST_API_KEY = os.environ.get("KAKAO_REST_API_KEY")

if not KAKAO_REST_API_KEY:
    print("---------------------------------------------------------")
    print("[오류] KAKAO_REST_API_KEY환경변수가 설정되지 않음")
    print("---------------------------------------------------------")
    sys.exit(1)


# 단축 링크를 변환 
def expand_short_url(short_url: str) -> str:
    try:
        res = requests.get(short_url, allow_redirects=True, timeout=5)
        return res.url
    except Exception as e:
        return short_url

# 카카오맵에서 장소명 추출
def get_place_name_from_html(full_url: str) -> str | None:
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(full_url, headers=headers, timeout=5)
        soup = BeautifulSoup(res.text, "html.parser")
        
        og_title = soup.find("meta", {"property": "og:title"})
        
        if og_title and og_title.get("content"):
            place_name = og_title["content"]
            place_name = place_name.replace(" - 카카오맵", "").replace(" | 카카오맵", "").strip()
            return place_name
            
        title = soup.find("title")
        if title and title.text:
            return title.text.replace(" - 카카오맵", "").split(" | ")[0].strip()
            
        return None
    except Exception as e:
        print(f"장소명 파싱 실패: {e}")
        return None

# 위도경도 반환 
def get_coords_by_keyword(keyword: str) -> tuple[str, str, str] | None:
    api_url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {"query": keyword, "size": 1}
    
    try:
        res = requests.get(api_url, headers=headers, params=params, timeout=5)
        res.raise_for_status()
        data = res.json()
        
        if data.get("documents"):
            place = data["documents"][0]
            lat = place["y"]  # 위도
            lon = place["x"]  # 경도
            address = place.get("road_address_name") or place.get("address_name")
            return lat, lon, address
        else:
            return None
    except Exception as e:
        print(f"API 검색 실패 ({keyword}): {e}")
        return None

def process_kakao_link(url: str):
    full_url = expand_short_url(url.strip())
    
    place_name = get_place_name_from_html(full_url)
    
    if not place_name:
        return {"url": url, "error": "장소명을 찾을 수 없습니다."}
    
    result = get_coords_by_keyword(place_name)
    
    if result:
        lat, lon, addr = result
        return {
            "name": place_name,
            "lat": lat,
            "lon": lon,
            "address": addr,
            "original_url": url
        }
    else:
        return {"url": url, "name": place_name, "error": "API 검색 결과가 없습니다."}

# 
def main():
    # 여기에 링크 입력 (줄바꿈으로구분)
    input_text = """
    https://place.map.kakao.com/309142826
https://place.map.kakao.com/143081516
https://place.map.kakao.com/16271793
https://place.map.kakao.com/11891754
https://place.map.kakao.com/25038356
https://place.map.kakao.com/15482458
https://place.map.kakao.com/9817288
https://place.map.kakao.com/19037502
https://place.map.kakao.com/1329233080
https://place.map.kakao.com/11486122
https://place.map.kakao.com/1060315738
https://place.map.kakao.com/124338573
https://place.map.kakao.com/12740961
https://place.map.kakao.com/1708835011
https://place.map.kakao.com/26533982
https://place.map.kakao.com/995771109
https://place.map.kakao.com/798069930
https://place.map.kakao.com/733399518
https://place.map.kakao.com/325095246
https://place.map.kakao.com/1079903424
https://place.map.kakao.com/12980859
https://place.map.kakao.com/1178169559
https://place.map.kakao.com/842439367
https://place.map.kakao.com/485306026
https://place.map.kakao.com/8344631
https://place.map.kakao.com/613639039
https://place.map.kakao.com/412460362
https://place.map.kakao.com/1947880008
https://place.map.kakao.com/1589374106
    """
    
    links = [line.strip() for line in input_text.strip().split('\n') if line.strip()]

    for i, link in enumerate(links, 1):
        res = process_kakao_link(link)
        
        if "error" in res:
            print(f"실패: {res['error']}")
            if "name" in res:
                print(f"추출된 장소명: {res['name']}")
        else:
            print(f"{res['lat']} \t {res['lon']}")
        # print("\n")

if __name__ == "__main__":
    main()