import requests

from AddressExtraction import get_address
from keys import KAKAO_REST_API_KEY

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
    
# 예시

address = get_address("https://naver.me/GubwElwt")
print(address)

coords = get_coords_from_address(address)

if coords:
    print("위도 :", coords[0])
    print("경도 :", coords[1])
