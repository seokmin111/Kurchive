from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl, validator
from typing import List, Optional
from datetime import datetime
import sqlite3
import re
import logging

router = APIRouter()

logger = logging.getLogger("convert")


# ---------------------------
# DB connection
# ---------------------------
def get_db():
    conn = sqlite3.connect("app.db")
    conn.row_factory = sqlite3.Row
    return conn

# ---------------------------
# 요청 모델
# ---------------------------
class RestaurantCreate(BaseModel):
    name: str
    address: str
    location_link: HttpUrl
    latitude: float
    longitude: float
    location_tag_id: int
    uploaded_by: int
    rating: Optional[int] = 0
    summary: str
    description: str
    price_min: int
    price_max: int
    tag_ids: List[int]

    @validator("location_link")
    def check_map_link(cls, v):
        if not (re.match(r"^https:\/\/map\.naver\.com", v) or re.match(r"^https:\/\/map\.kakao\.com", v)):
            raise ValueError("location_link must be a Naver Map or Kakao Map link")
        return v

# ---------------------------
# API 엔드포인트
# ---------------------------

@router.post("/restaurants")
def create_restaurant(payload: RestaurantCreate):
    db = get_db()
    cur = db.cursor()

    # 1. restaurants 테이블 insert
    try:
        cur.execute("""
            INSERT INTO restaurants 
            (name, address, location_link, latitude, longitude,
             location_tag_id, uploaded_by, rating, summary, description,
             price_min, price_max, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            payload.name,
            payload.address,
            payload.location_link,
            payload.latitude,
            payload.longitude,
            payload.location_tag_id,
            payload.uploaded_by,
            payload.rating,
            payload.summary,
            payload.description,
            payload.price_min,
            payload.price_max,
            datetime.utcnow().timestamp()
        ))
        restaurant_id = cur.lastrowid
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"DB insert error: {e}")

    # 2. restaurant_tags 테이블 insert
    try:
        for tag_id in payload.tag_ids:
            cur.execute("""
                INSERT INTO restaurant_tags (restaurant_id, tag_id)
                VALUES (?, ?)
            """, (restaurant_id, tag_id))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Tag insert error: {e}")

    db.commit()

    return {
        "id": restaurant_id,
        "name": payload.name,
        "address": payload.address,
        "tags": payload.tag_ids,
        "region": payload.location_tag_id,
        "created_at": datetime.utcnow().isoformat()
    }
