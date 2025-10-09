# BE/src/routers/restaurants_async.py

from fastapi import APIRouter, HTTPException, Query
import anyio

from BE.AddressLatLong import extract_location_from_link

router = APIRouter(prefix="/utils", tags=["Utils"])

# routes/utils.py
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
            "lon": loc.get("lng")
        }
    except Exception as e:
        return {"ok": False, "error": str(e)}
