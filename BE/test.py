import re
import requests

UA = {"User-Agent": "Mozilla/5.0"}

def extract_kakao_place_coords_html(url: str):
    """
    place.map.kakao.com/{id} HTML 내부에서 좌표 패턴을 직접 찾아 추출.
    API를 사용하지 않으므로 차단 없음.
    """
    r = requests.get(url, headers=UA, timeout=10)
    html = r.text

    # 1) "latitude": 37.x , "longitude": 127.x
    m = re.search(r'"latitude"\s*:\s*([0-9]+\.[0-9]+)\s*,\s*"longitude"\s*:\s*([0-9]+\.[0-9]+)', html)
    if m:
        lat = float(m.group(1))
        lng = float(m.group(2))
        return lat, lng

    # 2) "y": 37.x , "x": 127.x
    m = re.search(r'"y"\s*:\s*([0-9]+\.[0-9]+)\s*,\s*"x"\s*:\s*([0-9]+\.[0-9]+)', html)
    if m:
        lat = float(m.group(1))
        lng = float(m.group(2))
        return lat, lng

    # 3) "lat": 37.x , "lng": 127.x
    m = re.search(r'"lat"\s*:\s*([0-9]+\.[0-9]+)\s*,\s*"lng"\s*:\s*([0-9]+\.[0-9]+)', html)
    if m:
        lat = float(m.group(1))
        lng = float(m.group(2))
        return lat, lng

    return None


if __name__ == "__main__":
    test_urls = [
        "https://place.map.kakao.com/11992230",
        "https://place.map.kakao.com/1207324621",
    ]

    for u in test_urls:
        print("\n=== Test:", u)
        print("Result:", extract_kakao_place_coords_html(u))
