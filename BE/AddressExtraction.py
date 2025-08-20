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
def extract_naver_place_id(full_url: str) -> str:
    match = re.search(r'/place/(\d+)', full_url)
    if match:
        return match.group(1)
    return None

## 2. 카카오
def extract_kakao_place_id(full_url: str) -> str:
    parsed = urlparse(full_url)
    query_params = parse_qs(parsed.query)
    item_id = query_params.get('itemId')
    return item_id[0] if item_id else None

# 주소 추출
## 1. 네이버
def get_naver_address_from_name(place_name: str) -> dict | None:
    """
    네이버 Local API: 식당 이름으로 주소 + 위경도 검색
    """
    url = "https://naveropenapi.apigw.ntruss.com/map-place/v1/search"
    headers = {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
    }
    params = {"query": place_name}
    res = requests.get(url, headers=headers, params=params)
    data = res.json()
    places = data.get("places")
    if not places:
        return None

    p = places[0]
    return {
        "road_address": p.get("road_address"),
        "address": p.get("jibun_address"),
        "lat": p.get("y"),
        "lon": p.get("x"),
    }

## 2. 카카오에서 주소 파싱
### 1단계 : 장소 이름 추출
def extract_place_name_from_html(place_id: str) -> str:
    url = f"https://place.map.kakao.com/m/{place_id}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        res = requests.get(url, headers=headers)
        soup = BeautifulSoup(res.text, "html.parser")
        title_tag = soup.find("title")
        if title_tag:
            full_title = title_tag.text.strip()
            # " | 카카오맵" 제거
            clean_name = full_title.replace(" - 카카오맵", "").split(" | ")[0]
            return clean_name
        else:
            return None
    except Exception as e:
        print("HTML 파싱 실패:", e)
        return None

 ### 3단계 : 카카오 1, 2단계 전체 통합   
# 카카오: URL 기반으로 수정
def get_kakao_address(url: str) -> dict | None:
    full_url = expand_short_url(url)
    if not full_url:
        return None

    place_id = extract_kakao_place_id(full_url)
    if not place_id:
        return None

    place_name = extract_place_name_from_html(place_id)
    if not place_name:
        return None

    return place_name

# 네이버 카카오 통합
def get_address(url):
    full_url = expand_short_url(url)
    
    if full_url is None:
        return "No full url"
    
    if "naver.com" in full_url:
        print("네이버")
        return get_naver_address_from_name(url)
    
    elif "kakao.com" in full_url or "place.map.kakao.com" in full_url:
        print("카카오")
        return get_kakao_address(url)
    
    else:
        message = "지원하지 않는 링크 형식입니다."
        return message

# # 네이버 예시
# url = "https://naver.me/GubwElwt"
# 심포니오브차이나
# road_address = get_address(url)
# print("도로명 : ",road_address)

# ## 카카오
# url = "https://kko.kakao.com/9oC2Kr7EFq"

# a = get_kakao_address(url)
# print(a)
# # 서울 송파구 위례성대로12길 8가 나옴