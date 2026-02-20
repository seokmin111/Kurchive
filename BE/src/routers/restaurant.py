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

from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator, conint
from typing import List, Optional, Dict, Any
from datetime import datetime
import os, re, time
import anyio

from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, and_, or_

from BE.src.dependencies import get_async_db, get_current_user_from_token
from BE.src.models.users import User
from BE.src.models.restaurants import Restaurant, RestaurantTag, RestaurantImage
from BE.src.models.tags import Tag, TagCategory
from BE.src.models.regions import Region

# 주소 추출 모듈 임포트
from BE.AddressLatLong import extract_location_from_link
from BE.src.utils.image_cleanup import cleanup_restaurant_images
from BE.src.utils.image_upload import save_image, delete_image_oci
from BE.src.utils.image_upload import ALLOWED_MIME

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
        v = v.strip() # 공백제거
        # 최소한의 URL 형식만 체크 (http로 시작하는지)
        if not re.match(r"^https?://", v):
            raise ValueError("location_link must be a valid URL (start with http/https)")
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

class RestaurantDetailOut(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    location_link: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    region: Optional[Any] = None 
    tags: List[Any]
    rating: int
    summary: str
    description: str
    price_min: int
    price_max: int
    uploaded_by: int
    created_at: float
    images: List[Any]

class ImageOut(BaseModel):
    id: int
    image_url: str
    created_at: float

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
    address, lat, lon = None, None, None
    print(f"[API] 주소 추출 시도: {payload.location_link}") # 디버깅 로그

    try:

        loc = await anyio.to_thread.run_sync(extract_location_from_link, str(payload.location_link))
        if loc:
            address = loc.get("road_address") or loc.get("address")
            lat, lon = loc.get("lat"), loc.get("lng")
            print(f" 주소 추출 성공: {address} ({lat}, {lon})")
        else:
            print("⚠️ 주소 추출 실패 (결과 없음)")
    except Exception as e:
        print(f"❌ 주소 추출 중 에러 발생: {e}")

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
        return JSONResponse(status_code=400, content={"ok": False, "message": f"DB insert error: {e}"})

    try:
        for tag_id in payload.tag_ids:
            db.add(RestaurantTag(restaurant_id=restaurant.id, tag_id=tag_id))
        await db.commit()
    except Exception as e:
        await db.rollback()
        return JSONResponse(status_code=400, content={"ok": False, "message": f"Tag insert error: {e}"})

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
    current_user: User = Depends(get_current_user_from_token)
):
    result = await db.execute(
        select(Restaurant).where(Restaurant.name.like(f"%{q}%")).limit(20)
    )
    restaurants = result.scalars().all()

    out = []
    for r in restaurants:
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

# 식당 상세 조회
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

    tag_rows = await db.execute(
        select(Tag.id, Tag.name)
        .join(RestaurantTag, RestaurantTag.tag_id == Tag.id)
        .where(RestaurantTag.restaurant_id == restaurant.id)
    )
    tags = [{"id": t[0], "name": t[1]} for t in tag_rows.all()]

    region_row = await db.execute(
        select(Region.id, Region.name, Region.parent_id, Region.depth)
        .where(Region.id == restaurant.location_tag_id)
    )
    rr = region_row.first()
    region_dict = {"id": rr[0], "name": rr[1], "parent_id": rr[2], "depth": rr[3]} if rr else None

    imgs_result = await db.execute(
        select(RestaurantImage).where(RestaurantImage.restaurant_id == restaurant.id)
    )
    image_list = [
        {
            "id": i.id,
            "image_url": i.image_url,
            "created_at": i.created_at,
            "is_cover": getattr(i, "is_cover", False)
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
        "images": image_list
    }

# 헬퍼 함수: 요청된 태그 ID들을 각각 [본인 + 자식들]의 집합(Set) 리스트로 변환
async def _build_tag_requirements(db: AsyncSession, tag_ids_str: str) -> List[set]:
    try:
        req_ids = list(map(int, tag_ids_str.split(",")))
    except ValueError:
        return []

    requirements = []
    for rid in req_ids:
        # 해당 태그의 자식 태그들 조회
        stmt = select(Tag.id).where(Tag.parent_id == rid)
        result = await db.execute(stmt)
        child_ids = result.scalars().all()
        
        # {본인 ID, 자식 ID 1, 자식 ID 2 ...} 집합 생성
        expanded_set = {rid} | set(child_ids)
        requirements.append(expanded_set)
    
    return requirements

# 식당 목록 조회
@router.get("/restaurants")
async def list_restaurants(
    region_id: Optional[int] = None,
    tag_ids: Optional[str] = None,
    price_min: Optional[int] = None,
    price_max: Optional[int] = None,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
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

    category_count = 0

    # -----------------------
    # 태그 필터 (핵심)
    # -----------------------
    if tag_ids:
        req_ids = list(map(int, tag_ids.split(",")))

        # tag + category 조회
        tag_rows = await db.execute(
            select(Tag.id, Tag.category_id).where(Tag.id.in_(req_ids))
        )
        tag_info = tag_rows.all()

        category_groups = {}
        for tid, cid in tag_info:
            category_groups.setdefault(cid, []).append(tid)

        category_count = len(category_groups)

        stmt = (
            stmt.join(RestaurantTag, Restaurant.id == RestaurantTag.restaurant_id)
            .join(Tag, Tag.id == RestaurantTag.tag_id)
        )

        or_conditions = []

        for cid, tids in category_groups.items():
            or_conditions.append(
                and_(
                    Tag.category_id == cid,
                    Tag.id.in_(tids)
                )
            )

        stmt = stmt.where(or_(*or_conditions))
        stmt = stmt.group_by(Restaurant.id)
        stmt = stmt.having(func.count(func.distinct(Tag.category_id)) == category_count)

    result = await db.execute(stmt)
    restaurants = result.scalars().all()

    return [
        {
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
            "uploaded_by": r.uploaded_by,
            "created_at": r.created_at
        }
        for r in restaurants
    ]
# 현위치/임의좌표 근접 검색
@router.get("/restaurants/nearby")
async def list_restaurants_nearby(
    lat: float,
    lon: float,
    radius_km: float = 2.0,
    tag_ids: Optional[str] = None,
    price_min: Optional[int] = None,
    price_max: Optional[int] = None,
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

    # ---- 태그 필터 동일 로직 ----
    if tag_ids:
        req_ids = list(map(int, tag_ids.split(",")))
        tag_rows = await db.execute(
            select(Tag.id, Tag.category_id).where(Tag.id.in_(req_ids))
        )
        tag_info = tag_rows.all()

        category_groups = {}
        for tid, cid in tag_info:
            category_groups.setdefault(cid, []).append(tid)

        category_count = len(category_groups)

        stmt = (
            stmt.join(RestaurantTag)
            .join(Tag)
            .where(or_(*[
                and_(Tag.category_id == cid, Tag.id.in_(tids))
                for cid, tids in category_groups.items()
            ]))
            .group_by(Restaurant.id)
            .having(func.count(func.distinct(Tag.category_id)) == category_count)
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

    # ---------------------------
    # 태그 조건 준비
    # ---------------------------
    category_expanded_sets = []

    if tag_ids:
        try:
            req_ids = list(map(int, tag_ids.split(",")))
        except ValueError:
            req_ids = []

        if req_ids:
            tag_rows = await db.execute(
                select(Tag.id, Tag.category_id).where(Tag.id.in_(req_ids))
            )
            tag_info = tag_rows.all()

            category_groups = {}
            for tid, cid in tag_info:
                category_groups.setdefault(cid, []).append(tid)

            for cid, tids in category_groups.items():
                expanded_set = set()

                for rid in tids:
                    child_stmt = select(Tag.id).where(Tag.parent_id == rid)
                    child_rows = await db.execute(child_stmt)
                    child_ids = child_rows.scalars().all()

                    expanded_set.update([rid] + child_ids)

                category_expanded_sets.append(expanded_set)

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
        current_tag_ids = {t["id"] for t in tag_list}

        if category_expanded_sets:
            is_match = True
            for expanded_set in category_expanded_sets:
                if current_tag_ids.isdisjoint(expanded_set):
                    is_match = False
                    break
            if not is_match:
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

# 식당 정보 수정
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

    is_uploader = restaurant.uploaded_by == current_user.id
    is_admin = current_user.is_admin
    if not (is_uploader or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized to perform this action")
    
    address, lat, lon = restaurant.address, restaurant.latitude, restaurant.longitude
    if payload.location_link != restaurant.location_link or not (lat and lon):
        try:
            loc = await anyio.to_thread.run_sync(extract_location_from_link, str(payload.location_link))
            if loc:
                address = loc.get("road_address") or loc.get("address")
                lat, lon = loc.get("lat"), loc.get("lng")
                print(f" (Update) 주소 재추출 성공: {address}")
        except Exception as e:
            print(f" (Update) 주소 추출 에러: {e}")

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

    imgs_result = await db.execute(select(RestaurantImage).where(RestaurantImage.restaurant_id == restaurant.id))
    images = [{"id": i.id, "image_url": i.image_url, "created_at": i.created_at} for i in imgs_result.scalars().all()]

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
        "images": images
    }

# 식당 삭제(Delete)
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
    is_uploader = restaurant.uploaded_by == current_user.id
    is_admin = current_user.is_admin
    if not (is_uploader or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized to perform this action")

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