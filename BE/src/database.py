# BE/src/database.py
import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.ext.declarative import declarative_base

# -------------------------------
# DB URL 설정
# -------------------------------
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # __file__ = BE/src/database.py → BASE_DIR = BE
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DB_PATH = os.environ.get("DB_PATH", "DB/Data.db")  # 로컬: BE/DB/Data.db
    DB_ABS_PATH = os.path.join(BASE_DIR, DB_PATH)
    DATABASE_URL = f"sqlite+aiosqlite:///{DB_ABS_PATH}"

IS_SQLITE = DATABASE_URL.startswith("sqlite")

# -------------------------------
# 비동기 엔진 & 세션
# -------------------------------
async_engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
)
async_session_maker = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# FastAPI 의존성에서 사용
async def get_async_db():
    async with async_session_maker() as session:
        yield session

# -------------------------------
# 공통 Base
# -------------------------------
Base = declarative_base()

# -------------------------------
# SQLite 전용 PRAGMA (앱 시작 시 1회)
# -------------------------------
async def set_sqlite_pragmas():
    if IS_SQLITE:
        async with async_engine.begin() as conn:
            await conn.exec_driver_sql("PRAGMA journal_mode=WAL;")
            await conn.exec_driver_sql("PRAGMA synchronous=NORMAL;")
            await conn.exec_driver_sql("PRAGMA foreign_keys=ON;")
