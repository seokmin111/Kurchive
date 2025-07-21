import requests
import re

def expand_naver_short_url(short_url: str) -> str:
    try:
        res = requests.get(short_url, allow_redirects=True, timeout=5)
        return res.url  # ← 최종 리디렉션된 전체 URL
    except Exception as e:
        print("에러:", e)
        return None
    
def extract_place_id(full_url: str) -> str:
    match = re.search(r'/place/(\d+)', full_url)
    if match:
        return match.group(1)
    return None

def get_address(url : str):
    full_url = expand_naver_short_url(url)
    place_id = extract_place_id(full_url)
    
    print("Full URL:", full_url)
    print("Place ID:", place_id)
    
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

# 예시
url = "https://naver.me/GubwElwt"
road_address = get_address(url)
print("도로명 : ",road_address)