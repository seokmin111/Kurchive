from BE.src.database import SessionLocal
from typing import Generator

# 요청마다 DB 세션을 열고 닫아주는 dependency
def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
