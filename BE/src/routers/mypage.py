from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload 
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

router = APIRouter(prefix="/api/mypage", tags=["MyPage"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------- DTO --------
class MessageResponse(BaseModel):
    message: str

class UserResponseDTO(BaseModel):
    id: int            
    is_admin: bool     
    name: str
    nickname: str
    role: str
    created_at: Optional[datetime] 

    class Config:
        from_attributes = True

class NicknameUpdateRequest(BaseModel):
    nickname: str

class PasswordUpdateRequest(BaseModel):
    currentPW: str
    newPW: str

class FavoriteRestaurantDTO(BaseModel):
    id: int
    name: str
    address: Optional[str]
    rating: Optional[float]
    thumbnail_url: Optional[str] = None # 썸네일 추가 

    class Config:
        from_attributes = True

class FavoriteRecipeDTO(BaseModel):
    id: int
    title: str
    base_serving: int
    thumbnail_url: Optional[str] = None
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

class MyRecipeDTO(BaseModel):
    id: int
    title: str
    base_serving: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

class MyRestaurantDTO(BaseModel):
    id: int
    name: str
    address: Optional[str]
    rating: Optional[float]
    created_at: Optional[float]

    class Config:
        from_attributes = True

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

@router.get("/logs/restaurants", response_model=List[FavoriteRestaurantDTO])
async def get_my_favorite_restaurants(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    # JOIN을 사용하여 찜한 시간 역순으로 정렬
    stmt = (
        select(Restaurant, Favorite.created_at)
        .join(Favorite, Favorite.restaurant_id == Restaurant.id)
        .where(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    response = []
    for restaurant, fav_time in rows:
        # 썸네일(대표 이미지) 가져오기
        img_stmt = select(RestaurantImage).where(RestaurantImage.restaurant_id == restaurant.id).order_by(RestaurantImage.is_cover.desc(), RestaurantImage.id.asc()).limit(1)
        img = (await db.execute(img_stmt)).scalar_one_or_none()
        
        response.append({
            "id": restaurant.id,
            "name": restaurant.name,
            "address": restaurant.address,
            "rating": restaurant.rating,
            "thumbnail_url": img.image_url if img else None
        })
        
    return response

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
    
    return recipes

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
@router.get("/logs/recipes", response_model=List[MyRecipeDTO])
async def get_my_uploaded_recipes(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    result = await db.execute(
        select(Recipe)
        .where(Recipe.uploader_id == current_user.id)
        .order_by(Recipe.created_at.desc())
    )
    return result.scalars().all()

@router.get("/logs/restaurants-uploaded", response_model=List[MyRestaurantDTO])
async def get_my_uploaded_restaurants(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    result = await db.execute(
        select(Restaurant)
        .where(Restaurant.uploaded_by == current_user.id)
        .order_by(Restaurant.created_at.desc())
    )
    return result.scalars().all()