from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 환경변수에서 DB 경로 읽기
DB_PATH = os.environ.get("DB_PATH", "DB/Data.db")  # 기본값
# 절대 경로로 만들어 줌
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # BE/
DB_ABS_PATH = os.path.join(BASE_DIR, DB_PATH)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_ABS_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
