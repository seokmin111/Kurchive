# BE/src/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# -------------------------------
# DB 경로 설정
# -------------------------------
# Render/배포 환경 → DATABASE_URL 환경변수로 주입
# 로컬 기본값 → BE/DB/Data.db
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # BE 디렉토리
    DB_PATH = os.environ.get("DB_PATH", "DB/Data.db")
    DB_ABS_PATH = os.path.join(BASE_DIR, DB_PATH)
    # 기본 SQLite URL
    DATABASE_URL = f"sqlite+aiosqlite:///{DB_ABS_PATH}"

# SQLite 여부 판별
IS_SQLITE = DATABASE_URL.startswith("sqlite")

# -------------------------------
# 동기 엔진/세션 (마이그레이션, 관리용 스크립트 등에서 사용)
# -------------------------------
if IS_SQLITE:
    SQLALCHEMY_DATABASE_URL = DATABASE_URL.replace("+aiosqlite", "")
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_sync_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------
# 비동기 엔진/세션 (FastAPI 라우터에서 실제 사용)
# -------------------------------
ASYNC_SQLALCHEMY_DATABASE_URL = DATABASE_URL
async_engine = create_async_engine(ASYNC_SQLALCHEMY_DATABASE_URL, echo=False, future=True, pool_pre_ping=True)
async_session_maker = async_sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)

async def get_async_db():
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


# -------------------------------
# Base (공통)
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
