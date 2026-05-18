# tests/test_rest_filter.py

'''
목표 : 별점 기반 필터링 동작 확인

1. 별점 범위 밖 값 -1, 6 넣으면 막히는지
2. rating_min > rating_max면 422 나는지
3. 태그/지역/가격이랑 같이 걸었을 때도 결과가 제대로 좁혀지는지
'''
# pytest BE/src/tests/test_rest_filter.py -v

from fastapi.testclient import TestClient

from BE.src.main import app


client = TestClient(app)

BASE_URL = "/api"


def test_restaurants_rating_min_filter():
    res = client.get(
        f"{BASE_URL}/restaurants?rating_min=4"
    )

    assert res.status_code == 200

    data = res.json()

    assert isinstance(data, list)

    for restaurant in data:
        assert restaurant["rating"] >= 4


def test_restaurants_rating_max_filter():
    res = client.get(
        f"{BASE_URL}/restaurants?rating_max=3"
    )

    assert res.status_code == 200

    data = res.json()

    assert isinstance(data, list)

    for restaurant in data:
        assert restaurant["rating"] <= 3


def test_restaurants_rating_range_filter():
    res = client.get(
        f"{BASE_URL}/restaurants?rating_min=3&rating_max=4"
    )

    assert res.status_code == 200

    data = res.json()

    assert isinstance(data, list)

    for restaurant in data:
        assert 3 <= restaurant["rating"] <= 4


def test_restaurants_invalid_rating_min_too_low():
    res = client.get(
        f"{BASE_URL}/restaurants?rating_min=-1"
    )

    assert res.status_code == 422


def test_restaurants_invalid_rating_max_too_high():
    res = client.get(
        f"{BASE_URL}/restaurants?rating_max=6"
    )

    assert res.status_code == 422


def test_restaurants_invalid_rating_range():
    res = client.get(
        f"{BASE_URL}/restaurants?rating_min=5&rating_max=3"
    )

    assert res.status_code == 422


def test_restaurants_tag_and_rating_filter():
    res = client.get(
        f"{BASE_URL}/restaurants?tag_ids=1&rating_min=4"
    )

    assert res.status_code == 200

    data = res.json()

    assert isinstance(data, list)

    for restaurant in data:
        assert restaurant["rating"] >= 4


def test_restaurants_region_price_rating_filter():
    res = client.get(
        f"{BASE_URL}/restaurants"
        "?region_id=1"
        "&price_min=10000"
        "&price_max=30000"
        "&rating_min=4"
    )

    assert res.status_code == 200

    data = res.json()

    assert isinstance(data, list)

    for restaurant in data:
        assert restaurant["rating"] >= 4
        assert restaurant["price_min"] >= 10000
        assert restaurant["price_max"] <= 30000


def test_nearby_rating_filter():
    res = client.get(
        f"{BASE_URL}/restaurants/nearby"
        "?lat=37.3595704"
        "&lon=127.105399"
        "&radius_km=10"
        "&rating_min=4"
    )

    assert res.status_code == 200

    data = res.json()

    assert isinstance(data, list)

    for restaurant in data:
        assert restaurant["rating"] >= 4


def test_viewport_rating_filter():
    res = client.get(
        f"{BASE_URL}/restaurants/viewport"
        "?min_lat=37.0"
        "&min_lon=126.8"
        "&max_lat=37.8"
        "&max_lon=127.5"
        "&rating_min=4"
    )

    assert res.status_code == 200

    data = res.json()

    assert isinstance(data, list)

    for restaurant in data:
        assert restaurant["rating"] >= 4