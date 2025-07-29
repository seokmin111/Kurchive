from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool
import requests
import os
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

router = APIRouter()
KAKAO_REST_API_KEY = os.environ.get("KAKAO_REST_API_KEY")

# --- 카카오: 장소명으로 주소/위도/경도 검색 ---
def get_kakao_address_from_name(place_name: str) -> dict | None:
    """
    카카오 Local API: 장소명으로 주소 + 좌표 검색
    """
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {"query": place_name}

    res = requests.get(url, headers=headers, params=params)
    logger.debug(f"[get_kakao_address_from_name] status={res.status_code}")
    logger.debug(f"[get_kakao_address_from_name] raw={res.text}")

    if res.status_code != 200:
        return None

    data = res.json()
    documents = data.get("documents", [])
    if not documents:
        logger.warning(f"[get_kakao_address_from_name] 검색 결과 없음: {place_name}")
        return None

    doc = documents[0]
    return {
        "road_address": doc.get("road_address_name"),
        "address": doc.get("address_name"),
        "lat": doc.get("y"),
        "lon": doc.get("x"),
    }

# --- FastAPI 라우터 ---
@router.get("/map/address")
async def api_get_address(place_name: str):
    """
    장소명(식당 이름) 기반으로 카카오 Local API에서
    주소 + 위도/경도 검색
    """
    addr = await run_in_threadpool(get_kakao_address_from_name, place_name)
    return addr or {"error": "주소 검색 실패"}
