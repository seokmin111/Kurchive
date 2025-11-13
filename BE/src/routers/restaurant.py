# BE/src/routers/restaurant.py

from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator, conint
from typing import List, Optional, Dict, Any
from datetime import datetime
import os, re, time, secrets
from math import radians, sin, cos, asin, sqrt

import anyio
import aiofiles
from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession

from BE.src.dependencies import get_async_db, get_current_user_from_token
from BE.src.models.users import User
from BE.src.models.restaurants import Restaurant, RestaurantTag, RestaurantImage
from BE.src.models.tags import Tag, TagCategory
from BE.src.models.regions import Region
from BE.AddressLatLong import extract_location_from_link

from BE.src.utils.image_cleanup import cleanup_recipe_images, cleanup_restaurant_images
from BE.src.utils.image_upload import save_image_local, save_image_oci

# ---------------------------
# 공통 응답 헬퍼
# ---------------------------
def ok(data: Any = None, message: str = "OK", meta: Optional[Dict[str, Any]] = None, status_code: int = 200):
    payload = {"ok": True, "message": message, "data": data}
    if meta is not None:
        payload["meta"] = meta
    return JSONResponse(content=payload, status_code=status_code)

def fail(message: str, status_code: int = 400, meta: Optional[Dict[str, Any]] = None):
    payload = {"ok": False, "message": message, "data": None}
    if meta is not None:
        payload["meta"] = meta
    return JSONResponse(content=payload, status_code=status_code)

def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    """두 좌표(위도/경도) 사이 거리(km)"""
    if None in (lat1, lon1, lat2, lon2):
        return 10**9
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    return 2 * R * asin(sqrt(a))

'''
async def get_current_executive_user(current_user: User = Depends(get_current_user_from_token)) -> User:
    """
    현재 로그인한 유저가 임원(staff) 또는 관리자(admin)인지 확인
    권한이 없으면 403 Forbidden 에러
    """
    # is_privileged = current_user.role == 'staff' or current_user.is_admin
    is_privileged = current_user.role == 'staff' or current_user.is_admin
    if not is_privileged:
        raise HTTPException(
            status_code=403,
            detail="Executive or admin access required",
        )
    return current_user
'''

router = APIRouter()

# ---------------------------
# 요청/응답 모델
# ---------------------------
class RestaurantCreate(BaseModel):
    name: str
    location_link: str
    location_tag_id: int
    rating: Optional[conint(ge=0, le=5)] = 0
    summary: str
    description: str
    price_min: int
    price_max: int
    tag_ids: List[int]

    @validator("location_link")
    def validate_location_link(cls, v: str):
        if not isinstance(v, str) or not v.strip():
            raise ValueError("location_link must be a non-empty string")
        if not re.match(r"^https?://", v):
            raise ValueError("location_link must be a valid URL (http/https)")
        allowed = (
            v.startswith("https://map.kakao.com")
            or v.startswith("https://kko.kakao.com")
            or v.startswith("https://maps.app.goo.gl")
            or v.startswith("https://www.google.com/maps")
        )
        if not allowed:
            raise ValueError("location_link must be a Kakao or Google Maps link")
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

class RestaurantCreatedData(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    tags: List[int]
    region: int
    uploaded_by: int
    lat: Optional[float] = None
    lon: Optional[float] = None
    created_at: str

class CreateRestaurantResponse(BaseModel):
    ok: bool
    message: str
    data: RestaurantCreatedData

class RestaurantTagOut(BaseModel):
    id: int
    name: str

class RegionOut(BaseModel):
    id: int
    name: str
    parent_id: Optional[int] = None
    depth: Optional[int] = None

class RestaurantDetailOut(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    location_link: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    region: Optional[RegionOut] = None
    tags: List[RestaurantTagOut]
    rating: int
    summary: str
    description: str
    price_min: int
    price_max: int
    uploaded_by: int
    created_at: float

ALLOWED_IMAGE_CT = {"image/jpeg", "image/png", "image/webp"}

class ImageOut(BaseModel):
    id: int
    image_url: str
    created_at: float

# ---------------------------
# API 엔드포인트 (비동기)
# ---------------------------

# 1. 태그 조회
'''parent id가 없으면 자동으로 상위만 반환'''
@router.get("/tags")
async def get_tags(
    category_id: Optional[int] = Query(None, alias="category_id"),
    parent_id: Optional[int] = Query(None, alias="parent_id"),
    db: AsyncSession = Depends(get_async_db)
):
    stmt = select(Tag)
    if category_id is not None:
        stmt = stmt.where(Tag.category_id == category_id)
    if parent_id is None:
        stmt = stmt.where(Tag.parent_id.is_(None))
    else:
        stmt = stmt.where(Tag.parent_id == parent_id)

    result = await db.execute(stmt)
    tags = result.scalars().all()
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

# 1-2. 카테고리 조회
@router.get("/tag-categories")
async def get_tag_categories(db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(TagCategory))
    categories = result.scalars().all()
    return [{"id": c.id, "name": c.name, "slug": c.slug} for c in categories]

# 2. 지역 조회
'''parent id가 없으면 자동으로 상위만 반환'''
@router.get("/regions")
async def get_regions(
    parent_id: Optional[int] = None,
    db: AsyncSession = Depends(get_async_db)
):
    stmt = select(Region)
    if parent_id is None:
        stmt = stmt.where(Region.parent_id.is_(None))
    else:
        stmt = stmt.where(Region.parent_id == parent_id)
    result = await db.execute(stmt)
    regions = result.scalars().all()
    return [{"id": r.id, "name": r.name, "parent_id": r.parent_id, "depth": r.depth} for r in regions]

# 3. 식당 아카이빙
@router.post("/restaurants", response_model=CreateRestaurantResponse)
async def create_restaurant(
    payload: RestaurantCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    # 1) 주소 + 좌표 추출 (실패해도 흐름 계속)
    address, lat, lon = None, None, None
    try:
        loc = await anyio.to_thread.run_sync(extract_location_from_link, str(payload.location_link))
        if loc:
            address = loc.get("road_address") or loc.get("address")
            lat, lon = loc.get("lat"), loc.get("lng")
    except Exception as e:
        print(f"[주소 추출 실패] {e}")

    # 2) insert
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
        await db.commit()
        await db.refresh(restaurant)
    except Exception as e:
        await db.rollback()
        return {"ok": False, "message": f"DB insert error: {e}"}

    # 3) 태그 매핑
    try:
        for tag_id in payload.tag_ids:
            db.add(RestaurantTag(restaurant_id=restaurant.id, tag_id=tag_id))
        await db.commit()
    except Exception as e:
        await db.rollback()
        return {"ok": False, "message": f"Tag insert error: {e}"}

    # 4) 최종 응답
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
    
# 5. 식당 이름 검색
'''원래는 /restaurant/{restaurant_id} 밑에 있었는데 fastapi는 
정적 경로를 동적 경로보다 먼저 탐색하기 때문에 순서 바꿈.'''
@router.get("/restaurants/search")
async def search_restaurants_by_name(
    q: str,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """
    식당 이름 일부(q)로 식당을 검색합니다.
    부분 일치 검색 (LIKE %q%)
    """
    result = await db.execute(
        select(Restaurant).where(Restaurant.name.like(f"%{q}%")).limit(20)
    )
    restaurants = result.scalars().all()

    out = []
    for r in restaurants:
        # 대표이미지 조회
        img_row = await db.execute(
            select(RestaurantImage)
            .where(RestaurantImage.restaurant_id == r.id)
            .order_by(RestaurantImage.is_cover.desc(), RestaurantImage.id.asc())
            .limit(1)
        )
        img = img_row.scalar_one_or_none()

        out.append({
            "id": r.id,
            "name": r.name,
            "address": r.address,
            "rating": r.rating,
            "summary": r.summary,
            "price_min": r.price_min,
            "price_max": r.price_max,
            "thumbnail_url": img.image_url if img else None,
        })
    return out

# 4. 식당 상세 조회
@router.get("/restaurants/{restaurant_id}")
async def get_restaurant(
    restaurant_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    result = await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))
    restaurant = result.scalar_one_or_none()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # 태그
    tag_rows = await db.execute(
        select(Tag.id, Tag.name)
        .join(RestaurantTag, RestaurantTag.tag_id == Tag.id)
        .where(RestaurantTag.restaurant_id == restaurant.id)
    )
    tags = [{"id": t[0], "name": t[1]} for t in tag_rows.all()]

    # 지역
    region_row = await db.execute(
        select(Region.id, Region.name, Region.parent_id, Region.depth)
        .where(Region.id == restaurant.location_tag_id)
    )
    rr = region_row.first()
    region_dict = {"id": rr[0], "name": rr[1], "parent_id": rr[2], "depth": rr[3]} if rr else None

    # 이미지 (대표 여부 포함)
    imgs_result = await db.execute(
        select(RestaurantImage).where(RestaurantImage.restaurant_id == restaurant.id)
    )
    image_list = [
        {
            "id": i.id,
            "image_url": i.image_url,
            "created_at": i.created_at,
            "is_cover": getattr(i, "is_cover", False)   # ✅ 대표 여부 포함
        }
        for i in imgs_result.scalars().all()
    ]

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
        "images": image_list    # 모든 이미지 + 대표 여부
    }


# 5-1. 식당 목록 조회 (조건부 필터링)
'''region_id 없으면 지역 필터링 무시

price_min 없으면 하한 무시, price_max 없으면 상한 무시

tag_ids 없으면 태그 조건 무시, 있으면 AND 조건으로 모두 포함된 레스토랑만 반환'''
@router.get("/restaurants")
async def list_restaurants(
    region_id: Optional[int] = None,
    tag_ids: Optional[str] = None,
    price_min: Optional[int] = None,
    price_max: Optional[int] = None,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    stmt = select(Restaurant)
    if region_id is not None:
        stmt = stmt.where(Restaurant.location_tag_id == region_id)
    if price_min is not None:
        stmt = stmt.where(Restaurant.price_min >= price_min)
    if price_max is not None:
        stmt = stmt.where(Restaurant.price_max <= price_max)

    result = await db.execute(stmt)
    restaurants = result.scalars().all()

    results = []
    requested_ids: Optional[set[int]] = None
    if tag_ids:
        try:
            requested_ids = set(map(int, tag_ids.split(",")))
        except ValueError:
            requested_ids = None

    for r in restaurants:
        # 태그
        trows = await db.execute(
            select(Tag.id, Tag.name)
            .join(RestaurantTag, RestaurantTag.tag_id == Tag.id)
            .where(RestaurantTag.restaurant_id == r.id)
        )
        tag_list = [{"id": t[0], "name": t[1]} for t in trows.all()]

        if requested_ids:
            current = {t["id"] for t in tag_list}
            if not requested_ids.issubset(current):
                continue

        # 대표이미지 조회 (is_cover 우선, 없으면 첫 번째)
        img_row = await db.execute(
            select(RestaurantImage)
            .where(RestaurantImage.restaurant_id == r.id)
            .order_by(RestaurantImage.is_cover.desc(), RestaurantImage.id.asc())
            .limit(1)
        )
        img = img_row.scalar_one_or_none()

        results.append({
            "id": r.id,
            "name": r.name,
            "address": r.address,
            "region_id": r.location_tag_id,
            "rating": r.rating,
            "summary": r.summary,
            "price_min": r.price_min,
            "price_max": r.price_max,
            "tags": tag_list,
            "thumbnail_url": img.image_url if img else None,  
            "latitude": r.latitude,
            "longitude": r.longitude,
            "uploaded_by": r.uploaded_by,
            "created_at": r.created_at
        })

    return results


# 5-2. 현위치/임의좌표 근접 검색 (지도용)
"""
프론트 사용 예시:
GET /restaurants/nearby?lat=37.5665&lon=126.9780&radius_km=2.5&tag_ids=10,101

- lat, lon: 기준 좌표(현위치 또는 사용자가 입력한 주소의 좌표)
- radius_km: 반경(km), 기본 2.0
- tag_ids: "1,2,3" 형태(AND 조건)
- 가격 필터(price_min/price_max)도 선택 지원
응답: 지도 마커에 필요한 최소 필드 + distance_km
"""
@router.get("/restaurants/nearby")
async def list_restaurants_nearby(
    lat: float,
    lon: float,
    radius_km: float = 2.0,
    tag_ids: Optional[str] = None,
    price_min: Optional[int] = None,
    price_max: Optional[int] = None,
    limit: int = 200,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    stmt = select(Restaurant).where(
        Restaurant.latitude.is_not(None),
        Restaurant.longitude.is_not(None),
    )
    if price_min is not None:
        stmt = stmt.where(Restaurant.price_min >= price_min)
    if price_max is not None:
        stmt = stmt.where(Restaurant.price_max <= price_max)

    candidates = (await db.execute(stmt.limit(5000))).scalars().all()

    requested_ids: Optional[set[int]] = None
    if tag_ids:
        try:
            requested_ids = set(map(int, tag_ids.split(",")))
        except ValueError:
            requested_ids = None

    results = []
    for r in candidates:
        d = _haversine_km(lat, lon, r.latitude, r.longitude)
        if d <= radius_km:
            trows = await db.execute(
                select(Tag.id, Tag.name)
                .join(RestaurantTag, RestaurantTag.tag_id == Tag.id)
                .where(RestaurantTag.restaurant_id == r.id)
            )
            tag_list = [{"id": t[0], "name": t[1]} for t in trows.all()]

            if requested_ids:
                current = {t["id"] for t in tag_list}
                if not requested_ids.issubset(current):
                    continue

            # 대표이미지 조회
            img_row = await db.execute(
                select(RestaurantImage)
                .where(RestaurantImage.restaurant_id == r.id)
                .order_by(RestaurantImage.is_cover.desc(), RestaurantImage.id.asc())
                .limit(1)
            )
            img = img_row.scalar_one_or_none()

            results.append({
                "id": r.id,
                "name": r.name,
                "address": r.address,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "rating": r.rating,
                "price_min": r.price_min,
                "price_max": r.price_max,
                "tags": tag_list,
                "distance_km": round(d, 3),
                "thumbnail_url": img.image_url if img else None   # ✅ 대표이미지
            })

    results.sort(key=lambda x: x["distance_km"])
    return results[:max(1, min(limit, 500))]

# 5-3. 뷰포트(화면에 보이는 지도 영역) 내 식당 검색
"""
프론트 사용 예:
  const b = map.getBounds();
  GET /restaurants/viewport
      ?min_lat=${b.getSouthWest().lat}
      &min_lon=${b.getSouthWest().lng}
      &max_lat=${b.getNorthEast().lat}
      &max_lon=${b.getNorthEast().lng}
      &tag_ids=10,101
      &price_min=5000&price_max=20000
      &limit=200

- tag_ids: "1,2,3" 형태(AND 조건)
- price_min/price_max: 선택
- limit: 응답 상한(기본 200)
"""
@router.get("/restaurants/viewport")
async def list_restaurants_in_viewport(
    min_lat: float,
    min_lon: float,
    max_lat: float,
    max_lon: float,
    tag_ids: Optional[str] = None,
    price_min: Optional[int] = None,
    price_max: Optional[int] = None,
    limit: int = 200,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    if min_lat > max_lat:
        min_lat, max_lat = max_lat, min_lat
    if min_lon > max_lon:
        min_lon, max_lon = max_lon, min_lon

    stmt = select(Restaurant).where(
        Restaurant.latitude.is_not(None),
        Restaurant.longitude.is_not(None),
        Restaurant.latitude >= min_lat,
        Restaurant.latitude <= max_lat,
        Restaurant.longitude >= min_lon,
        Restaurant.longitude <= max_lon,
    )
    if price_min is not None:
        stmt = stmt.where(Restaurant.price_min >= price_min)
    if price_max is not None:
        stmt = stmt.where(Restaurant.price_max <= price_max)

    candidates = (await db.execute(stmt.limit(5000))).scalars().all()

    requested: Optional[set[int]] = None
    if tag_ids:
        try:
            requested = set(map(int, tag_ids.split(",")))
        except ValueError:
            requested = None

    results = []
    for r in candidates:
        trows = await db.execute(
            select(Tag.id, Tag.name)
            .join(RestaurantTag, RestaurantTag.tag_id == Tag.id)
            .where(RestaurantTag.restaurant_id == r.id)
        )
        tag_list = [{"id": t[0], "name": t[1]} for t in trows.all()]

        if requested:
            current = {t["id"] for t in tag_list}
            if not requested.issubset(current):
                continue

        results.append({
            "id": r.id,
            "name": r.name,
            "address": r.address,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "rating": r.rating,
            "price_min": r.price_min,
            "price_max": r.price_max,
            "tags": tag_list,
        })

    results.sort(key=lambda x: (-x["rating"], x["id"]))
    return results[:max(1, min(limit, 500))]

# 6. 식당 정보 수정
@router.put("/restaurants/{restaurant_id}", response_model=RestaurantDetailOut)
async def update_restaurant(
    restaurant_id: int,
    payload: RestaurantCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    result = await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))
    restaurant = result.scalar_one_or_none()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # 권한확인 
    is_uploader = restaurant.uploaded_by == current_user.id
    is_admin = current_user.is_admin
    if not (is_uploader or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized to perform this action")
    
    # 주소/좌표 재계산
    address, lat, lon = None, None, None
    try:
        loc = await anyio.to_thread.run_sync(extract_location_from_link, str(payload.location_link))
        if loc:
            address = loc.get("road_address") or loc.get("address")
            lat, lon = loc.get("lat"), loc.get("lng")
    except Exception as e:
        print(f"[주소/좌표 추출 실패] {e}")

    # 필드 반영
    restaurant.name = payload.name
    restaurant.location_link = str(payload.location_link)
    restaurant.location_tag_id = payload.location_tag_id
    restaurant.rating = payload.rating
    restaurant.summary = payload.summary
    restaurant.description = payload.description
    restaurant.price_min = payload.price_min
    restaurant.price_max = payload.price_max
    restaurant.address = address
    restaurant.latitude = lat
    restaurant.longitude = lon

    # 태그 갱신
    await db.execute(
        delete(RestaurantTag).where(RestaurantTag.restaurant_id == restaurant.id)
    )
    for tag_id in payload.tag_ids:
        db.add(RestaurantTag(restaurant_id=restaurant.id, tag_id=tag_id))

    await db.commit()
    await db.refresh(restaurant)

    # 응답용 조인
    tag_q = await db.execute(
        select(Tag.id, Tag.name)
        .join(RestaurantTag, RestaurantTag.tag_id == Tag.id)
        .where(RestaurantTag.restaurant_id == restaurant.id)
    )
    tags = [{"id": t[0], "name": t[1]} for t in tag_q.all()]

    region_row = await db.execute(
        select(Region.id, Region.name, Region.parent_id, Region.depth)
        .where(Region.id == restaurant.location_tag_id)
    )
    rr = region_row.first()
    region_dict = {"id": rr[0], "name": rr[1], "parent_id": rr[2], "depth": rr[3]} if rr else None

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

# 7. 식당 삭제(Delete)
@router.delete("/restaurants/{restaurant_id}")
async def delete_restaurant(restaurant_id: int, db: AsyncSession = Depends(get_async_db), current_user: User = Depends(get_current_user_from_token)):
    restaurant = (await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))).scalar_one_or_none()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    is_uploader = restaurant.uploaded_by == current_user.id
    is_admin = current_user.is_admin
    if not (is_uploader or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized to perform this action")

    # 헬퍼 호출
    imgs = (await db.execute(select(RestaurantImage).where(RestaurantImage.restaurant_id == restaurant.id))).scalars().all()
    await cleanup_restaurant_images(imgs)

    await db.execute(delete(RestaurantTag).where(RestaurantTag.restaurant_id == restaurant.id))
    await db.delete(restaurant)
    await db.commit()
    return {"message": "Restaurant deleted", "id": restaurant_id}


# 8. 태그 검색 자동완성
@router.get("/tags/search")
async def search_tags(q: str, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(
        select(Tag).where(Tag.name.like(f"%{q}%")).limit(10)
    )
    tags = result.scalars().all()
    return [{"id": t.id, "name": t.name, "parent_id": t.parent_id, "category_id": t.category_id} for t in tags]

# ============================
# 이미지
# ============================
from typing import List as TList
from BE.src.utils.image_upload import save_image, delete_image_oci  # ✅ 추가

@router.post("/restaurants/{restaurant_id}/images", response_model=TList[ImageOut], status_code=201)
async def upload_restaurant_images(
    restaurant_id: int,
    files: TList[UploadFile] = File(..., description="하나 이상 업로드"),
    replace: bool = Query(False, description="true면 기존 이미지 모두 교체"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    # 식당/권한 체크
    result = await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))
    restaurant = result.scalar_one_or_none()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    is_uploader = restaurant.uploaded_by == current_user.id
    is_admin = current_user.is_admin
    if not (is_uploader or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized to perform this action")

    if not files:
        raise HTTPException(status_code=422, detail="file(s) is required")

    for u in files:
        if u.content_type not in ALLOWED_IMAGE_CT:
            raise HTTPException(status_code=415, detail=f"Unsupported type: {u.content_type}")

    # 교체 모드: 기존 레코드/파일 제거
    if replace:
        old_imgs = (await db.execute(
            select(RestaurantImage).where(RestaurantImage.restaurant_id == restaurant.id)
        )).scalars().all()
        for img in old_imgs:
            try:
                delete_image_oci(img.image_url)  
            except Exception as e:
                print(f"[이미지 삭제 실패] {e}")
            await db.delete(img)
        await db.flush()

    out: TList[ImageOut] = []
    for i, u in enumerate(files):
        _, url_path = await save_image(u, f"restaurants/{restaurant_id}")

        # 첫 번째 업로드 이미지는 자동으로 썸네일로 지정
        img = RestaurantImage(
            restaurant_id=restaurant.id,
            image_url=url_path,
            created_at=time.time(),
            is_cover=(i == 0)
        )
        db.add(img)
        await db.flush()
        out.append(ImageOut(id=img.id, image_url=img.image_url, created_at=img.created_at))

    await db.commit()
    return out


@router.delete("/restaurants/{restaurant_id}/images/{image_id}", status_code=204)
async def delete_restaurant_image(
    restaurant_id: int,
    image_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    r = (await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))).scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if r.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete images")

    img = (await db.execute(
        select(RestaurantImage).where(
            RestaurantImage.id == image_id,
            RestaurantImage.restaurant_id == r.id
        )
    )).scalar_one_or_none()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    try:
        delete_image_oci(img.image_url)   # ✅ 로컬 삭제 → OCI 삭제
    except Exception as e:
        print(f"[이미지 삭제 실패] {e}")

    await db.delete(img)
    await db.commit()
    return


# 이미지 여러 개 삭제
@router.get("/restaurants/{restaurant_id}/images", response_model=TList[ImageOut])
async def list_restaurant_images(
    restaurant_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    r = (await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))).scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    imgs = (await db.execute(
        select(RestaurantImage).where(RestaurantImage.restaurant_id == restaurant_id)
    )).scalars().all()
    return [{"id": i.id, "image_url": i.image_url, "created_at": i.created_at} for i in imgs]


# 이미지 메타 수정
from typing import Optional as _Optional
class ImagePatch(BaseModel):
    is_cover: _Optional[bool] = None
    caption: _Optional[str] = None
    sort_order: _Optional[int] = None

@router.patch("/restaurants/{restaurant_id}/images/{image_id}", response_model=ImageOut)
async def patch_restaurant_image(
    restaurant_id: int,
    image_id: int,
    body: ImagePatch,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    r = (await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))).scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if r.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    img = (await db.execute(
        select(RestaurantImage).where(
            RestaurantImage.id == image_id,
            RestaurantImage.restaurant_id == r.id
        )
    )).scalar_one_or_none()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    if body.is_cover is not None:
        if body.is_cover:
            await db.execute(
                update(RestaurantImage)
                .where(RestaurantImage.restaurant_id == r.id)
                .values(is_cover=False)
            )
        img.is_cover = body.is_cover
    if body.caption is not None:
        img.caption = body.caption
    if body.sort_order is not None:
        img.sort_order = body.sort_order

    await db.commit()
    await db.refresh(img)
    return {"id": img.id, "image_url": img.image_url, "created_at": img.created_at}

"""프론트 호출
async function updateImageMeta(restaurantId: number, imageId: number, data: {
  is_cover?: boolean;
  caption?: string;
  sort_order?: number;
}) {
  const res = await fetch(`/api/restaurants/${restaurantId}/images/${imageId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 로그인 토큰 필요
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`이미지 메타 수정 실패: ${res.status}`);
  }

  return res.json(); // {id, image_url, created_at}
}

// 대표 이미지로 지정
await updateImageMeta(3, 42, { is_cover: true });

// 캡션 수정
await updateImageMeta(3, 42, { caption: "메뉴 사진" });

// 정렬 순서 수정
await updateImageMeta(3, 42, { sort_order: 2 });
"""