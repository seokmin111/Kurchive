import sys
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import csv
import pandas as pd
import re
import requests


from BE.AddressExtraction import get_address
from BE.AddressLatLong import get_coords_from_address


df = pd.read_csv('restaurants/restaurants.csv')
'''
id                  -- 자동 증가
name                -- CSV에서 있음
address             -- 링크에서 추출
location_link       -- CSV에서 있음 (주소랑 섞여 있음 → 분리 필요)
latitude            -- 주소 → 위경도 변환
longitude           -- ↑ same
location_tag_id     -- (현재 비움 or 서울/경기 등 주소 기반 후처리 가능)
uploaded_by         -- 일괄 1 (현재 사용자)
rating              -- CSV 있음
summary             -- CSV 있음
description         -- CSV 있음
price_min           -- 생략 (null로)
price_max           -- 생략 (null로)
created_at          -- CURRENT_TIMESTAMP 또는 null로

'''
processed_data = []
for idx, row in df.iterrows():
    name = row["Name"]
    summary = row["한줄평"]
    description = row["추천 메뉴/대표 메뉴"]
    
    # 별점
    raw_rating = row["별점"]
    if isinstance(raw_rating, str):
        rating = raw_rating.count("★")
    elif not pd.isna(raw_rating):
        # 혹시 숫자형으로 들어올 경우 (예외 처리용)
        rating = float(raw_rating)
    else:
        rating = None

    raw_location = row["위치"]
    location_link = None
    address = None

    if isinstance(raw_location, str):
        # 🔧 줄바꿈 기준 분리
        parts = raw_location.strip().splitlines()
        address = parts[0].strip() if len(parts) > 0 else None
        location_link = parts[1].strip() if len(parts) > 1 else None

    # 주소 → 위경도
    try:
        lat, lon = get_coords_from_address(address) if address else (None, None)
    except Exception as e:
        print(f"[{idx}] 좌표 변환 실패: {address} → {e}")
        lat, lon = (None, None)

    print(f"\n========== [{idx}] {name} ==========")
    print(f"📍 address: {address}")
    print(f"🔗 location_link: {location_link}")
    print(f"🧭 lat/lon: {lat}, {lon}")


    processed_data.append({
        "name": name,
        "address": address,
        "location_link": location_link,
        "latitude": lat,
        "longitude": lon,
        "location_tag_id": None,
        "uploaded_by": 1,
        "rating": rating,
        "summary": summary,
        "description": description,
        "price_min": None,
        "price_max": None,
        "created_at": None
    })
    
    # print(processed_data)


# 4. 저장
output_df = pd.DataFrame(processed_data)
output_df.to_csv("restaurants_ready.csv", index=False, encoding = "utf-8-sig")