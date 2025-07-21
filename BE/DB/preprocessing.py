import csv
import pandas as pd

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
