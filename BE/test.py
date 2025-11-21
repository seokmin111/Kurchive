import re
import requests

UA = {"User-Agent": "Mozilla/5.0"}

def extract_place_id(url: str) -> str:
    """
    https://place.map.kakao.com/11992230 형태에서 숫자만 추출
    """
    m = re.search(r"/(\d+)$", url)
    return m.group(1) if m else None


def extract_kakao_place_coords_from_api(url: str):
    """
    place.map.kakao.com/{id} → API 호출 → (lat, lng)
    """
    place_id = extract_place_id(url)
    if not place_id:
        return None

    api_url = f"https://place.map.kakao.com/main/v/{place_id}"
    r = requests.get(api_url, headers=UA, timeout=7)

    # JSON 응답이므로 바로 처리
    data = r.json()
    info = data.get("basicInfo", {})

    x = info.get("x")  # longitude
    y = info.get("y")  # latitude

    if x and y:
        return y, x  # (lat, lng)

    return None


if __name__ == "__main__":
    test_urls = [
        "https://place.map.kakao.com/11992230",
        "https://place.map.kakao.com/1207324621",
    ]

    for u in test_urls:
        print("\n=== Test:", u)
        print("Result:", extract_kakao_place_coords_from_api(u))
