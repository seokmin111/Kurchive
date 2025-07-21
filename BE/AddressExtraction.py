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

from BE.keys import KAKAO_REST_API_KEY

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
def get_naver_address(url : str):
    full_url = expand_short_url(url)
    place_id = extract_naver_place_id(full_url)
    
    # print("Full URL:", full_url)
    # print("Place ID:", place_id)
    
    url = f'https://map.naver.com/p/api/place/summary/{place_id}'
    headers = {
        'User-Agent': 'Mozilla/5.0',
        'Referer': f'https://map.naver.com/p/entry/place/{place_id}'
    }

    res = requests.get(url, headers=headers)
    data = res.json()
    road_address = data.get("data", {}).get("nmapSummaryBusiness", {}).get("roadAddress")
    
    if not road_address:
        message = "주소 정보가 없습니다."
        print(message)
    else:
        return road_address

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

### 2단계 : 카카오맵 API로 장소명 입력 -> 도로명 주소 추출
def search_place_and_get_address(place_name: str, api_key: str) -> str:
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {'Authorization': f'KakaoAK {KAKAO_REST_API_KEY}'}
    params = {'query': place_name}
    
    try:
        res = requests.get(url, headers=headers, params=params)
        res.raise_for_status()
        result = res.json()

        if result["documents"]:
            doc = result["documents"][0]  # 가장 상위 검색 결과
            address = doc.get("road_address_name") or doc.get("address_name")
            # print("검색된 주소:", address)
            return address
        else:
            print("장소 검색 결과 없음")
            return None
    except Exception as e:
        print("장소 검색 API 실패:", e)
        return None

 ### 3단계 : 카카오 1, 2단계 전체 통합   
def get_kakao_address(short_url: str) -> str:
    full_url = expand_short_url(short_url)
    if not full_url:
        return "단축 URL을 확장할 수 없습니다."

    place_id = extract_kakao_place_id(full_url)
    if not place_id:
        return "place_id를 추출할 수 없습니다."

    #print("Full URL:", full_url)
    #print("Place ID:", place_id)

    place_name = extract_place_name_from_html(place_id)
    
    if not place_name:
        return "장소명을 추출할 수 없습니다."

    #print("장소명:", place_name)

    address = search_place_and_get_address(place_name, KAKAO_REST_API_KEY)
    return address if address else "주소를 찾을 수 없습니다."

# 네이버 카카오 통합
def get_address(url):
    full_url = expand_short_url(url)
    
    if full_url is None:
        return "No full url"
    
    if "naver.com" in full_url:
        print("네이버")
        return get_naver_address(url)
    
    elif "kakao.com" in full_url or "place.map.kakao.com" in full_url:
        print("카카오")
        return get_kakao_address(url)
    
    else:
        message = "지원하지 않는 링크 형식입니다."
        return message

# # 네이버 예시
# url = "https://naver.me/GubwElwt"
# road_address = get_address(url)
# print("도로명 : ",road_address)

# ## 카카오
# url = "https://kko.kakao.com/9oC2Kr7EFq"

# a = get_kakao_address(url)
# print(a)
# # 서울 송파구 위례성대로12길 8가 나옴