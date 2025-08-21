import sys
import os
import sys, os
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, BASE_DIR)

from set_path import *  
from urllib.parse import urlparse, parse_qs
from bs4 import BeautifulSoup

import requests
import re

KAKAO_REST_API_KEY = os.environ.get("KAKAO_REST_API_KEY")
NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET")

# 단축 URL 풀기
def expand_short_url(short_url: str) -> str:
    try:
        res = requests.get(short_url, allow_redirects=True, timeout=5)
        return res.url  # ← 최종 리디렉션된 전체 URL
    except Exception as e:
        print("에러:", e)
        return None

# 장소 id 추출
## 1. 네이버
def extract_naver_place_id(full_url: str) -> str | None:
    match = re.search(r'/place/(\d+)', full_url)
    if match:
        return match.group(1)
    return None

## 2. 카카오
def extract_kakao_place_id(full_url: str) -> str | None:
    parsed = urlparse(full_url)
    query_params = parse_qs(parsed.query)
    item_id = query_params.get('itemId')
    return item_id[0] if item_id else None

# 주소 추출
## 1. 카카오
def kakao_keyword_to_address(place_name: str) -> str | None:
    api = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {"query": place_name, "size": 1}
    try:
        r = requests.get(api, headers=headers, params=params, timeout=7)
        r.raise_for_status()
        docs = r.json().get("documents", [])
        if not docs:
            return None
        top = docs[0]
        addr = top.get("road_address_name") or top.get("address_name")
        return addr if addr and addr.strip() else None
    except Exception as e:
        print("kakao_keyword_to_address 실패:", e)
        return None


def extract_kakao_place_id_from_url(full_url: str) -> str | None:
    # 1) ?itemId=12345 형태
    parsed = urlparse(full_url)
    item_id = parse_qs(parsed.query).get("itemId")
    if item_id:
        return item_id[0]
    # 2) /place.map.kakao.com/12345 형태
    m = re.search(r'place\.map\.kakao\.com/(?:m/)?(\d+)', full_url)
    return m.group(1) if m else None

def extract_kakao_place_name(full_url: str) -> str | None:
    try:
        res = requests.get(full_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=7)
        soup = BeautifulSoup(res.text, "html.parser")
        # og:title에 상호명 있음
        og_title = soup.find("meta", {"property": "og:title"})
        if og_title and og_title.get("content"):
            return og_title["content"].replace(" - 카카오맵", "").strip()
        t = soup.find("title")
        if t and t.text:
            return t.text.replace(" - 카카오맵", "").split(" | ")[0].strip()
        return None
    except Exception as e:
        print("카카오 장소명 파싱 실패:", e)
        return None


def get_kakao_address(url: str) -> str | None:
    full = expand_short_url(url) or url
    name = extract_kakao_place_name(full)
    if not name:
        return None

    api = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {"query": name, "size": 1}

    try:
        r = requests.get(api, headers=headers, params=params, timeout=7)
        r.raise_for_status()
        docs = r.json().get("documents", [])
        if not docs:
            return None
        top = docs[0]
        return top.get("road_address_name") or top.get("address_name")
    except Exception as e:
        print("kakao_keyword_to_address 실패:", e)
        return None


## 2. 네이버
def extract_naver_place_id_from_url(full_url: str) -> str | None:
    m = re.search(r'/place/(\d+)', full_url) or re.search(r'/entry/place/(\d+)', full_url)
    return m.group(1) if m else None

def extract_naver_place_name(full_url: str) -> str | None:
    try:
        res = requests.get(full_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=7)
        soup = BeautifulSoup(res.text, "html.parser")
        og = soup.find("meta", {"property": "og:title"})
        if og and og.get("content"):
            return og["content"].replace(" : 네이버", "").replace(" - 네이버지도", "").strip()
        t = soup.find("title")
        if t and t.text:
            return t.text.replace(" : 네이버", "").replace(" - 네이버지도", "").strip()
        return None
    except Exception as e:
        print("extract_naver_place_name 실패:", e)
        return None

def get_naver_address_from_name(place_name: str) -> str | None:
    url = "https://naveropenapi.apigw.ntruss.com/map-place/v1/search"
    headers = {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
    }
    params = {"query": place_name}
    try:
        res = requests.get(url, headers=headers, params=params, timeout=7)
        res.raise_for_status()
        data = res.json()
        places = data.get("places") or []
        if not places:
            return None
        p = places[0]
        return p.get("road_address") or p.get("jibun_address")
    except Exception as e:
        print("get_naver_address_from_name 실패:", e)
        return None

def get_naver_address(url: str) -> str | None:
    full = expand_short_url(url) or url
    place_id = extract_naver_place_id(full)
    if not place_id:
        return None
    try:
        api_url = f"https://map.naver.com/v5/api/sites/summary/{place_id}"
        res = requests.get(api_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=7)
        res.raise_for_status()
        data = res.json()
        return data.get("address", {}).get("roadAddress") or data.get("address", {}).get("jibunAddress")
    except Exception as e:
        print("네이버 placeId API 실패:", e)
        return None


#------------------------------------------------------------------------

# 네이버 카카오 통합
def get_address(url: str) -> str | None:
    full_url = expand_short_url(url) or url

    if "kakao.com" in full_url:
        print("카카오")
        return get_kakao_address(full_url)

    if "naver.com" in full_url or "naver.me" in full_url:
        print("네이버")
        return get_naver_address(full_url)

    return None  # 불명 링크

## ---------------------------------------------------------------
# 위도경도 추출
KAKAO_REST_API_KEY = os.environ.get("KAKAO_REST_API_KEY")

def get_coords_from_address(address: str) -> tuple[str, str] | None:
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {
        "Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"
    }
    params = {
        "query": address
    }

    try:
        res = requests.get(url, headers=headers, params=params)
        res.raise_for_status()
        result = res.json()

        if result["documents"]:
            doc = result["documents"][0]
            lat = doc["y"]
            lon = doc["x"]
            return lat, lon
        else:
            print("좌표 검색 결과 없음:", address)
            return None
    except Exception as e:
        print("카카오 좌표 변환 실패:", e)
        return None

# 테스트
def main():
    # 환경변수 확인 (없으면 좌표 변환/검색 실패)
    print("KAKAO_REST_API_KEY:", bool(os.environ.get("KAKAO_REST_API_KEY")))
    print("NAVER_CLIENT_ID:", bool(os.environ.get("NAVER_CLIENT_ID")))
    print("NAVER_CLIENT_SECRET:", bool(os.environ.get("NAVER_CLIENT_SECRET")))

    urls = [
        "https://naver.me/GubwElwt",             # 네이버 단축링크 예시
        "https://place.map.kakao.com/26338954",  # 카카오 place 예시 (바꿔도 됨)
    ]

    for url in urls:
        print("\n=== 테스트 ===")
        print("원본 URL:", url)
        addr = get_address(url)
        print("추출된 주소:", addr)

        if addr:
            coords = get_coords_from_address(addr)
            print("좌표:", coords)
        else:
            print("주소 추출 실패")

if __name__ == "__main__":
    main()