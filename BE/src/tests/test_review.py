import pytest

from BE.src.models.users import User
from BE.src.models.restaurants import Restaurant
from BE.src.dependencies import get_current_user_from_token

# 실행 명령어 : 터미널에 입력
# pytest BE/src/tests/test_review.py -v

# print 결과도 보려면 아래 사용
# pytest BE/src/tests/test_review.py::test_create_review -v -s
# =========================
# 🔐 인증 우회
# =========================
@pytest.fixture
def override_auth(app):

    async def fake_current_user():
        return User(
            id=1,
            userid="tester_",
            role="member"
        )

    app.dependency_overrides[get_current_user_from_token] = fake_current_user

    yield

    app.dependency_overrides.clear()


# =========================
# 🍽 RESTAURANT FIXTURE
# =========================
@pytest.fixture
async def test_restaurant(db_session):

    restaurant = Restaurant(
        name="테스트 식당",
        address="서울특별시 영등포구 여의동로 300-2",
        location_link="https://naver.me/Fnm0o0ku",
        latitude=37.5,
        longitude=127.0,
        location_tag_id=1,
        uploaded_by=1,
        price_min=10000,
        price_max=20000,
    )

    db_session.add(restaurant)
    await db_session.commit()
    await db_session.refresh(restaurant)

    return restaurant

# =========================
# 📝 리뷰 생성
# =========================
@pytest.mark.asyncio
async def test_create_review(client, override_auth, test_restaurant):

    payload = {
        "content": "맛있음",
        "rating": 4.5,
        "menus": ["파스타", "피자"]
    }

    res = await client.post(
        f"/restaurants/{test_restaurant.id}/reviews",
        json=payload
    )
    print("====== RESPONSE ======")
    print("STATUS:", res.status_code)
    print("BODY:", res.text)
    print("======================")

    assert res.status_code == 200

    data = res.json()
    assert data["ok"] is True
    assert "review_id" in data


# =========================
# ❌ 중복 리뷰
# =========================
@pytest.mark.asyncio
async def test_create_duplicate_review(client, override_auth, test_restaurant):

    payload = {
        "content": "또씀",
        "rating": 3.0,
        "menus": []
    }

    await client.post(
        f"/restaurants/{test_restaurant.id}/reviews",
        json=payload
    )

    res = await client.post(
        f"/restaurants/{test_restaurant.id}/reviews",
        json=payload
    )

    assert res.status_code == 400


# =========================
# ✏️ 리뷰 수정
# =========================
@pytest.mark.asyncio
async def test_update_review(client, override_auth, test_restaurant):

    create_res = await client.post(
        f"/restaurants/{test_restaurant.id}/reviews",
        json={
            "content": "초기",
            "rating": 4.0,
            "menus": []
        }
    )

    review_id = create_res.json()["review_id"]

    res = await client.patch(
        f"/reviews/{review_id}",
        json={
            "content": "수정됨",
            "rating": 5.0,
            "menus": ["리조또"]
        }
    )

    assert res.status_code == 200


# =========================
# 🗑 리뷰 삭제
# =========================
@pytest.mark.asyncio
async def test_delete_review(client, override_auth, test_restaurant):

    create_res = await client.post(
        f"/restaurants/{test_restaurant.id}/reviews",
        json={
            "content": "삭제용",
            "rating": 4.0,
            "menus": []
        }
    )

    review_id = create_res.json()["review_id"]

    res = await client.delete(
        f"/reviews/{review_id}"
    )

    assert res.status_code == 200


# =========================
# 🚫 남의 리뷰 수정 방지
# =========================
@pytest.mark.asyncio
async def test_update_other_user_review(client, app, db_session, test_restaurant):

    # 유저1 override
    async def user1():
        return User(id=1, userid="user1", role="member")

    app.dependency_overrides[get_current_user_from_token] = user1

    create_res = await client.post(
        f"/restaurants/{test_restaurant.id}/reviews",
        json={
            "content": "유저1 리뷰",
            "rating": 4,
            "menus": []
        }
    )

    review_id = create_res.json()["review_id"]

    # 유저2 override
    async def user2():
        return User(id=2, userid="user2", role="member")

    app.dependency_overrides[get_current_user_from_token] = user2

    res = await client.patch(
        f"/reviews/{review_id}",
        json={
            "content": "해킹",
            "rating": 1,
            "menus": []
        }
    )

    assert res.status_code == 403

    app.dependency_overrides.clear()