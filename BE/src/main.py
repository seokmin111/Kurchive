from dotenv import load_dotenv
load_dotenv()  # .env 파일의 환경변수를 로드

from fastapi import FastAPI

import logging

import BE.src.models
from BE.src.routers import user, map, recipe, mypage, restaurant
from BE.src.database import Base, engine


logging.basicConfig(
    level=logging.DEBUG,
    format="%(levelname)s:%(name)s:%(message)s"
)
# 앱 시작 시 테이블 생성 
Base.metadata.create_all(bind=engine)


app = FastAPI()
app.include_router(user.router, prefix="/api", tags=["User"])
app.include_router(map.router, prefix="/api", tags=["Map"])
app.include_router(recipe.router)
app.include_router(mypage.router)
app.include_router(restaurant.router)