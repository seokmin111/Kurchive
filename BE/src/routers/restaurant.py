# BE/src/routers/restaurant.py

'''
MAP_LINK_PREFIXES = (
    "https://map.kakao.com", # 됨
    # https://map.kakao.com/?map_type=TYPE_MAP&itemId=17067705&urlLevel=3&urlX=513558&urlY=1038202
    "https://kko.to", # 안됨
    # https://kko.to/4ceAbRJOxC 
    "https://kko.kakao.com", # 됨
    # https://kko.kakao.com/4ceAbRJOxC 
    "https://place.map.kakao.com", # 안됨 
    # https://place.map.kakao.com/17067705
    "https://naver.me", # 안됨 
    # https://naver.me/FuVEJDp0
    "https://map.naver.com", # 안됨 
    # https://map.naver.com/p/entry/place/35228977?lng=127.0601916&lat=37.2372403&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202601091547&locale=ko&svcName=map_pcv5&entry=plt&searchType=place&c=15.00,0,0,0,dh
    "https://m.place.naver.com", # 안됨 
    # https://m.place.naver.com/restaurant/35228977/home
    "https://maps.app.goo.gl", # 됨 
    # https://maps.app.goo.gl/4szoJcJkuczmMfyZ9
    "https://www.google.com/maps", # 됨
    # https://www.google.com/maps/place/%EC%97%B0%ED%99%94%EB%8B%B4/data=!4m6!3m5!1s0x357b44948a07c205:0x18c2058f8d95c4de!8m2!3d37.2466899!4d127.0587767!16s%2Fg%2F1td7fn8y?entry=ttu&g_ep=EgoyMDI2MDEwNi4wIKXMDSoASAFQAw%3D%3D
    "https://goo.gl"
)
'''

from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator, conint, confloat, constr
from typing import List, Optional, Dict, Any
from datetime import datetime
import os, re, time
import anyio

from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, and_, or_, exists
from sqlalchemy.orm import aliased

from BE.src.dependencies import get_async_db, get_current_user_from_token
from BE.src.models.users import User
from BE.src.models.restaurants import Restaurant, RestaurantTag, RestaurantImage
from BE.src.models.tags import Tag, TagCategory
from BE.src.models.regions import Region
from BE.src.models.favorites import Favorite

# 주소 추출 모듈 임포트
from BE.AddressLatLong import extract_location_from_link
from BE.src.utils.image_cleanup import cleanup_restaurant_images
from BE.src.utils.image_upload import save_image, delete_image_oci
from BE.src.utils.image_upload import ALLOWED_MIME
from BE.src.utils.user_serializer import build_uploader
from BE.src.utils.tags import expand_tag_ids

from BE.src.routers.utils import (
    normalize_link,
    check_create_restaurant_duplicates,
    check_update_restaurant_duplicates,
)

from urllib.parse import urlparse

ALLOWED_MAP_DOMAINS = {
    # Kakao
    "map.kakao.com",
    "kko.kakao.com",
    "place.map.kakao.com",
    "kko.to",
    # Naver
    "naver.me",
    #"map.naver.com",
    #"m.place.naver.com",
    # Google
    "maps.app.goo.gl",
    "www.google.com",
    "google.com",
    "goo.gl",
}

# 권한 구조
async def assert_can_edit_restaurant(restaurant: Restaurant, current_user: User):
    is_uploader = restaurant.uploaded_by == current_user.id
    is_privileged = current_user.role == "staff" or current_user.is_admin
    if not (is_uploader or is_privileged):
        raise HTTPException(status_code=403, detail="Not authorized")

async def assert_can_delete_restaurant(
    restaurant: Restaurant,
    current_user: User
):
    is_uploader = restaurant.uploaded_by == current_user.id
    is_admin = bool(current_user.is_admin)

    if not (is_uploader or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized to delete")
# ---------------------------
# 공통 응답 헬퍼
# ---------------------------
def ok(data: Any = None, message: str = "OK", meta: Optional[Dict[str, Any]] = None, status_code: int = 200):
    payload = {"ok": True, "message": message, "data": data}
    if meta is not None:
        payload["meta"] = meta
    return JSONResponse(content=payload, status_code=status_code)

router = APIRouter()

# ---------------------------
# 요청/응답 모델
# ---------------------------
class RestaurantCreate(BaseModel):
    name: str
    location_link: str
    address: Optional[str] = None  # 프론트에서 /locations/extract로 추출한 주소
    latitude: Optional[float] = None  # 프론트에서 /locations/extract로 추출한 위도
    longitude: Optional[float] = None  # 프론트에서 /locations/extract로 추출한 경도
    location_tag_id: int
    rating: Optional[confloat(ge=0, le=5)] = 0.0
    summary: constr(strip_whitespace=True, min_length=1, max_length=100)
    description: str
    price_min: int
    price_max: int
    recommended_menus: Optional[List[str]] = []
    tag_ids: List[int]
    force: Optional[bool] = False # 중복 의심이어도 등록할건지 말건지

    @validator("location_link")
    def validate_location_link(cls, v: str):

        if not isinstance(v, str) or not v.strip():
            raise ValueError("location_link must be a non-empty string")

        v = v.strip()

        if not re.match(r"^https?://", v):
            raise ValueError("location_link must start with http or https")

        parsed = urlparse(v)
        domain = parsed.netloc.lower()

        if domain not in ALLOWED_MAP_DOMAINS:
            raise ValueError(
                "지원하지 않는 지도 링크입니다.\n"
                "카카오맵 / 네이버맵 / 구글맵 링크만 입력 가능합니다."
            )

        return v

    @validator("name", "description")
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

class RestaurantDetailOut(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    location_link: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    region: Optional[Any] = None 
    tags: List[Any]
    rating: Optional[float]
    summary: str
    description: str
    price_min: int
    price_max: int
    uploaded_by: int
    created_at: float
    images: List[Any]
    recommended_menus: Optional[List[str]] = []

class ImageOut(BaseModel):
    id: int
    image_url: str
    created_at: float

class FavoriteToggleResponse(BaseModel):
    is_favorite: bool
    message: str

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    location_link: Optional[str] = None
    address: Optional[str] = None  # 프론트에서 /locations/extract|geocode로 추출한 주소
    latitude: Optional[float] = None  # 프론트에서 /locations/extract|geocode로 추출한 위도
    longitude: Optional[float] = None  # 프론트에서 /locations/extract|geocode로 추출한 경도
    location_tag_id: Optional[int] = None
    rating: Optional[confloat(ge=0, le=5)] = None
    summary: Optional[constr(strip_whitespace=True, min_length=1, max_length=100)] = None
    description: Optional[str] = None
    price_min: Optional[int] = None
    price_max: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    recommended_menus: Optional[List[str]] = None
    
    @validator("name", "description")
    def not_empty(cls, v):
        if v is None:
            return v
        if not str(v).strip():
            raise ValueError("must not be empty")
        return v
    
    @validator("tag_ids")
    def at_least_one_tag(cls, v):
        if v is None:
            return v
        if not v:
            raise ValueError("at least one tag is required")
        return v

    @validator("price_min", "price_max")
    def non_negative(cls, v):
        if v is None:
            return v
        if v < 0:
            raise ValueError("price must be >= 0")
        return v
    
    @validator("price_max")
    def check_price_range(cls, v, values):
        if v is None:
            return v
        pm = values.get("price_min")
        if pm is not None and v < pm:
            raise ValueError("price_max must be >= price_min")
        return v
    
    @validator("location_link")
    def validate_location_link(cls, v):

        if v is None:
            return v

        if not isinstance(v, str) or not v.strip():
            raise ValueError("location_link must be a non-empty string")

        v = v.strip()

        if not re.match(r"^https?://", v):
            raise ValueError("location_link must start with http or https")

        parsed = urlparse(v)
        domain = parsed.netloc.lower()

        if domain not in ALLOWED_MAP_DOMAINS:
            raise ValueError(
                "지원하지 않는 지도 링크입니다.\n"
                "카카오맵 / 네이버맵 / 구글맵 링크만 입력 가능합니다."
            )

        return v
# ---------------------------
# API 엔드포인트
# ---------------------------

# 태그 조회
@router.get("/tags")
async def get_tags(
    category_id: Optional[int] = Query(None, alias="category_id"),
    parent_id: Optional[int] = Query(None, alias="parent_id"),
    flatten: bool = Query(False, description="True일 경우 계층 무시하고 전체 조회"),
    db: AsyncSession = Depends(get_async_db)
):
    stmt = select(Tag)
    if category_id is not None:
        stmt = stmt.where(Tag.category_id == category_id)
    if not flatten:
        if parent_id is None:
            stmt = stmt.where(Tag.parent_id.is_(None))
        else:
            stmt = stmt.where(Tag.parent_id == parent_id)

    result = await db.execute(stmt)
    tags = result.scalars().all()
    return [{"id": t.id, "name": t.name, "slug": t.slug, "parent_id": t.parent_id, "category_id": t.category_id, "is_selectable": t.is_selectable, "featured_rank": t.featured_rank} for t in tags]

@router.get("/regions")
async def get_regions(
    parent_id: Optional[int] = None, 
    flatten: bool = Query(False),
    db: AsyncSession = Depends(get_async_db)):
    stmt = select(Region)
    if not flatten:
        if parent_id is None:
            stmt = stmt.where(Region.parent_id.is_(None))
        else:
            stmt = stmt.where(Region.parent_id == parent_id)
            
    result = await db.execute(stmt)
    regions = result.scalars().all()
    return [{"id": r.id, "name": r.name, "parent_id": r.parent_id, "depth": r.depth} for r in regions]


# 식당 아카이빙
@router.post("/restaurants", response_model=CreateRestaurantResponse)
async def create_restaurant(
    payload: RestaurantCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    # 프론트에서 /locations/extract로 이미 추출한 주소, 위도, 경도를 사용
    address = payload.address
    lat = payload.latitude
    lon = payload.longitude
    
    print(f"[API] 식당 생성: {payload.name} / 주소: {address} / 좌표: ({lat}, {lon})")

    dup_response = await check_create_restaurant_duplicates(
        db,
        name=payload.name,
        location_link=payload.location_link,
        address=address,
        lat=lat,
        lon=lon,
        force=bool(payload.force),
    )
    if dup_response:
        return dup_response

    # -------------------------
    # DB insert
    # -------------------------
    try:
        restaurant = Restaurant(
            name=payload.name,
            address=address,
            location_link=normalize_link(str(payload.location_link)) or str(payload.location_link),
            latitude=lat,
            longitude=lon,
            location_tag_id=payload.location_tag_id,
            uploaded_by=current_user.id,
            rating=payload.rating,
            summary=payload.summary,
            description=payload.description,
            price_min=payload.price_min,
            price_max=payload.price_max,
            recommended_menus=payload.recommended_menus,
            created_at=datetime.utcnow().timestamp()
        )
        db.add(restaurant)
        await db.commit()
        await db.refresh(restaurant)
    except Exception as e:
        await db.rollback()
        return JSONResponse(
            status_code=400,
            content={"ok": False, "message": f"DB insert error: {e}"}
        )

    # -------------------------
    # 태그 insert
    # -------------------------
    try:
        for tag_id in payload.tag_ids:
            db.add(RestaurantTag(
                restaurant_id=restaurant.id,
                tag_id=tag_id
            ))
        await db.commit()
    except Exception as e:
        await db.rollback()
        return JSONResponse(
            status_code=400,
            content={"ok": False, "message": f"Tag insert error: {e}"}
        )

    # -------------------------
    # 성공 응답
    # -------------------------
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
# 식당 이름 검색
@router.get("/restaurants/search")
async def search_restaurants_by_name(
    q: str,
    db: AsyncSession = Depends(get_async_db),
):
    result = await db.execute(
        select(Restaurant).where(Restaurant.name.like(f"%{q}%")).limit(20)
    )
    restaurants = result.scalars().all()

    out = []

    for r in restaurants:
        user = await db.get(User, r.uploaded_by)

        out.append({
            "id": r.id,
            "name": r.name,
            "address": r.address,
            "rating": r.rating,
            "summary": r.summary,
            "price_min": r.price_min,
            "price_max": r.price_max,
            "uploader": build_uploader(user),
            "thumbnail_url": r.thumbnail_url
        })

    return out

# 식당 상세 조회
'''같은 카테고리 내에 여러 태그가 들어옴 -> OR
다른 카테고리 -> AND
음식 태그에서 상위 태그만 선택시 -> 하위 태그를 포함하는 결과들도 전부 출력'''
@router.get("/restaurants/{restaurant_id}")
async def get_restaurant(
    restaurant_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    result = await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))
    restaurant = result.scalar_one_or_none()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    ParentTag = aliased(Tag)
    user = await db.get(User, restaurant.uploaded_by)

    tag_rows = await db.execute(
        select(
            Tag.id,
            Tag.name,
            Tag.parent_id,
            ParentTag.name.label("parent_name")
        )
        .join(RestaurantTag, RestaurantTag.tag_id == Tag.id)
        .outerjoin(ParentTag, ParentTag.id == Tag.parent_id)
        .where(RestaurantTag.restaurant_id == restaurant.id)
    )

    tags = [
        {
            "id": t.id,
            "name": t.name,
            "parent_id": t.parent_id,
            "parent_name": t.parent_name
        }
        for t in tag_rows.all()
    ]
    region_row = await db.execute(
        select(Region.id, Region.name, Region.parent_id, Region.depth)
        .where(Region.id == restaurant.location_tag_id)
    )
    rr = region_row.first()
    region_dict = {"id": rr[0], "name": rr[1], "parent_id": rr[2], "depth": rr[3]} if rr else None

    imgs_result = await db.execute(
    select(RestaurantImage)
    .where(RestaurantImage.restaurant_id == restaurant.id)
    .order_by(RestaurantImage.created_at.asc())
)

    image_list = [
        {
            "id": i.id,
            "image_url": i.image_url,
            "created_at": i.created_at,
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
        "uploader": build_uploader(user),
        "created_at": restaurant.created_at,
        "thumbnail_url": restaurant.thumbnail_url,
        "recommended_menus": restaurant.recommended_menus,
        "images": image_list
    }


# 식당 목록 조회
@router.get("/restaurants")
async def list_restaurants(
    region_id: Optional[int] = None,
    tag_ids: Optional[str] = None,
    price_min: Optional[int] = None,
    price_max: Optional[int] = None,
    rating_min: Optional[float] = Query(None, ge=0, le=5),
    rating_max: Optional[float] = Query(None, ge=0, le=5),
    db: AsyncSession = Depends(get_async_db)
):
    if rating_min is not None and rating_max is not None and rating_min > rating_max:
        raise HTTPException(status_code=422, detail="rating_min must be <= rating_max")

    stmt = select(Restaurant).distinct()

    # -----------------------
    # 지역 필터
    # -----------------------
    if region_id is not None:
        sub_stmt = select(Region.id).where(Region.parent_id == region_id)
        sub_result = await db.execute(sub_stmt)
        child_ids = sub_result.scalars().all()
        target_ids = [region_id] + child_ids
        stmt = stmt.where(Restaurant.location_tag_id.in_(target_ids))

    # -----------------------
    # 가격 필터
    # -----------------------
    if price_min is not None:
        stmt = stmt.where(Restaurant.price_min >= price_min)
    if price_max is not None:
        stmt = stmt.where(Restaurant.price_max <= price_max)

    # -----------------------
    # 별점 필터
    # -----------------------
    if rating_min is not None:
        stmt = stmt.where(Restaurant.rating >= rating_min)
    if rating_max is not None:
        stmt = stmt.where(Restaurant.rating <= rating_max)

    category_count = 0

    # -----------------------
    # 태그 필터 (핵심)
    # -----------------------
    if tag_ids:
        req_ids = [int(x) for x in tag_ids.split(",") if x]
        category_groups = await expand_tag_ids(db, req_ids)

        for tids in category_groups.values():
            stmt = stmt.where(
                exists().where(
                    and_(
                        RestaurantTag.restaurant_id == Restaurant.id,
                        RestaurantTag.tag_id.in_(tids)
                    )
                )
            )
    result = await db.execute(stmt)
    restaurants = result.scalars().all()

    out = []

    for r in restaurants:
        user = await db.get(User, r.uploaded_by)

        out.append({
            "id": r.id,
            "name": r.name,
            "address": r.address,
            "region_id": r.location_tag_id,
            "rating": r.rating,
            "summary": r.summary,
            "price_min": r.price_min,
            "price_max": r.price_max,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "uploader": build_uploader(user),
            "created_at": r.created_at,
            "thumbnail_url": r.thumbnail_url
        })

    return out
# 현위치/임의좌표 근접 검색
@router.get("/restaurants/nearby")
async def list_restaurants_nearby(
    lat: float,
    lon: float,
    radius_km: float = 2.0,
    tag_ids: Optional[str] = None,
    price_min: Optional[int] = None,
    price_max: Optional[int] = None,
    rating_min: Optional[float] = Query(None, ge=0, le=5),
    rating_max: Optional[float] = Query(None, ge=0, le=5),
    db: AsyncSession = Depends(get_async_db)
):
    if rating_min is not None and rating_max is not None and rating_min > rating_max:
        raise HTTPException(status_code=422, detail="rating_min must be <= rating_max")

    stmt = select(Restaurant).where(
        Restaurant.latitude.is_not(None),
        Restaurant.longitude.is_not(None),
    )

    if price_min is not None:
        stmt = stmt.where(Restaurant.price_min >= price_min)
    if price_max is not None:
        stmt = stmt.where(Restaurant.price_max <= price_max)

    if rating_min is not None:
        stmt = stmt.where(Restaurant.rating >= rating_min)
    if rating_max is not None:
        stmt = stmt.where(Restaurant.rating <= rating_max)

    # ---- 태그 필터 동일 로직 ----
    if tag_ids:
        req_ids = list(map(int, tag_ids.split(",")))
        category_groups = await expand_tag_ids(db, req_ids)

        for tids in category_groups.values():
            stmt = stmt.where(
                exists().where(
                    and_(
                        RestaurantTag.restaurant_id == Restaurant.id,
                        RestaurantTag.tag_id.in_(tids)
                    )
                ).correlate(Restaurant)
            )

    result = await db.execute(stmt)
    candidates = result.scalars().all()

    # 거리 계산만 수행
    results = []
    for r in candidates:
        d = _haversine_km(lat, lon, r.latitude, r.longitude)
        if d <= radius_km:
            results.append({
                "id": r.id,
                "name": r.name,
                "distance_km": round(d, 3),
                "rating": r.rating,
                "latitude": r.latitude,
                "longitude": r.longitude,
            })

    results.sort(key=lambda x: x["distance_km"])
    return results


# 뷰포트 검색
@router.get("/restaurants/viewport")
async def list_restaurants_in_viewport(
    min_lat: float,
    min_lon: float,
    max_lat: float,
    max_lon: float,
    tag_ids: Optional[str] = None,
    price_min: Optional[int] = None,
    price_max: Optional[int] = None,
    rating_min: Optional[float] = Query(None, ge=0, le=5),
    rating_max: Optional[float] = Query(None, ge=0, le=5),
    limit: int = 200,
    db: AsyncSession = Depends(get_async_db)
):
    if rating_min is not None and rating_max is not None and rating_min > rating_max:
        raise HTTPException(status_code=422, detail="rating_min must be <= rating_max")

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

    if rating_min is not None:
        stmt = stmt.where(Restaurant.rating >= rating_min)
    if rating_max is not None:
        stmt = stmt.where(Restaurant.rating <= rating_max)

    if tag_ids:
        req_ids = list(map(int, tag_ids.split(",")))
        category_groups = await expand_tag_ids(db, req_ids)

        for tids in category_groups.values():
            stmt = stmt.where(
                exists().where(
                    and_(
                        RestaurantTag.restaurant_id == Restaurant.id,
                        RestaurantTag.tag_id.in_(tids)
                    )
                ).correlate(Restaurant)
            )

    candidates = (await db.execute(stmt.limit(5000))).scalars().all()
    # ---------------------------
    # 필터링
    # ---------------------------
    results = []

    for r in candidates:
        trows = await db.execute(
            select(Tag.id, Tag.name)
            .join(RestaurantTag, RestaurantTag.tag_id == Tag.id)
            .where(RestaurantTag.restaurant_id == r.id)
        )
        tag_list = [{"id": t[0], "name": t[1]} for t in trows.all()]

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

# 식당 정보 수정
@router.patch("/restaurants/{restaurant_id}", response_model=RestaurantDetailOut)
async def update_restaurant(
    restaurant_id: int,
    payload: RestaurantUpdate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    result = await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))
    restaurant = result.scalar_one_or_none()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    user = await db.get(User, restaurant.uploaded_by)
    await assert_can_edit_restaurant(restaurant, current_user)

    update_data = payload.dict(exclude_unset=True)

    # 아무것도 안 바뀌었으면 그냥 기존 데이터 반환
    if not update_data:
        return await get_restaurant(restaurant_id, db)

    # -------------------------
    # 중복 검사 (링크/주소/근접)
    # - 수정 시 자기 자신은 제외
    # -------------------------
    next_link = update_data.get("location_link", restaurant.location_link)
    next_address = update_data.get("address", restaurant.address)
    next_lat = update_data.get("latitude", restaurant.latitude)
    next_lon = update_data.get("longitude", restaurant.longitude)
    next_name = update_data.get("name", restaurant.name)

    dup_response = await check_update_restaurant_duplicates(
        db,
        restaurant_id=restaurant.id,
        name=str(next_name),
        location_link=next_link,
        address=next_address,
        lat=next_lat,
        lon=next_lon,
    )
    if dup_response:
        return dup_response

    # -------------------------
    # 주소, 위도, 경도는 프론트에서 이미 추출한 값 사용
    # -------------------------
    for field in ["address", "latitude", "longitude"]:
        if field in update_data:
            setattr(restaurant, field, update_data[field])

    # -------------------------
    # 일반 필드 반영
    # -------------------------
    for field in [
        "name",
        "location_link",
        "location_tag_id",
        "rating",
        "summary",
        "description",
        "price_min",
        "price_max",
        "recommended_menus"
    ]:
        if field in update_data:
            if field == "location_link":
                setattr(
                    restaurant,
                    field,
                    normalize_link(update_data[field]) or update_data[field],
                )
            else:
                setattr(restaurant, field, update_data[field])

    # -------------------------
    # 태그 갱신 (있을 때만)
    # -------------------------
    if "tag_ids" in update_data:
        await db.execute(
            delete(RestaurantTag).where(RestaurantTag.restaurant_id == restaurant.id)
        )
        for tag_id in update_data["tag_ids"]:
            db.add(RestaurantTag(restaurant_id=restaurant.id, tag_id=tag_id))

    await db.commit()
    await db.refresh(restaurant)

    # -------------------------
    # 응답용 데이터 구성
    # -------------------------
    ParentTag = aliased(Tag)

    tag_rows = await db.execute(
        select(
            Tag.id,
            Tag.name,
            Tag.parent_id,
            ParentTag.name.label("parent_name")
        )
        .join(RestaurantTag, RestaurantTag.tag_id == Tag.id)
        .outerjoin(ParentTag, ParentTag.id == Tag.parent_id)
        .where(RestaurantTag.restaurant_id == restaurant.id)
    )

    tags = [
        {
            "id": t.id,
            "name": t.name,
            "parent_id": t.parent_id,
            "parent_name": t.parent_name
        }
        for t in tag_rows.all()
    ]

    region_row = await db.execute(
        select(Region.id, Region.name, Region.parent_id, Region.depth)
        .where(Region.id == restaurant.location_tag_id)
    )
    rr = region_row.first()
    region_dict = (
        {"id": rr[0], "name": rr[1], "parent_id": rr[2], "depth": rr[3]}
        if rr else None
    )

    imgs_result = await db.execute(
        select(RestaurantImage).where(RestaurantImage.restaurant_id == restaurant.id)
    )
    images = [
        {
            "id": i.id,
            "image_url": i.image_url,
            "created_at": i.created_at
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
        "uploader": build_uploader(user),
        "created_at": restaurant.created_at,
        "thumbnail_url": restaurant.thumbnail_url,
        "recommended_menus": restaurant.recommended_menus,
        "images": images
    }
    
# 식당 삭제(Delete)
@router.delete("/restaurants/{restaurant_id}")
async def delete_restaurant(restaurant_id: int, db: AsyncSession = Depends(get_async_db), current_user: User = Depends(get_current_user_from_token)):
    restaurant = (await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))).scalar_one_or_none()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    await assert_can_delete_restaurant(restaurant, current_user)
    # 헬퍼 호출
    imgs = (await db.execute(select(RestaurantImage).where(RestaurantImage.restaurant_id == restaurant.id))).scalars().all()
    await cleanup_restaurant_images(imgs)

    await db.execute(delete(RestaurantTag).where(RestaurantTag.restaurant_id == restaurant.id))
    await db.delete(restaurant)
    await db.commit()
    return {"message": "Restaurant deleted", "id": restaurant_id}


# 태그 검색 자동완성
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
from BE.src.utils.image_upload import save_image, delete_image_oci  #  추가

@router.post("/restaurants/{restaurant_id}/images", response_model=TList[ImageOut], status_code=201)
async def upload_restaurant_images(
    restaurant_id: int,
    files: List[UploadFile] = File(..., description="하나 이상 업로드"),
    replace: bool = Query(False, description="true면 기존 이미지 모두 교체"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    # 식당/권한 체크
    result = await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))
    restaurant = result.scalar_one_or_none()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    await assert_can_edit_restaurant(restaurant, current_user)
    if not files:
        raise HTTPException(status_code=422, detail="file(s) is required")

    for u in files:
        if u.content_type not in ALLOWED_MIME:
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
    for u in files:
        _, url_path = await save_image(u, f"restaurants/{restaurant_id}")

        img = RestaurantImage(
            restaurant_id=restaurant.id,
            image_url=url_path,
            created_at=time.time()
        )

        db.add(img)
        await db.flush()

        out.append(
            ImageOut(
                id=img.id,
                image_url=img.image_url,
                created_at=img.created_at
            )
        )
    await db.commit()
    return out

# thumbnail
@router.post("/restaurants/{restaurant_id}/thumbnail", status_code=201)
async def upload_restaurant_thumbnail(
    restaurant_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    restaurant = (await db.execute(
        select(Restaurant).where(Restaurant.id == restaurant_id)
    )).scalar_one_or_none()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    await assert_can_edit_restaurant(restaurant, current_user)
    
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=415, detail="Unsupported file type")

    _, url_path = await save_image(file, f"restaurants/{restaurant_id}/thumbnail")

    # 기존 썸네일 삭제 (선택)
    if restaurant.thumbnail_url:
        try:
            delete_image_oci(restaurant.thumbnail_url)
        except:
            pass

    restaurant.thumbnail_url = url_path
    await db.commit()

    return {"thumbnail_url": url_path}

@router.delete("/restaurants/{restaurant_id}/thumbnail", status_code=204)
async def delete_restaurant_thumbnail(
    restaurant_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    restaurant = (await db.execute(
        select(Restaurant).where(Restaurant.id == restaurant_id)
    )).scalar_one_or_none()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    await assert_can_edit_restaurant(restaurant, current_user)

    # 썸네일 없으면 그냥 204로 끝 (멱등)
    if not restaurant.thumbnail_url:
        return

    # OCI(또는 스토리지)에서 파일 삭제 시도
    try:
        delete_image_oci(restaurant.thumbnail_url)
    except Exception as e:
        # 스토리지 삭제 실패해도 DB는 정리해주는 게 UX상 보통 더 낫다
        # (원하면 여기서 500으로 막아도 됨)
        print(f"[썸네일 삭제 실패] {e}")

    restaurant.thumbnail_url = None
    await db.commit()
    return
# 이미지
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
    await assert_can_edit_restaurant(r, current_user)
    
    img = (await db.execute(
        select(RestaurantImage).where(
            RestaurantImage.id == image_id,
            RestaurantImage.restaurant_id == r.id
        )
    )).scalar_one_or_none()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    try:
        delete_image_oci(img.image_url)   #  로컬 삭제 → OCI 삭제
    except Exception as e:
        print(f"[이미지 삭제 실패] {e}")

    await db.delete(img)
    await db.commit()
    return


# 이미지 여러 개 삭제
@router.get("/restaurants/{restaurant_id}/images", response_model=TList[ImageOut])
async def list_restaurant_images(
    restaurant_id: int,
    db: AsyncSession = Depends(get_async_db)
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
    await assert_can_edit_restaurant(r, current_user)

    img = (await db.execute(
        select(RestaurantImage).where(
            RestaurantImage.id == image_id,
            RestaurantImage.restaurant_id == r.id
        )
    )).scalar_one_or_none()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    await db.commit()
    await db.refresh(img)
    return {"id": img.id, "image_url": img.image_url, "created_at": img.created_at}

# --- 즐겨찾기 여부 확인 API ---
@router.get("/restaurants/{restaurant_id}/favorite", response_model=FavoriteToggleResponse)
async def check_restaurant_favorite(
    restaurant_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    stmt = select(Favorite).where(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    )
    result = await db.execute(stmt)
    is_fav = result.scalar_one_or_none() is not None

    return {"is_favorite": is_fav, "message": "조회 완료"}

# --- 즐겨찾기 토글 (찜하기/취소) API ---
@router.post("/restaurants/{restaurant_id}/favorite", response_model=FavoriteToggleResponse)
async def toggle_restaurant_favorite(
    restaurant_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    # 식당 존재 여부 확인
    restaurant = await db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="식당을 찾을 수 없습니다.")

    # 기존 찜 여부 확인
    stmt = select(Favorite).where(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    )
    result = await db.execute(stmt)
    existing_fav = result.scalar_one_or_none()

    if existing_fav:
        # 이미 찜한 상태면 삭제 (취소)
        await db.delete(existing_fav)
        await db.commit()
        return {"is_favorite": False, "message": "즐겨찾기가 취소되었습니다."}
    else:
        # 찜하지 않은 상태면 추가
        new_fav = Favorite(user_id=current_user.id, restaurant_id=restaurant_id)
        db.add(new_fav)
        await db.commit()
        return {"is_favorite": True, "message": "즐겨찾기에 추가되었습니다."}
    
'''| API               | 써야 할 함수                      |
| ----------------- | ---------------------------- |
| update_restaurant | assert_can_edit_restaurant   |
| upload 이미지        | assert_can_edit_restaurant   |
| delete 이미지        | assert_can_edit_restaurant   |
| 썸네일 업/삭제          | assert_can_edit_restaurant   |
| delete_restaurant | assert_can_delete_restaurant |
'''
