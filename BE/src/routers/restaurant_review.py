from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from BE.src.dependencies import get_async_db, get_current_user_from_token
from BE.src.models.users import User
from BE.src.models.restaurants import Restaurant
from BE.src.models.restaurant_reviews import Review, ReviewMenu, ReviewImage

from BE.src.utils.image_upload import save_image
from BE.src.utils.image_upload import delete_image_oci
import logging

logger = logging.getLogger("image_cleanup")


router = APIRouter()
'''프론트 흐름
1. 리뷰 작성 폼에서 이미지 선택
2. POST /restaurants/{restaurant_id}/reviews 로 multipart/form-data 전송
3. content, rating, menus, files를 한 번에 저장
'''

# ---------------------------
# DTO
# ---------------------------
# 리뷰 생성
class ReviewCreate(BaseModel):
    content: str = Field(max_length=300)
    rating: float
    menus: List[str] = [] # 추천 메뉴
    images: List[str] = [] # 이미지
    
# 리뷰 수정
class ReviewUpdate(BaseModel):
    content: Optional[str] = Field(default=None, max_length=300)
    rating: Optional[float] = None
    menus: Optional[List[str]] = None
    images: Optional[List[str]] = None

# 조회 응답
class ReviewOut(BaseModel):
    id: int
    content: str
    rating: float
    user_id: Optional[int]
    nickname: Optional[str]
    menus: List[str] # 추천 메뉴
    images: List[str] # 이미지
    created_at: datetime


# 이미지 삭제

async def cleanup_review_images(images):
    for img in images:
        try:
            delete_image_oci(img.image_url)
        except Exception as e:
            logger.warning(f"[리뷰 이미지 삭제 실패] {e}")
            
            
# ---------------------------
# 리뷰 생성
# ---------------------------
@router.post("/restaurants/{restaurant_id}/reviews")
async def create_review(
    restaurant_id: int,
    content: str = Form(...),
    rating: float = Form(...),
    menus: str = Form("[]"),
    files: List[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    restaurant = await db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(404, "식당 없음")

    menu_list = [m.strip() for m in menus.split(",") if m.strip()]

    review = Review(
        restaurant_id=restaurant_id,
        user_id=current_user.id,
        content=content,
        rating=rating,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(review)
    await db.flush()

    for m in menu_list:
        db.add(ReviewMenu(review_id=review.id, name=m))

    uploaded_images = []

    try:
        for i, file in enumerate(files):
            _, url = await save_image(file, f"reviews/{review.id}")

            uploaded_images.append(url)

            db.add(ReviewImage(
                review_id=review.id,
                image_url=url,
                sort_order=i
            ))

        await db.commit()

    except Exception as e:
        for url in uploaded_images:
            delete_image_oci(url)
        logger.error(f"[리뷰 이미지 업로드 실패] {e}")

        await db.rollback()
        raise e

    return {
        "ok": True,
        "review_id": review.id
    }
# ---------------------------
# 리뷰 조회 (식당별)
# ---------------------------
@router.get("/restaurants/{restaurant_id}/reviews")
async def get_reviews(
    restaurant_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    result = await db.execute(
    select(Review, User.nickname) # 리뷰와 닉네임 같이 뽑기
    .join(User, Review.user_id == User.id)
    .where(Review.restaurant_id == restaurant_id)
)

    rows = result.all()  

    out = []

    for r, nickname in rows:
        menu_rows = await db.execute(
            select(ReviewMenu.name).where(ReviewMenu.review_id == r.id)
        )
        menus = menu_rows.scalars().all()

        image_rows = await db.execute(
            select(ReviewImage.image_url)
            .where(ReviewImage.review_id == r.id)
            .order_by(ReviewImage.sort_order)
        )
        images = image_rows.scalars().all()

        out.append({
            "id": r.id,
            "content": r.content,
            "rating": r.rating,
            "user_id": r.user_id,
            "nickname": nickname,
            "menus": menus,
            "images": images,
            "created_at": r.created_at,
            "like_count": r.like_count,
            "dislike_count": r.dislike_count
        })



    return out


# ---------------------------
# 리뷰 수정
# ---------------------------
# 필드를 보내면 수정, 안 보내면 유지
@router.patch("/reviews/{review_id}")
async def update_review(
    review_id: int,
    payload: ReviewUpdate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    review = await db.get(Review, review_id)

    if not review:
        raise HTTPException(404, "리뷰 없음")

    if review.user_id != current_user.id:
        raise HTTPException(403, "권한 없음")

    if payload.content is not None:
        review.content = payload.content

    if payload.rating is not None:
        review.rating = payload.rating

    if payload.menus is not None:
        if not isinstance(payload.menus, list):
            raise HTTPException(400, "menus는 배열이어야 함")

        await db.execute(
            ReviewMenu.__table__.delete().where(ReviewMenu.review_id == review_id)
        )

        for m in payload.menus:
            db.add(ReviewMenu(review_id=review.id, name=m))

    if payload.images is not None:
        image_result = await db.execute(
            select(ReviewImage).where(ReviewImage.review_id == review_id)
        )
        old_images = image_result.scalars().all()

        await cleanup_review_images(old_images)

        await db.execute(
            ReviewImage.__table__.delete().where(ReviewImage.review_id == review_id)
        )

        for i, image_url in enumerate(payload.images):
            db.add(ReviewImage(
                review_id=review.id,
                image_url=image_url,
                sort_order=i
            ))

    review.updated_at = datetime.utcnow()

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

    image_result = await db.execute(
    select(ReviewImage).where(ReviewImage.review_id == review_id)
    )
    images = image_result.scalars().all()

    await cleanup_review_images(images)

    await db.delete(review)
    await db.commit()

    return {"ok": True}