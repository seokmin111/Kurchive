from dotenv import load_dotenv
load_dotenv()  # .env 파일의 환경변수를 로드

from fastapi import FastAPI

from BE.src.routers import user, map
from BE.src import models
from BE.src.database import Base, engine



# 앱 시작 시 테이블 생성 (이미 DB에 있으면 건너뜀)
Base.metadata.create_all(bind=engine)


app = FastAPI()
app.include_router(user.router, prefix="/api", tags=["User"])
app.include_router(map.router, prefix="/api", tags=["Map"])
