from pydantic import BaseModel
from typing import Optional
from datetime import datetime


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


class FavoriteRestaurantDTO(BaseModel):
    id: int
    name: str
    address: Optional[str]
    rating: Optional[float]
    thumbnail_url: Optional[str]


class FavoriteRecipeDTO(BaseModel):
    id: int
    title: str
    base_serving: int
    thumbnail_url: Optional[str]
    created_at: Optional[datetime]


class MyRecipeDTO(BaseModel):
    id: int
    title: str
    base_serving: int
    created_at: Optional[datetime]


class MyRestaurantDTO(BaseModel):
    id: int
    name: str
    address: Optional[str]
    rating: Optional[float]
    created_at: Optional[datetime]
    thumbnail_url: Optional[str]
    
class NicknameUpdateRequest(BaseModel):
    nickname: str


class PasswordUpdateRequest(BaseModel):
    currentPW: str
    newPW: str
