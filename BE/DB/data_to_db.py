import sqlite3
import pandas as pd

csv_path = "restaurants_ready.csv"
sqlite_path = "BE/DB/Data.db"

df = pd.read_csv(csv_path, encoding = "utf-8")
df["location_tag_id"] = 1

cols = [
    "name","address","location_link","latitude","longitude",
    "location_tag_id","uploaded_by","rating","summary","description",
    "price_min","price_max","created_at"
]
df = df[cols].where(pd.notnull(df), None)

records = list(df.itertuples(index=False, name=None))

sql = """
INSERT INTO restaurants
(name, address, location_link, latitude, longitude,
 location_tag_id, uploaded_by, rating, summary, description,
 price_min, price_max, created_at)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
"""

conn = sqlite3.connect(sqlite_path)
with conn:
    conn.executemany(sql, records)
print("✅", len(records), "rows inserted.")


'''
import pandas as pd
import sqlite3
import numpy as np


# 1. 전처리된 CSV 불러오기
df = pd.read_csv("ingredients_cleaned.csv", encoding="utf-8")

# 2. NaN → None 처리 (SQLite에서 NULL로 자동 반영됨)
df = df.where(pd.notnull(df), None)

# 3. SQLite 연결
# conn = sqlite3.connect("BE/DB/Data.db")
conn = sqlite3.connect("Data.db")
cursor = conn.cursor()

# 4. INSERT 실행
for _, row in df.iterrows():
    cursor.execute("""
        INSERT INTO ingredients (name, density, average_weight, unit_type, category_id)
        VALUES (?, ?, ?, ?, ?)
    """, (
        row['name'],
        row['density'],
        row['average_weight'],
        row['unit_type'],
        row['category_id']
    ))

# 5. 커밋하고 닫기
conn.commit()
conn.close()

print("✅ Data.db에 ingredients 테이블 삽입 완료!")

'''
'''

# 1. CSV 파일 불러오기
df = pd.read_csv("../recipes/ingredients_info.csv", encoding="utf-8")

# 2. 컬럼 이름 정리
df.columns = df.columns.str.strip().str.lower()
df = df.rename(columns={
    'average weight': 'average_weight',
    '재료 타입': 'unit_type',
    '15ml당 g': 'per_15ml'
})

# 3. 필요한 컬럼만 추출
df = df[['name', 'average_weight', 'density', 'unit_type']]

# 4. 빈 칸은 NaN으로 변환
df = df.replace(r'^\s*$', np.nan, regex=True)

# 5. density와 average_weight 중 적어도 하나는 있어야 하므로, 둘 다 없는 행 제거
df = df[~(df['density'].isna() & df['average_weight'].isna())]

# 6. 데이터 형 변환
df['density'] = pd.to_numeric(df['density'], errors='coerce')
df['average_weight'] = pd.to_numeric(df['average_weight'], errors='coerce')

# 7. category_id는 지금은 NULL로
df['category_id'] = np.nan

# 8. 저장
df.to_csv("ingredients_cleaned.csv", index=False, encoding="utf-8")
print("전처리 완료: ingredients_cleaned.csv 로 저장됨!")
'''
'''
import sqlite3
import pandas as pd

# CSV 불러오기
df = pd.read_csv("restaurants_ready.csv")
print(df.head())
# DB 연결
conn = sqlite3.connect("BE/DB/Data.db")
cursor = conn.cursor()


# DataFrame → DB 삽입
conn.execute("PRAGMA foreign_keys = OFF;")
df.to_sql("restaurants", conn, if_exists="replace", index=False)

conn.commit()
conn.close()
print("업로드 완료")

import sqlite3
conn = sqlite3.connect("Data.db")
cursor = conn.cursor()

import os
print(os.path.abspath("Data.db"))
'''