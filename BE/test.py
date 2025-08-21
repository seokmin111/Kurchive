# BE/test_address.py
from BE.AddressExtraction import get_address
from BE.AddressLatLong import get_coords_from_address
import os

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
