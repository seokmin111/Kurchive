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
from BE.src.models.restaurants import Restaurant

router = APIRouter(prefix="/api/mypage", tags=["MyPage"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------- DTO --------
class MessageResponse(BaseModel):
    message: str

class UserResponseDTO(BaseModel):
    name: str
    nickname: str
    role: str
    created_at: datetime
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
    result = await db.execute(
        select(User).options(selectinload(User.favorites).selectinload("restaurant"))
        .filter(User.id == current_user.id)
    )
    user_with_favorites = result.scalar_one()
    return [fav.restaurant for fav in user_with_favorites.favorites if fav.restaurant]

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