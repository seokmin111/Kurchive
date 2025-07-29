import requests
import re
from urllib.parse import urlparse, parse_qs
from bs4 import BeautifulSoup
import os

KAKAO_REST_API_KEY = os.environ.get("KAKAO_REST_API_KEY")


# --- 공통 ---
def expand_short_url(short_url: str) -> str | None:
    try:
        res = requests.get(short_url, allow_redirects=True, timeout=5)
        return res.url
    except Exception:
        return None


# --- 네이버 ---
# place id 추출
def extract_naver_place_id(full_url: str) -> str | None:
    match = re.search(r"/place/(\d+)", full_url)
    return match.group(1) if match else None


def get_naver_address(short_url: str) -> dict | None:
    expanded = expand_short_url(short_url)
    if not expanded:
        return None
    place_id = extract_naver_place_id(expanded)
    if not place_id:
        return None

    api_url = f"https://map.naver.com/p/api/place/summary/{place_id}"
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Referer": short_url,
    }
    res = requests.get(api_url, headers=headers)
    try:
        json_data = res.json()
    except Exception:
        return None

    data = json_data.get("data", {}).get("nmapSummaryBusiness", {})
    return {
        "road_address": data.get("roadAddress"),
        "address": data.get("address"),
    }


# --- 카카오 ---
# place id 추출
def extract_kakao_place_id(full_url: str) -> str | None:
    parsed = urlparse(full_url)
    query_params = parse_qs(parsed.query)
    item_id = query_params.get("itemId")
    return item_id[0] if item_id else None

# 장소 이름 추출
def extract_place_name_from_html(place_id: str) -> str | None:
    url = f"https://place.map.kakao.com/m/{place_id}"
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, "html.parser")
    title_tag = soup.find("title")
    if not title_tag:
        return None
    full_title = title_tag.text.strip()
    return full_title.replace(" - 카카오맵", "").split(" | ")[0]

# 주소 찾기
def search_place_and_get_address(place_name: str) -> dict | None:
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    res = requests.get(url, headers=headers, params={"query": place_name})
    try:
        result = res.json()
    except Exception:
        return None

    if result.get("documents"):
        doc = result["documents"][0]
        return {
            "road_address": doc.get("road_address_name"),
            "address": doc.get("address_name"),
        }
    return None


def get_kakao_address(expanded_url: str) -> dict | None:
    place_id = extract_kakao_place_id(expanded_url)
    if not place_id:
        return None
    place_name = extract_place_name_from_html(place_id)
    if not place_name:
        return None
    return search_place_and_get_address(place_name)


# --- 좌표 변환 ---
def get_coords_from_address(address: str) -> dict | None:
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    res = requests.get(url, headers=headers, params={"query": address})
    try:
        result = res.json()
    except Exception:
        return None

    if result.get("documents"):
        doc = result["documents"][0]
        return {"lat": doc["y"], "lon": doc["x"]}
    return None


# --- 플랫폼 구분 ---
def get_address(url: str) -> dict | None:
    expanded = expand_short_url(url)
    if not expanded:
        return None

    if "naver.com" in expanded:
        return get_naver_address(url)
    if "kakao.com" in expanded or "place.map.kakao.com" in expanded:
        return get_kakao_address(expanded)
    return None
