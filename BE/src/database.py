# BE/src/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

import os

# 공통 경로 설정
DB_PATH = os.environ.get("DB_PATH", "DB/Data.db")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_ABS_PATH = os.path.join(BASE_DIR, DB_PATH)

# 기존 동기용 설정
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_ABS_PATH}"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 비동기용 설정
ASYNC_SQLALCHEMY_DATABASE_URL = f"sqlite+aiosqlite:///{DB_ABS_PATH}"
async_engine = create_async_engine(ASYNC_SQLALCHEMY_DATABASE_URL, echo=False)
async_session_maker = async_sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)

# 공통 Base
Base = declarative_base()

# 비동기 의존성 함수
async def get_async_db():
    async with async_session_maker() as session:
        yield session
