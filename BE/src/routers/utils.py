from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
import anyio

from BE.AddressLatLong import extract_location_from_link
from BE.src.models.restaurants import Restaurant
from BE.src.utils.duplicate_det import find_duplicate_candidates

router = APIRouter(prefix="/utils", tags=["Utils"])


# ---------------------------
# 식당 중복 판별 유틸
# ---------------------------

def normalize_link(v: Optional[str]) -> Optional[str]:
    if v is None:
        return None
    v = str(v).strip()
    if not v:
        return None
    return v[:-1] if v.endswith("/") else v


def normalize_address(v: Optional[str]) -> Optional[str]:
    if v is None:
        return None
    v = str(v).strip()
    if not v:
        return None
    return v


async def find_exact_duplicates(
    db: AsyncSession,
    *,
    location_link: Optional[str],
    address: Optional[str],
    exclude_restaurant_id: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """링크/주소 완전 일치 중복 탐색."""
    link = normalize_link(location_link)
    addr = normalize_address(address)

    clauses = []
    if link:
        clauses.append(Restaurant.location_link == link)
    if addr:
        clauses.append(Restaurant.address == addr)

    if not clauses:
        return []

    stmt = select(Restaurant).where(or_(*clauses))
    if exclude_restaurant_id is not None:
        stmt = stmt.where(Restaurant.id != exclude_restaurant_id)

    rows = (await db.execute(stmt)).scalars().all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "address": r.address,
            "location_link": r.location_link,
        }
        for r in rows
    ]


async def _nearby_similar_duplicates(
    db: AsyncSession,
    *,
    name: str,
    lat: Optional[float],
    lon: Optional[float],
    exclude_restaurant_id: Optional[int] = None,
) -> List[Dict[str, Any]]:
    if lat is None or lon is None or not str(name).strip():
        return []

    try:
        candidates = await find_duplicate_candidates(
            db, str(name), float(lat), float(lon)
        )
    except Exception as e:
        print(f"[duplicate_det 실패] {e}")
        return []

    if exclude_restaurant_id is not None:
        candidates = [c for c in candidates if c.get("id") != exclude_restaurant_id]

    return [c for c in candidates if c.get("is_name_similar")]


async def check_create_restaurant_duplicates(
    db: AsyncSession,
    *,
    name: str,
    location_link: str,
    address: Optional[str],
    lat: Optional[float],
    lon: Optional[float],
    force: bool = False,
) -> Optional[JSONResponse]:
    exact_dups = await find_exact_duplicates(
        db,
        location_link=location_link,
        address=address,
        exclude_restaurant_id=None,
    )
    if exact_dups:
        return JSONResponse(
            status_code=409,
            content={
                "ok": False,
                "message": "이미 등록된 식당입니다. (링크 또는 주소가 동일)",
                "data": {"exact_matches": exact_dups},
            },
        )

    if not force:
        nearby = await _nearby_similar_duplicates(
            db, name=name, lat=lat, lon=lon
        )
        if nearby:
            return JSONResponse(
                status_code=409,
                content={
                    "ok": False,
                    "message": "이미 근처에 유사한 이름의 식당이 존재합니다. (중복 후보)",
                    "data": {"nearby_candidates": nearby},
                },
            )

    return None


async def check_update_restaurant_duplicates(
    db: AsyncSession,
    *,
    restaurant_id: int,
    name: str,
    location_link: Optional[str],
    address: Optional[str],
    lat: Optional[float],
    lon: Optional[float],
) -> Optional[JSONResponse]:
    exact_dups = await find_exact_duplicates(
        db,
        location_link=location_link,
        address=address,
        exclude_restaurant_id=restaurant_id,
    )
    if exact_dups:
        return JSONResponse(
            status_code=409,
            content={
                "ok": False,
                "message": "이미 등록된 식당입니다. (링크 또는 주소가 동일)",
                "data": {"exact_matches": exact_dups},
            },
        )

    nearby = await _nearby_similar_duplicates(
        db,
        name=name,
        lat=lat,
        lon=lon,
        exclude_restaurant_id=restaurant_id,
    )
    if nearby:
        return JSONResponse(
            status_code=409,
            content={
                "ok": False,
                "message": "이미 근처에 유사한 이름의 식당이 존재합니다. (중복 후보)",
                "data": {"nearby_candidates": nearby},
            },
        )

    return None


# ---------------------------
# 라우트
# ---------------------------

@router.get("/utils/location")
async def get_location_from_link(link: str):
    try:
        loc = await anyio.to_thread.run_sync(extract_location_from_link, link)
        if not loc:
            raise HTTPException(status_code=400, detail="주소 추출 실패")
        return {
            "ok": True,
            "address": loc.get("road_address") or loc.get("address"),
            "lat": loc.get("lat"),
            "lon": loc.get("lng"),
        }
    except Exception as e:
        return {"ok": False, "error": str(e)}
