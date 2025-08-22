from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi import File, UploadFile

from pydantic import BaseModel, HttpUrl, validator, conint
from typing import List, Optional, Dict, Any
from datetime import datetime
import shutil, os, time

import re
import secrets

from sqlalchemy.orm import Session
from BE.src.dependencies import get_db, get_current_user
from BE.src.models.users import User
from BE.src.models.restaurants import Restaurant, RestaurantTag, RestaurantImage
from BE.src.models.tags import Tag, TagCategory
from BE.src.models.regions import Region

from BE.AddressLatLong import (
    extract_location_from_link
)

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
    # 기존 validator("location_link") 교체
    @validator("location_link")
    def validate_location_link(cls, v: str):
        if not isinstance(v, str) or not v.strip():
            raise ValueError("location_link must be a non-empty string")

        if not re.match(r"^https?://", v):
            raise ValueError("location_link must be a valid URL (http/https)")

        # 네이버/카카오/구글 지도 링크 허용
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


# --- [GET /restaurants/{id}] 상세 조회 응답 모델 ---
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
    latitude: Optional[float] = None   # ✅ 모델에 포함
    longitude: Optional[float] = None  # ✅ 모델에 포함
    region: Optional[RegionOut] = None
    tags: List[RestaurantTagOut]
    rating: int
    summary: str
    description: str
    price_min: int
    price_max: int
    uploaded_by: int
    created_at: float


# --- [GET /restaurants] 목록 조회 응답 모델 ---
class RestaurantListItem(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    rating: int
    summary: str
    price_min: int
    price_max: int
    tags: List[RestaurantTagOut]
    
# 이미지

ALLOWED_IMAGE_CT = {"image/jpeg", "image/png", "image/webp"}
UPLOAD_DIR = "static/uploads"

class ImageOut(BaseModel):
    id: int
    image_url: str
    created_at: float
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
    

# 3. 식당 아카이빙
@router.post("/restaurants", response_model=CreateRestaurantResponse)
def create_restaurant(
    payload: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1) 주소 + 좌표 추출 (실패해도 흐름 계속)
    address, lat, lon = None, None, None
    try:
        loc = extract_location_from_link(str(payload.location_link))
        if loc:
            address = loc.get("road_address") or loc.get("address")
            lat, lon = loc.get("lat"), loc.get("lng")

    except Exception as e:
        # 💡 절대 return/raise 하지 않음 — 아래 insert는 항상 시도
        print(f"[주소 추출 실패] {e}")

    # 2) insert (항상 여기로 옴)
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

    # 3) 태그 매핑
    try:
        for tag_id in payload.tag_ids:
            rt = RestaurantTag(restaurant_id=restaurant.id, tag_id=tag_id)
            db.add(rt)
        db.commit()
    except Exception as e:
        db.rollback()
        return {"ok": False, "message": f"Tag insert error: {e}"}

    # 4) 최종 응답 — 반드시 dict 리턴
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

# 4. 식당 상세 조회
@router.get("/restaurants/{restaurant_id}")
def get_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  
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
        
    # 이미지 조회
    imgs = db.query(RestaurantImage).filter(RestaurantImage.restaurant_id == restaurant.id).all()
    image_list = [{"id": i.id, "image_url": i.image_url, "created_at": i.created_at} for i in imgs]

        
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
@router.put("/restaurants/{restaurant_id}", response_model=RestaurantDetailOut)
def update_restaurant(
    restaurant_id: int,
    payload: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # 권한 체크
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

    # 주소/좌표 재계산 (실패해도 흐름 유지)
    address, lat, lon = None, None, None
    try:
        loc = extract_location_from_link(str(payload.location_link))
        if loc:
            address = loc.get("road_address") or loc.get("address")
            lat, lon = loc.get("lat"), loc.get("lng")

    except Exception as e:
        print(f"[주소/좌표 추출 실패] {e}")

    # 반영
    restaurant.address = address
    restaurant.latitude = lat
    restaurant.longitude = lon
    

    # 태그 매핑 갱신
    db.query(RestaurantTag).filter(RestaurantTag.restaurant_id == restaurant.id).delete()
    for tag_id in payload.tag_ids:
        db.add(RestaurantTag(restaurant_id=restaurant.id, tag_id=tag_id))

    db.commit()
    db.refresh(restaurant)

    # 응답용 조인 (RestaurantDetailOut 스키마 맞춤)
    tag_q = (
        db.query(Tag.id, Tag.name)
        .join(RestaurantTag, RestaurantTag.tag_id == Tag.id)
        .filter(RestaurantTag.restaurant_id == restaurant.id)
        .all()
    )
    tags = [{"id": t.id, "name": t.name} for t in tag_q]

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
# ====================================================================================
# ========================================================================================
# 이미지

# 1. 이미지 업로드
from typing import List as TList
@router.post("/restaurants/{restaurant_id}/images", response_model=TList[ImageOut], status_code=201)
async def upload_restaurant_images(
    restaurant_id: int,
    # 단건 또는 다건 둘 다 허용
    files: Optional[TList[UploadFile]] = File(None, description="다건 업로드 시 사용"),
    file: Optional[UploadFile] = File(None, description="단건 업로드 시 사용"),
    replace: bool = Query(False, description="true면 기존 이미지 모두 교체"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 식당/권한 체크
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify images")

    # 업로드 대상 정규화
    uploads: TList[UploadFile] = []
    if file is not None:
        uploads.append(file)
    if files:
        uploads.extend(files)
    if not uploads:
        raise HTTPException(status_code=422, detail="file or files is required")

    # 타입 검증
    for u in uploads:
        if u.content_type not in ALLOWED_IMAGE_CT:
            raise HTTPException(status_code=415, detail=f"Unsupported type: {u.content_type}")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # 교체 모드라면 기존 레코드/파일 제거
    if replace:
        old_imgs = db.query(RestaurantImage).filter(RestaurantImage.restaurant_id == restaurant.id).all()
        for img in old_imgs:
            try:
                fp = img.image_url.lstrip("/")
                if os.path.exists(fp):
                    os.remove(fp)
            except Exception as e:
                print(f"[이미지 파일 삭제 실패] {e}")
            db.delete(img)
        db.flush()  # 같은 트랜잭션 내 정리

    # 저장
    out: TList[ImageOut] = []
    for u in uploads:
        ext = os.path.splitext(u.filename)[1].lower() or ".jpg"
        safe = f"{int(time.time()*1000)}_{secrets.token_hex(4)}{ext}"
        save_path = os.path.join(UPLOAD_DIR, safe)
        with open(save_path, "wb") as buf:
            shutil.copyfileobj(u.file, buf)

        img = RestaurantImage(
            restaurant_id=restaurant.id,
            image_url=f"/{save_path}",
            created_at=time.time()
        )
        db.add(img)
        db.flush()  # id 확보
        out.append(ImageOut(id=img.id, image_url=img.image_url, created_at=img.created_at))

    db.commit()
    return out

# 2. 이미지 삭제
@router.delete("/restaurants/{restaurant_id}/images/{image_id}", status_code=204)
def delete_restaurant_image(
    restaurant_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 식당 및 권한 확인
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete images")

    img = db.query(RestaurantImage).filter(
        RestaurantImage.id == image_id,
        RestaurantImage.restaurant_id == restaurant.id
    ).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    # 실제 파일도 지우기 (실패해도 DB 삭제는 진행)
    try:
        file_path = img.image_url.lstrip("/")   # "/static/uploads/..." → 상대경로
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"[이미지 파일 삭제 실패] {e}")

    db.delete(img)
    db.commit()
    return

# 3. 이미지 목록 조회

@router.get("/restaurants/{restaurant_id}/images", response_model=TList[ImageOut])
def list_restaurant_images(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    r = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    imgs = db.query(RestaurantImage).filter(RestaurantImage.restaurant_id == restaurant_id).all()
    return [{"id": i.id, "image_url": i.image_url, "created_at": i.created_at} for i in imgs]


# 4. 이미지 수정
from pydantic import BaseModel
from typing import Optional

class ImagePatch(BaseModel):
    is_cover: Optional[bool] = None
    caption: Optional[str] = None
    sort_order: Optional[int] = None

@router.patch("/restaurants/{restaurant_id}/images/{image_id}", response_model=ImageOut)
def patch_restaurant_image(
    restaurant_id: int,
    image_id: int,
    body: ImagePatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    img = db.query(RestaurantImage).filter(
        RestaurantImage.id == image_id,
        RestaurantImage.restaurant_id == restaurant.id
    ).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    # 업데이트할 필드 적용
    if body.is_cover is not None:
        if body.is_cover:  
            # 하나만 표지 허용 → 나머지는 false
            db.query(RestaurantImage).filter(
                RestaurantImage.restaurant_id == restaurant.id
            ).update({RestaurantImage.is_cover: False})
        img.is_cover = body.is_cover

    if body.caption is not None:
        img.caption = body.caption

    if body.sort_order is not None:
        img.sort_order = body.sort_order

    db.commit()
    db.refresh(img)
    return {"id": img.id, "image_url": img.image_url, "created_at": img.created_at}



