# -*- coding: utf-8 -*-
"""
SQLite -> MySQL migration (ORM 모델 불필요, 리플렉션 기반)
- SQLite 스키마를 반영(reflect)해서 MySQL에 동일 스키마 생성
- FK 의존 순서(sorted_tables)대로 전 테이블 데이터 복사
- 이관 중 FOREIGN_KEY_CHECKS=0
- AUTO_INCREMENT 재설정
"""

import os
from urllib.parse import quote_plus
from typing import Dict
from sqlalchemy import create_engine, MetaData, Table, Text, select, func, String, text, DateTime, Integer
from sqlalchemy.engine import Engine, Connection
from dotenv import load_dotenv
import datetime

import re
import unicodedata
from unidecode import unidecode
#  경로/환경 설정 
# 스크립트 위치 기준으로 프로젝트 루트 계산 (…/252Kurchive)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

load_dotenv(os.path.join(BASE_DIR, ".dev.env"))  # 루트의 .env 로드

# SQLite 경로 (필요시 수정)
SQLITE_PATH = os.path.join(BASE_DIR, "DB", "Data.db")
print("SQLITE_PATH =", SQLITE_PATH)


# MySQL 접속정보 (.env에서)
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASS = quote_plus(os.getenv("MYSQL_PASSWORD") or "")
MYSQL_DB   = os.getenv("MYSQL_DATABASE")
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")

print("MYSQL_HOST from .env =", os.getenv("MYSQL_HOST"))
print("Full MySQL URL = ",
      f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASS}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}?charset=utf8mb4")


#  엔진 
# SQLite (UTF-8 기본)
sqlite_engine: Engine = create_engine(
    f"sqlite:///{SQLITE_PATH}",
    connect_args={"check_same_thread": False}
)

# MySQL (UTF-8 MB4 + Unicode 강제)
mysql_engine: Engine = create_engine(
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASS}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}",
    connect_args={
        "charset": "utf8mb4",     # 4바이트 UTF-8
        "use_unicode": True       # Python ↔ MySQL Unicode 변환 강제
    },
    pool_pre_ping=True,
    echo=False  # True로 하면 쿼리 로그 확인 가능
)


#  스키마 리플렉션(원본) & 생성(목적지) 
src_md = MetaData()
src_md.reflect(bind=sqlite_engine)   # SQLite의 모든 테이블/FK/인덱스 최대한 반영

for table in src_md.tables.values():
    for col in table.columns:
        if isinstance(col.type, String) and col.type.length is None:
            col.type = String(500)
        elif isinstance(col.type, Text):
            col.type = String(500)

        # default CURRENT_TIMESTAMP가 걸려 있으면 DateTime으로 바꿔주기
        if getattr(col.server_default, "arg", None) is not None:
            if str(col.server_default.arg).upper() == "CURRENT_TIMESTAMP":
                col.type = DateTime()
                col.server_default = text("CURRENT_TIMESTAMP")
# MySQL에 동일 스키마 생성
# (CHECK 등 SQLite 전용 제약은 무시/번역될 수 있음)
src_md.create_all(mysql_engine)

# 목적지 테이블 객체 캐시 (이름 -> Table)
dst_md = MetaData()
dst_md.reflect(bind=mysql_engine)
dst_tables: Dict[str, Table] = {t.name: t for t in dst_md.tables.values()}

#  복사 유틸 
BATCH = 2000

from sqlalchemy.dialects.mysql import insert

# slug 자동 생성
def slugify(value: str) -> str:
    if not value:
        return "item"
    value = unidecode(value)  # → "왕십리닭곰탕" -> "wangsimnidakkogtang"
    value = re.sub(r"[^a-zA-Z0-9\s-]", "", value)
    value = re.sub(r"\s+", "-", value).strip().lower()
    return value[:100]


from sqlalchemy import Integer, Float, Numeric, DateTime

def copy_table(src_conn: Connection, dst_conn: Connection, table_obj: Table) -> int:
    """
    단일 테이블 데이터 복사
    - AUTO_INCREMENT 자동 채번
    - slug 자동 생성 (restaurants)
    - Integer/Float/Numeric: '' → NULL
    - DateTime: NULL → NULL, float(epoch)/str(iso) → datetime 변환
    - 문자열: None → ""
    - price_min / price_max 값 클리핑
    - restaurants.created_at은 스킵 (MySQL DEFAULT CURRENT_TIMESTAMP 사용)
    """
    name = table_obj.name
    dst_table = dst_tables[name]

    total = src_conn.execute(select(func.count()).select_from(table_obj)).scalar_one()
    if total == 0:
        return 0

    MAX_INT = 2147483647
    MIN_INT = -2147483648

    offset = 0
    while True:
        rows = src_conn.execute(
            select(table_obj).offset(offset).limit(BATCH)
        ).mappings().all()

        if not rows:
            break

        cleaned = []
        for row in rows:
            d = dict(row)

            # id는 AUTO_INCREMENT라 NULL이면 제외
            if "id" in d and d["id"] is None:
                d.pop("id", None)

            # slug 자동 생성 (restaurants 테이블)
            if "slug" in dst_table.columns and "slug" not in d:
                base = d.get("name") or d.get("title") or "item"
                d["slug"] = slugify(base)

            row_dict = {}
            for col in dst_table.columns:
                # 🔽 restaurants.created_at은 스킵
                if name == "restaurants" and col.name == "created_at":
                    continue

                val = d.get(col.name)

                #  Integer 
                if isinstance(col.type, Integer):
                    if val is None or val == "":
                        row_dict[col.name] = None
                    else:
                        try:
                            int_val = int(val)
                            if col.name in ["price_min", "price_max"]:
                                if int_val > MAX_INT:
                                    int_val = MAX_INT
                                elif int_val < MIN_INT:
                                    int_val = MIN_INT
                            row_dict[col.name] = int_val
                        except Exception:
                            row_dict[col.name] = None

                #  Float / Numeric 
                elif isinstance(col.type, (Float, Numeric)):
                    if val is None or val == "":
                        row_dict[col.name] = None
                    else:
                        try:
                            row_dict[col.name] = float(val)
                        except Exception:
                            row_dict[col.name] = None

                #  DateTime 
                elif isinstance(col.type, DateTime):
                    if val is None or val == "" or str(val).strip() == "":
                        row_dict[col.name] = datetime.datetime.now()
                    elif isinstance(val, (int, float)):
                        try:
                            row_dict[col.name] = datetime.datetime.fromtimestamp(val)
                        except Exception:
                            row_dict[col.name] = None
                    elif isinstance(val, str):
                        try:
                            row_dict[col.name] = datetime.datetime.fromisoformat(val)
                        except Exception:
                            row_dict[col.name] = None
                    else:
                        row_dict[col.name] = None
                    continue  # ✅ DateTime은 문자열 블록 안 타도록

                #  String / Text / 기타 
                else:
                    if col.name == "is_custom" and (val is None or val == ""):
                        row_dict[col.name] = 0  # ← 여기서 기본값 0으로 설정
                    else:
                        row_dict[col.name] = val if val is not None else ""

            cleaned.append(row_dict)

        if cleaned:
            stmt = insert(dst_table).values(cleaned)
            dst_conn.execute(stmt)
            print(f"[OK] {name}: {len(cleaned)} rows inserted")

        offset += len(rows)

    return total




#  실행 
with sqlite_engine.connect() as s_conn, mysql_engine.begin() as m_conn:
    # FK 비활성화 (이관 중 관계 무결성 체크 끔)
    m_conn.execute(text("SET FOREIGN_KEY_CHECKS=0;"))

    # FK 의존 순서대로 정렬된 테이블
    for tbl in src_md.sorted_tables:
        moved = copy_table(s_conn, m_conn, tbl)
        print(f"[OK] {tbl.name}: {moved} rows migrated")

    # AUTO_INCREMENT 재설정 (단일 정수 PK인 경우)
    for tbl in src_md.sorted_tables:
        pk_cols = list(tbl.primary_key.columns)
        if len(pk_cols) == 1:
            pk = pk_cols[0].name
            max_id = m_conn.execute(text(f"SELECT MAX(`{pk}`) FROM `{tbl.name}`")).scalar()
            if isinstance(max_id, int) and max_id >= 0:
                m_conn.execute(text(f"ALTER TABLE `{tbl.name}` AUTO_INCREMENT = :n"), {"n": max_id + 1})

    # FK 재활성화
    m_conn.execute(text("SET FOREIGN_KEY_CHECKS=1;"))

print("\n=== DONE: SQLite -> MySQL migration (reflection) ===")
