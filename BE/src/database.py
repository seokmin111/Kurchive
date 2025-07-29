import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# BE 폴더 절대 경로
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # 현재 src 경로
BE_DIR = os.path.dirname(BASE_DIR)                     # src의 상위 = BE
DB_PATH = os.path.join(BE_DIR, "DB", "Data.db")

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
