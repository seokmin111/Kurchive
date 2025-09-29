# 테이블 내용 텍스트로 쉽게 조회하려고 만든 코드 (sqllite는 복사가 안돼서)
# python view_db_contents.py
import asyncio
import os
import aiosqlite

# 여기에 보고 싶은 테이블 이름을 추가하거나 수정
TABLES_TO_VIEW = [
    "ingredient_categories",
    "ingredients",
    "units",
    "ingredient_units"
]

# 조회할 최대 행 수
# None 으로 설정하면 전체 행 조회 가능 
MAX_ROWS = 50

# database.py와 동일한 DB 경로를 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "BE", "DB", "Data.db")

async def view_tables():
    
    print(f"--- 데이터베이스 파일 경로: {DB_PATH} ---")
    if not os.path.exists(DB_PATH):
        print("\n[오류] 데이터베이스 파일을 찾을 수 없습니다. 경로를 확인해주세요.")
        return

    try:
        async with aiosqlite.connect(DB_PATH) as db:
            for table_name in TABLES_TO_VIEW:
                print(f"\n\n--- TABLE: {table_name} ---")
                try:
                    query = f"SELECT * FROM {table_name}"
                    if MAX_ROWS is not None and MAX_ROWS > 0:
                        query += f" LIMIT {MAX_ROWS}"
                    cursor = await db.execute(f"SELECT * FROM {table_name}")

                    cursor = await db.execute(query)
                    
                    # 컬럼 이름 가져오기
                    column_names = [description[0] for description in cursor.description]
                    print(f"# 컬럼: {column_names}")
                    
                    # 모든 데이터 행 가져오기
                    rows = await cursor.fetchall()
                    
                    if not rows:
                        print("(데이터 없음)")
                    else:
                        # 각 행을 한 줄씩 출력
                        for row in rows:
                            print(row)
                            
                except aiosqlite.OperationalError as e:
                    print(f"[오류] 테이블 '{table_name}'을 조회할 수 없습니다: {e}")

    except Exception as e:
        print(f"\n[오류] 데이터베이스 연결에 실패했습니다: {e}")

if __name__ == "__main__":
    asyncio.run(view_tables())