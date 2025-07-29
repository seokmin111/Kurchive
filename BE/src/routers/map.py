from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool
from BE.src.utils import address_sync

router = APIRouter()

@router.get("/map/address")
async def api_get_address(url: str):
    # 동기 함수를 별도 스레드에서 실행
    addr = await run_in_threadpool(address_sync.get_address, url)
    return addr or {"error": "주소 검색 실패"}

@router.get("/map/coords")
async def api_get_coords(address: str):
    coords = await run_in_threadpool(address_sync.get_coords_from_address, address)
    return coords or {"error": "좌표 검색 실패"}
