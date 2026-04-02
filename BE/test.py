from AddressExtraction import reverse_geocode, expand_short_url, extract_naver_place_id_from_url, extract_naver_place_name, get_naver_address_from_name, kakao_keyword_to_address, get_coords_from_address, get_naver_address

def test_reverse_geocode():
    lat = "37.5665"
    lon = "126.9780"

    print("\n=== 역지오 테스트 ===")
    addr = reverse_geocode(lat, lon)
    print("주소:", addr)
    
test_reverse_geocode()