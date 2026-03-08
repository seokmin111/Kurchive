from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from passlib.context import CryptContext

from BE.src.dependencies import get_current_user_from_token
from BE.src.database import get_async_db

from BE.src.models.users import User
from BE.src.models.recipes import Recipe
from BE.src.models.restaurants import Restaurant

from BE.src.models.favorites import Favorite, RecipeFavorite
from BE.src.models.restaurants import RestaurantImage

from BE.src.dto.mypage_dto import MessageResponse, MyRecipeDTO, MyRestaurantDTO, UserResponseDTO, FavoriteRecipeDTO, FavoriteRestaurantDTO, NicknameUpdateRequest, PasswordUpdateRequest


router = APIRouter(prefix="/api/mypage", tags=["MyPage"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# -------- 마이페이지 API --------
@router.get("", response_model=UserResponseDTO)
async def get_my_page_info(current_user: User = Depends(get_current_user_from_token)):
    return current_user

@router.put("/info/nickname", response_model=MessageResponse)
async def update_nickname(
    request: NicknameUpdateRequest,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    result = await db.execute(select(User).filter(User.nickname == request.nickname))
    existing_nick = result.scalar_one_or_none()
    if existing_nick and existing_nick.id != current_user.id:
        raise HTTPException(status_code=400, detail="이미 존재하는 닉네임입니다.")

    user_in_db = await db.get(User, current_user.id)
    user_in_db.nickname = request.nickname
    await db.commit()
    return {"message": "Nickname updated successfully"}

@router.put("/info/password", response_model=MessageResponse)
async def update_password(
    request: PasswordUpdateRequest,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    if not pwd_context.verify(request.currentPW, current_user.password):
        raise HTTPException(status_code=400, detail="현재 비밀번호가 일치하지 않습니다.")

    user_in_db = await db.get(User, current_user.id)
    user_in_db.password = pwd_context.hash(request.newPW)
    await db.commit()
    return {"message": "Password updated successfully"}

@router.get("/logs/favorite-restaurants", response_model=List[FavoriteRestaurantDTO])
async def get_my_favorite_restaurants(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):

    stmt = (
        select(
            Restaurant.id,
            Restaurant.name,
            Restaurant.address,
            Restaurant.rating,
            RestaurantImage.image_url
        )
        .join(Favorite, Favorite.restaurant_id == Restaurant.id)
        .outerjoin(
            RestaurantImage,
            (RestaurantImage.restaurant_id == Restaurant.id)
            & (RestaurantImage.is_cover == True)
        )
        .where(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
    )

    result = await db.execute(stmt)

    return [
        FavoriteRestaurantDTO(
            id=r.id,
            name=r.name,
            address=r.address,
            rating=r.rating,
            thumbnail_url=r.image_url
        )
        for r in result
    ]

@router.get("/logs/favorite-recipes", response_model=List[FavoriteRecipeDTO])
async def get_my_favorite_recipes(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """내가 찜한 레시피 목록 조회 (최신 찜한 순)"""
    stmt = (
        select(Recipe)
        .join(RecipeFavorite, RecipeFavorite.recipe_id == Recipe.id)
        .where(RecipeFavorite.user_id == current_user.id)
        .order_by(RecipeFavorite.created_at.desc())
    )
    result = await db.execute(stmt)
    recipes = result.scalars().all()
    
    return [
    FavoriteRecipeDTO(
        id=r.id,
        title=r.title,
        base_serving=r.base_serving,
        thumbnail_url=r.thumbnail_url,
        created_at=r.created_at
    )
    for r in recipes
]

@router.delete("/withdrawal", response_model=MessageResponse)
async def delete_user_account(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    user_to_delete = await db.get(User, current_user.id)
    if user_to_delete:
        await db.delete(user_to_delete)
        await db.commit()
    return {"message": "회원 탈퇴가 성공적으로 처리되었습니다."}

# 내 활동 기록
@router.get("/logs/uploaded-restaurants", response_model=List[MyRestaurantDTO])
async def get_my_uploaded_restaurants(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):

    stmt = (
        select(
            Restaurant.id,
            Restaurant.name,
            Restaurant.address,
            Restaurant.rating,
            Restaurant.created_at
        )
        .where(Restaurant.uploaded_by == current_user.id)
        .order_by(Restaurant.created_at.desc())
    )

    result = await db.execute(stmt)

    return [
        MyRestaurantDTO(
            id=r.id,
            name=r.name,
            address=r.address,
            rating=r.rating,
            created_at=r.created_at
        )
        for r in result
    ]
    
@router.get("/logs/uploaded-recipes", response_model=List[MyRecipeDTO])
async def get_my_uploaded_recipes(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):

    stmt = (
        select(
            Recipe.id,
            Recipe.title,
            Recipe.base_serving,
            Recipe.created_at
        )
        .where(Recipe.uploader_id == current_user.id)
        .order_by(Recipe.created_at.desc())
    )

    result = await db.execute(stmt)

    return [
        MyRecipeDTO(
            id=r.id,
            title=r.title,
            base_serving=r.base_serving,
            created_at=r.created_at
        )
        for r in result
    ]
