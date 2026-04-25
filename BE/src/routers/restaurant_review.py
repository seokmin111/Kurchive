from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from BE.src.dependencies import get_async_db, get_current_user_from_token
from BE.src.models.users import User
from BE.src.models.restaurants import Restaurant
from BE.src.models.restaurant_reviews import Review, ReviewMenu

router = APIRouter()


# ---------------------------
# DTO
# ---------------------------
class ReviewCreate(BaseModel):
    content: str = Field(max_length=300)
    rating: float
    menus: List[str] = []


class ReviewOut(BaseModel):
    id: int
    content: str
    rating: float
    user_id: Optional[int]
    menus: List[str]
    created_at: datetime


# ---------------------------
# 리뷰 생성
# ---------------------------
@router.post("/restaurants/{restaurant_id}/reviews")
async def create_review(
    restaurant_id: int,
    payload: ReviewCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    # 1. 식당 존재 확인
    restaurant = await db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(404, "식당 없음")

    # 2. 중복 리뷰 체크
    result = await db.execute(
        select(Review).where(
            Review.restaurant_id == restaurant_id,
            Review.user_id == current_user.id
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(400, "이미 리뷰 작성함")

    # 3. 리뷰 생성
    review = Review(
        restaurant_id=restaurant_id,
        user_id=current_user.id,
        content=payload.content,
        rating=payload.rating,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(review)
    await db.flush()  # review.id 확보
    
    review_id = review.id  # 추가

    # 4. 메뉴 저장
    for m in payload.menus:
        db.add(ReviewMenu(review_id=review.id, name=m))

    await db.commit()

    return {"ok": True, "review_id": review.id}


# ---------------------------
# 리뷰 조회 (식당별)
# ---------------------------
@router.get("/restaurants/{restaurant_id}/reviews")
async def get_reviews(
    restaurant_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    result = await db.execute(
        select(Review).where(Review.restaurant_id == restaurant_id)
    )
    reviews = result.scalars().all()

    out = []

    for r in reviews:
        menu_rows = await db.execute(
            select(ReviewMenu.name).where(ReviewMenu.review_id == r.id)
        )
        menus = menu_rows.scalars().all()

        out.append({
            "id": r.id,
            "content": r.content,
            "rating": r.rating,
            "user_id": r.user_id,
            "menus": menus,
            "created_at": r.created_at,
            "like_count": r.like_count,
            "dislike_count": r.dislike_count
        })

    return out


# ---------------------------
# 리뷰 수정
# ---------------------------
@router.patch("/reviews/{review_id}")
async def update_review(
    review_id: int,
    payload: ReviewCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    review = await db.get(Review, review_id)

    if not review:
        raise HTTPException(404, "리뷰 없음")

    if review.user_id != current_user.id:
        raise HTTPException(403, "권한 없음")

    # 업데이트
    review.content = payload.content
    review.rating = payload.rating
    review.updated_at = datetime.utcnow()

    # 기존 메뉴 삭제
    await db.execute(
        ReviewMenu.__table__.delete().where(ReviewMenu.review_id == review_id)
    )

    # 새 메뉴 추가
    for m in payload.menus:
        db.add(ReviewMenu(review_id=review.id, name=m))

    await db.commit()

    return {"ok": True}


# ---------------------------
# 리뷰 삭제
# ---------------------------
@router.delete("/reviews/{review_id}")
async def delete_review(
    review_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    review = await db.get(Review, review_id)

    if not review:
        raise HTTPException(404, "리뷰 없음")

    if review.user_id != current_user.id:
        raise HTTPException(403, "권한 없음")

    await db.delete(review)
    await db.commit()

    return {"ok": True}