from dotenv import load_dotenv
load_dotenv()  # .env 파일의 환경변수를 로드

from fastapi import FastAPI

import logging

import BE.src.models
from BE.src.routers import user, map, recipe, mypage, restaurant, admin, admin_auth
from BE.src.database import Base, engine

import BE.src.models.tags   # 모델 먼저 import
import BE.src.models.restaurants
import BE.src.models.users
import BE.src.models.regions
import BE.src.models.admin_config


from BE.src.errors import register_exception_handlers

# 모델 import 끝난 후에 create_all 실행
Base.metadata.create_all(bind=engine)

logging.basicConfig(
    level=logging.DEBUG,
    format="%(levelname)s:%(name)s:%(message)s"
)


app = FastAPI()

register_exception_handlers(app)


app.include_router(user.router, prefix="/api", tags=["User"])
app.include_router(map.router, prefix="/api", tags=["Map"])
app.include_router(recipe.router)
app.include_router(mypage.router)
app.include_router(restaurant.router, tags=["Restaurants"])
app.include_router(admin_auth.router)
app.include_router(admin.router)