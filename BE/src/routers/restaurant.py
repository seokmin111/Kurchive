from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, HttpUrl, validator
from typing import List, Optional
from datetime import datetime
import re

from sqlalchemy.orm import Session
from BE.src.dependencies import get_db, get_current_user
from BE.src.models.users import User
from BE.src.models.restaurants import Restaurant, RestaurantTag
from BE.src.models.tags import Tag, TagCategory
from BE.src.models.regions import Region

from BE.AddressExtraction import get_address
from BE.AddressLatLong import get_coords_from_address

router = APIRouter()

# ---------------------------
# 요청 모델
# ---------------------------
class RestaurantCreate(BaseModel):
    name: str
    location_link: HttpUrl
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

# 1. 태그 조회
'''parent id가 없으면 자동으로 상위만 반환'''
@router.get("/tags")
def get_tags(
    category: Optional[str] = None,
    parent_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Tag)

    if category:
        query = query.join(TagCategory).filter(TagCategory.slug == category)

    if parent_id is None:
        # parent_id가 없으면 최상위 항목만
        query = query.filter(Tag.parent_id == None)
    else:
        # parent_id가 있으면 해당 하위 항목만
        query = query.filter(Tag.parent_id == parent_id)

    tags = query.all()

    return [
        {"id": t.id, "name": t.name, "parent_id": t.parent_id, "category_id": t.category_id}
        for t in tags
    ]

# 2. 지역 조회
'''parent id가 없으면 자동으로 상위만 반환'''
@router.get("/regions")
def get_regions(
    parent_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Region)

    if parent_id is None:
        # parent_id 없으면 최상위 지역만 (예: 서울특별시, 부산광역시)
        query = query.filter(Region.parent_id == None)
    else:
        # parent_id 있으면 해당 하위 지역만
        query = query.filter(Region.parent_id == parent_id)

    regions = query.all()

    return [
        {"id": r.id, "name": r.name, "parent_id": r.parent_id, "depth": r.depth}
        for r in regions
    ]

# 3. 식당 아카이빙 (등록)
@router.post("/restaurants")
def create_restaurant(
    payload: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 주소 + 좌표 추출
    try:
        address = get_address(str(payload.location_link))
        lat, lon = (None, None)
        if address:
            coords = get_coords_from_address(address)
            if coords:
                lat, lon = coords
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"주소/좌표 추출 실패: {e}")

    # insert
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

    # 태그 매핑
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
    
    
# 4. 식당 상세 조회
@router.get("/restaurants/{restaurant_id}")
def get_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 로그인 필요 없다면 제거 가능
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # 태그 join
    tag_q = (
        db.query(Tag.id, Tag.name)
        .join(RestaurantTag, RestaurantTag.tag_id == Tag.id)
        .filter(RestaurantTag.restaurant_id == restaurant.id)
        .all()
    )
    tags = [{"id": t.id, "name": t.name} for t in tag_q]

    # 지역 join
    region = (
        db.query(Region.id, Region.name, Region.parent_id, Region.depth)
        .filter(Region.id == restaurant.location_tag_id)
        .first()
    )
    region_dict = None
    if region:
        region_dict = {
            "id": region.id,
            "name": region.name,
            "parent_id": region.parent_id,
            "depth": region.depth,
        }

    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "address": restaurant.address,
        "location_link": restaurant.location_link,
        "latitude": restaurant.latitude,
        "longitude": restaurant.longitude,
        "region": region_dict,
        "tags": tags,
        "rating": restaurant.rating,
        "summary": restaurant.summary,
        "description": restaurant.description,
        "price_min": restaurant.price_min,
        "price_max": restaurant.price_max,
        "uploaded_by": restaurant.uploaded_by,
        "created_at": restaurant.created_at,
    }


