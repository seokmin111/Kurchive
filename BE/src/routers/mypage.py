# BE/src/routers/mypage.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from passlib.context import CryptContext

from BE.src.dependencies import get_db, get_current_user
from BE.src.models.users import User
from BE.src.models.restaurants import Restaurant

router = APIRouter(prefix="/api/mypage", tags=["MyPage"])


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# DTO

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


# 마이페이지 API

@router.get("", response_model=UserResponseDTO)
def get_my_page_info(current_user: User = Depends(get_current_user)):
    """
    (로그인 필요) 마이페이지 메인 화면 정보 조회
    """
    return current_user

@router.put("/info/nickname", response_model=MessageResponse)
def update_nickname(
    request: NicknameUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    (로그인 필요) 닉네임 변경
    """
    existing_nick = db.query(User).filter(User.nickname == request.nickname).first()
    if existing_nick and existing_nick.id != current_user.id:
        raise HTTPException(status_code=400, detail="이미 존재하는 닉네임입니다.")

    current_user.nickname = request.nickname
    db.commit()
    return {"message": "Nickname updated successfully"}

@router.put("/info/password", response_model=MessageResponse)
def update_password(
    request: PasswordUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    (로그인 필요) 비밀번호 변경
    """
    if not pwd_context.verify(request.currentPW, current_user.password):
        raise HTTPException(status_code=400, detail="현재 비밀번호가 일치하지 않습니다.")

    current_user.password = pwd_context.hash(request.newPW)
    db.commit()
    return {"message": "Password updated successfully"}

@router.get("/logs/restaurants", response_model=List[FavoriteRestaurantDTO])
def get_my_favorite_restaurants(current_user: User = Depends(get_current_user)):
    """
    (로그인 필요) 내가 찜한 식당 목록 조회
    """
    return [fav.restaurant for fav in current_user.favorites if fav.restaurant]

@router.delete("/withdrawal", response_model=MessageResponse)
def delete_user_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    (로그인 필요) 회원 탈퇴
    """
    db.delete(current_user)
    db.commit()
    return {"message": "회원 탈퇴가 성공적으로 처리되었습니다."}