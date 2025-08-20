from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse

from pydantic import BaseModel, HttpUrl, validator, conint
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
class RestaurantCreate(BaseModel):
    name: str
    location_link: str
    location_tag_id: int
    rating: Optional[conint(ge=0, le=5)] = 0   # 0~5
    summary: str
    description: str
    price_min: int
    price_max: int
    tag_ids: List[int]
    # 사전 검증
    @validator("location_link")
    def validate_location_link(cls, v: str):
        if not isinstance(v, str) or not v.strip():
            raise ValueError("location_link must be a non-empty string")

        # URL 기본 형식 검증 (http:// or https://)
        if not re.match(r"^https?://", v):
            raise ValueError("location_link must be a valid URL (http/https)")

        # 네이버/카카오 지도 링크 허용
        if not (
            v.startswith("https://map.naver.com")
            or v.startswith("https://naver.me")
            or v.startswith("https://place.map.kakao.com")
            or v.startswith("https://map.kakao.com")
        ):
            raise ValueError("location_link must be a Naver Map or Kakao Map link")

        return v


    @validator("name", "summary", "description")
    def not_empty(cls, v):
        if not str(v).strip():
            raise ValueError("must not be empty")
        return v

    @validator("price_min", "price_max")
    def non_negative(cls, v):
        if v < 0:
            raise ValueError("price must be >= 0")
        return v

    @validator("tag_ids")
    def at_least_one_tag(cls, v):
        if not v:
            raise ValueError("at least one tag is required")
        return v

    @validator("price_max")
    def check_price_range(cls, v, values):
        pm = values.get("price_min")
        if pm is not None and v < pm:
            raise ValueError("price_max must be >= price_min")
        return v

# ---------------------------
# API 엔드포인트
# ---------------------------

# 1. 태그 조회
'''parent id가 없으면 자동으로 상위만 반환'''
@router.get("/tags")
def get_tags(
    category_id: Optional[int] = Query(None, alias="category_id"),
    parent_id: Optional[int] = Query(None, alias="parent_id"),
    db: Session = Depends(get_db)
):
    query = db.query(Tag)

    # category_id 필터 확실히 적용
    if category_id is not None:
        query = query.filter(Tag.category_id == category_id)

    if parent_id is None:
        query = query.filter(Tag.parent_id == None)
    else:
        query = query.filter(Tag.parent_id == parent_id)

    # 디버깅용 SQL 찍기
    print(str(query.statement.compile(compile_kwargs={"literal_binds": True})))

    tags = query.all()

    return [
        {
            "id": t.id,
            "name": t.name,
            "slug": t.slug,
            "parent_id": t.parent_id,
            "category_id": t.category_id,
            "is_selectable": t.is_selectable,
            "featured_rank": t.featured_rank,
        }
        for t in tags
    ]

    
## 카테고리 id 와 이름 보기 
@router.get("/tag-categories")
def get_tag_categories(db: Session = Depends(get_db)):
    categories = db.query(TagCategory).all()
    print("RAW categories:", categories)

    return [
        {"id": c.id, "name": c.name, "slug": c.slug}
        for c in categories
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
    try:
        # 주소 + 좌표 추출
        address, lat, lon = None, None, None
        try:
            address = get_address(str(payload.location_link))
            if address:
                coords = get_coords_from_address(address)
                if coords:
                    lat, lon = coords
        except Exception as e:
            return {"ok": False, "message": f"주소/좌표 추출 실패: {e}"}

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
            return {"ok": False, "message": f"DB insert error: {e}"}

        # 태그 매핑
        try:
            for tag_id in payload.tag_ids:
                rt = RestaurantTag(restaurant_id=restaurant.id, tag_id=tag_id)
                db.add(rt)
            db.commit()
        except Exception as e:
            db.rollback()
            return {"ok": False, "message": f"Tag insert error: {e}"}

        return {
            "ok": True,
            "message": "식당 등록 완료",
            "data": {
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
        }

    except Exception as e:
        # 예상 못 한 모든 에러도 여기서 잡힘
        return {"ok": False, "message": f"Unexpected error: {e}"}

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


# 5. 식당 목록 조회 (조건부 필터링)
'''region_id 없으면 지역 필터링 무시

price_min 없으면 하한 무시, price_max 없으면 상한 무시

tag_ids 없으면 태그 조건 무시, 있으면 AND 조건으로 모두 포함된 레스토랑만 반환'''

@router.get("/restaurants")
def list_restaurants(
    region_id: Optional[int] = None,
    tag_ids: Optional[str] = None,   # "10,101" 이런 식으로 받음
    price_min: Optional[int] = None,
    price_max: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 인증 필요 없으면 제거 가능
):
    query = db.query(Restaurant)

    # 지역 조건
    if region_id is not None:
        query = query.filter(Restaurant.location_tag_id == region_id)

    # 가격 조건
    if price_min is not None:
        query = query.filter(Restaurant.price_min >= price_min)
    if price_max is not None:
        query = query.filter(Restaurant.price_max <= price_max)

    restaurants = query.all()

    results = []
    for r in restaurants:
        # 태그 join
        tags = (
            db.query(Tag.id, Tag.name)
            .join(RestaurantTag, RestaurantTag.tag_id == Tag.id)
            .filter(RestaurantTag.restaurant_id == r.id)
            .all()
        )
        tag_list = [{"id": t.id, "name": t.name} for t in tags]

        # tag_ids 조건 필터링 (AND 조건)
        if tag_ids:
            requested = set(map(int, tag_ids.split(",")))
            current = set([t["id"] for t in tag_list])
            if not requested.issubset(current):
                continue  # 조건 불만족이면 skip

        results.append({
            "id": r.id,
            "name": r.name,
            "address": r.address,
            "rating": r.rating,
            "summary": r.summary,
            "price_min": r.price_min,
            "price_max": r.price_max,
            "tags": tag_list
        })

    return results

# 6. 식당 정보 수정
@router.put("/restaurants/{restaurant_id}")
def update_restaurant(
    restaurant_id: int,
    payload: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # 권한 체크 : 업로더 본인만 수정 가능
    if restaurant.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this restaurant")

    # 값 업데이트
    restaurant.name = payload.name
    restaurant.location_link = str(payload.location_link)
    restaurant.location_tag_id = payload.location_tag_id
    restaurant.rating = payload.rating
    restaurant.summary = payload.summary
    restaurant.description = payload.description
    restaurant.price_min = payload.price_min
    restaurant.price_max = payload.price_max

    # 주소 + 위경도 재계산
    try:
        address = get_address(str(payload.location_link))
        if address:
            restaurant.address = address
            coords = get_coords_from_address(address)
            if coords:
                restaurant.latitude, restaurant.longitude = coords
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"주소/좌표 추출 실패: {e}")

    # 태그 매핑 갱신
    db.query(RestaurantTag).filter(RestaurantTag.restaurant_id == restaurant.id).delete()
    for tag_id in payload.tag_ids:
        db.add(RestaurantTag(restaurant_id=restaurant.id, tag_id=tag_id))

    db.commit()
    db.refresh(restaurant)

    return {"message": "Restaurant updated", "id": restaurant.id}

# 7. 식당 삭제(Delete)
@router.delete("/restaurants/{restaurant_id}")
def delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if restaurant.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this restaurant")

    db.query(RestaurantTag).filter(RestaurantTag.restaurant_id == restaurant.id).delete()
    db.delete(restaurant)
    db.commit()

    return {"message": "Restaurant deleted", "id": restaurant_id}


# 8. 태그 검색 자동완성
@router.get("/tags/search")
def search_tags(q: str, db: Session = Depends(get_db)):
    tags = (
        db.query(Tag)
        .filter(Tag.name.like(f"%{q}%"))
        .limit(10)
        .all()
    )
    return [{"id": t.id, "name": t.name, "parent_id": t.parent_id, "category_id": t.category_id} for t in tags]



