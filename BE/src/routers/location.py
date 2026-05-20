# BE/src/routers/location.py
"""
Location/Address extraction and geocoding API endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from typing import Optional, Dict, Any
import anyio

from BE.AddressLatLong import extract_location_from_link, kakao_keyword_search, validate_address_string

router = APIRouter(prefix="/api", tags=["Location"])

# ---------------------------
# 요청/응답 모델
# ---------------------------

class ExtractLocationRequest(BaseModel):
    """링크에서 주소, 위도, 경도 추출"""
    location_link: str
    
    @validator("location_link")
    def validate_url(cls, v: str):
        if not v or not v.strip():
            raise ValueError("location_link must not be empty")
        if not v.strip().startswith(("http://", "https://")):
            raise ValueError("location_link must start with http or https")
        return v.strip()


class ExtractLocationResponse(BaseModel):
    ok: bool
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    name: Optional[str] = None
    road_address: Optional[str] = None
    source: Optional[str] = None
    detail: Optional[str] = None


class GeocodeRequest(BaseModel):
    """주소에서 위도, 경도 추출 (역지오코딩)"""
    address: str
    
    @validator("address")
    def validate_address(cls, v: str):
        if not v or not v.strip():
            raise ValueError("address must not be empty")
        return v.strip()


class GeocodeResponse(BaseModel):
    ok: bool
    lat: Optional[float] = None
    lng: Optional[float] = None
    address: Optional[str] = None
    detail: Optional[str] = None


class ValidateAddressRequest(BaseModel):
    address: str

    @validator("address")
    def validate_address(cls, v: str):
        if not v or not v.strip():
            raise ValueError("address must not be empty")
        return v.strip()


class ValidateAddressResponse(BaseModel):
    ok: bool
    valid: bool
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    detail: Optional[str] = None


# ---------------------------
# API 엔드포인트
# ---------------------------

@router.post("/locations/extract", response_model=ExtractLocationResponse)
async def extract_location(request: ExtractLocationRequest):
    """
    지도 링크에서 주소, 위도, 경도 추출
    
    지원 지도: Kakao, Naver, Google
    
    Response:
    - address: 도로명 주소 또는 지번 주소
    - lat: 위도
    - lng: 경도 (경도)
    - name: 추출된 장소 이름 (있을 경우)
    """
    try:
        loc = await anyio.to_thread.run_sync(
            extract_location_from_link,
            request.location_link
        )
        
        if not loc:
            return ExtractLocationResponse(
                ok=False,
                detail="Failed to extract location from link"
            )
        
        return ExtractLocationResponse(
            ok=True,
            address=loc.get("road_address") or loc.get("address"),
            lat=loc.get("lat"),
            lng=loc.get("lng"),
            name=loc.get("name"),
            road_address=loc.get("road_address"),
            source=loc.get("source")
        )
        
    except Exception as e:
        return ExtractLocationResponse(
            ok=False,
            detail=f"Location extraction error: {str(e)}"
        )


@router.post("/locations/geocode", response_model=GeocodeResponse)
async def geocode_address(request: GeocodeRequest):
    """
    주소에서 위도, 경도 추출 (카카오 API 사용)
    
    주로 사용자가 직접 입력한 주소를 위도/경도로 변환할 때 사용
    
    Response:
    - lat: 위도
    - lng: 경도 (경도)
    - address: 검증된 주소
    """
    try:
        loc = await anyio.to_thread.run_sync(
            kakao_keyword_search,
            request.address,
            None,  # lat
            None   # lng
        )
        
        if not loc:
            return GeocodeResponse(
                ok=False,
                detail="Failed to geocode address"
            )
        
        return GeocodeResponse(
            ok=True,
            lat=loc.get("lat"),
            lng=loc.get("lng"),
            address=loc.get("address") or request.address
        )
        
    except Exception as e:
        return GeocodeResponse(
            ok=False,
            detail=f"Geocoding error: {str(e)}"
        )


@router.post("/locations/validate", response_model=ValidateAddressResponse)
async def validate_address(request: ValidateAddressRequest):
    """입력한 주소가 유효한지 검증하고, 유효한 경우 정규화된 주소와 좌표를 반환합니다."""
    try:
        loc = await anyio.to_thread.run_sync(
            validate_address_string,
            request.address
        )

        if not loc:
            return ValidateAddressResponse(
                ok=True,
                valid=False,
                detail="Invalid or unrecognized address"
            )

        return ValidateAddressResponse(
            ok=True,
            valid=True,
            address=loc.get("road_address") or loc.get("address") or request.address,
            lat=loc.get("lat"),
            lng=loc.get("lng"),
            detail="Valid address"
        )
    except Exception as e:
        return ValidateAddressResponse(
            ok=False,
            valid=False,
            detail=f"Address validation error: {str(e)}"
        )
