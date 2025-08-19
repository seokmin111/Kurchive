

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, HttpUrl, validator
from typing import List, Optional
from datetime import datetime
import re
import logging

from sqlalchemy.orm import Session

from BE.AddressExtraction import get_address
from BE.AddressLatLong import get_coords_from_address


from BE.src.dependencies import get_db, get_current_user
from BE.src.models.tags import Tag
from BE.src.models.users import User
from BE.src.models.restaurants import Restaurant, RestaurantTag  # ORM 모델 불러온다고 가정

router = APIRouter()
logger = logging.getLogger("convert")

# ---------------------------
# 요청 모델
# ---------------------------
class RestaurantCreate(BaseModel):
    name: str
    address: str
    location_link: HttpUrl
    latitude: float
    longitude: float
    location_tag_id: int
    rating: Optional[int] = 0
    summary: str
    description: str
    price_min: int
    price_max: int
    tag_ids: List[int]

    @validator("location_link")
    def check_map_link(cls, v):
        if not (re.match(r"^https:\/\/map\.naver\.com", v) or re.match(r"^https:\/\/map\.kakao\.com", v)):
            raise ValueError("location_link must be a Naver Map or Kakao Map link")
        return v

# ---------------------------
# API 엔드포인트
# ---------------------------
## 태그 조회
@router.get("/tags")
def get_tags(category: Optional[str] = None, parent_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Tag)
    if category:
        query = query.filter(Tag.category.has(slug=category))  # category 관계 매핑했다고 가정
    if parent_id is not None:
        query = query.filter(Tag.parent_id == parent_id)
    tags = query.all()

    return [
        {"id": t.id, "name": t.name, "parent_id": t.parent_id, "category_id": t.category_id}
        for t in tags
    ]
    
## 지역 조회
@router.get("/regions")
def get_regions(parent_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Region)
    if parent_id is not None:
        query = query.filter(Region.parent_id == parent_id)
    regions = query.all()

    return [
        {"id": r.id, "name": r.name, "parent_id": r.parent_id, "depth": r.depth}
        for r in regions
    ]


# 식당 아카이빙
@router.post("/restaurants")
def create_restaurant(
    payload: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 0. 링크 기반 주소/위경도 추출
    try:
        address = get_address(str(payload.location_link))
        lat, lon = (None, None)
        if address:
            coords = get_coords_from_address(address)
            if coords:
                lat, lon = coords
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"주소/좌표 추출 실패: {e}")

    # 1. restaurants insert
    try:
        restaurant = Restaurant(
            name=payload.name,
            address=address,
            location_link=str(payload.location_link),
            latitude=lat,
            longitude=lon,
            location_tag_id=payload.location_tag_id,
            uploaded_by=current_user.id,
            rating=payload.rating,
            summary=payload.summary,
            description=payload.description,
            price_min=payload.price_min,
            price_max=payload.price_max,
            created_at=datetime.utcnow().timestamp()
        )
        db.add(restaurant)
        db.commit()
        db.refresh(restaurant)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"DB insert error: {e}")

    # 2. restaurant_tags insert
    try:
        for tag_id in payload.tag_ids:
            rt = RestaurantTag(restaurant_id=restaurant.id, tag_id=tag_id)
            db.add(rt)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Tag insert error: {e}")

    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "address": restaurant.address,
        "tags": payload.tag_ids,
        "region": restaurant.location_tag_id,
        "uploaded_by": current_user.id,
        "lat": restaurant.latitude,
        "lon": restaurant.longitude,
        "created_at": datetime.utcnow().isoformat()
    }