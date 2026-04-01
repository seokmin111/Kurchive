# test_duplicate_det.py

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import delete

from BE.src.models.restaurants import Restaurant
from BE.src.utils.duplicate_det import find_duplicate_candidates

DATABASE_URL ="mysql+aiomysql://devuser:1234@localhost:3306/kurchive"

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


# -----------------------------
# 1. 테스트 데이터 삽입
# -----------------------------
async def seed_test_data(db):
    print("\n=== 테스트 데이터 삽입 ===")

    r = Restaurant(
    name="TEST_도란도란",
    address="서울특별시 테스트구 테스트로 123",  # 🔥 필수
    location_link="https://naver.me/GubwElwt",  # 🔥 네가 준 링크
    latitude=37.5665,
    longitude=126.9780,
    location_tag_id=1,   # ⚠️ 실제 존재하는 region id여야 함
    uploaded_by=1,       # ⚠️ 실제 존재하는 user id여야 함
    rating=0.0,
    summary="테스트 요약",
    description="테스트 설명",
    price_min=1000,
    price_max=2000,
    recommended_menus=["테스트메뉴"],
)

    db.add(r)
    await db.commit()
    await db.refresh(r)

    print("삽입 완료:", r.id, r.name)
    return r


# -----------------------------
# 2. 중복 테스트
# -----------------------------
async def test_duplicate(db):
    print("\n=== 중복 테스트 ===")

    is_dup, candidates = await find_duplicate_candidates(
        db,
        "TEST_도란도란 본점",
        37.5665,
        126.9780
    )

    print("is_duplicate:", is_dup)
    print("candidates:", candidates)


# -----------------------------
# 3. 비중복 테스트
# -----------------------------
async def test_not_duplicate(db):
    print("\n=== 비중복 테스트 ===")

    is_dup, candidates = await find_duplicate_candidates(
        db,
        "TEST_완전다른식당",
        35.1796,   # 부산
        129.0756
    )

    print("is_duplicate:", is_dup)
    print("candidates:", candidates)


# -----------------------------
# 4. 테스트 데이터 정리
# -----------------------------
async def cleanup_test_data(db):
    print("\n=== 테스트 데이터 삭제 ===")

    await db.execute(
        delete(Restaurant).where(Restaurant.name.like("TEST_%"))
    )
    await db.commit()

    print("삭제 완료")


# -----------------------------
# 실행
# -----------------------------
async def main():
    async with SessionLocal() as db:

        # 1. 테스트 데이터 삽입
        await seed_test_data(db)

        # 2. 중복 테스트
        await test_duplicate(db)

        # 3. 비중복 테스트
        await test_not_duplicate(db)

        # 4. cleanup
        await cleanup_test_data(db)


if __name__ == "__main__":
    asyncio.run(main())