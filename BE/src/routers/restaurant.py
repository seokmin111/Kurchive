# 식당 아카이빙

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from BE.src.dependencies import get_db

router = APIRouter()

# 나중에 식당 관련 API 여기에 추가 
@router.get("/restaurants/test")
def test_restaurant_router():
    return {"message": "Restaurant router working"}