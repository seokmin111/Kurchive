from dotenv import load_dotenv
load_dotenv()  # .env 파일의 환경변수를 로드

import os
import logging


from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware



import BE.src.models.users
import BE.src.models.tags 
import BE.src.models.regions
import BE.src.models.restaurants
import BE.src.models.admin_config

import BE.src.models

from src.database import Base, async_engine, set_sqlite_pragmas

from src.routers import user, map, recipe, mypage, restaurant, admin, admin_auth, ingredient, comment
from src.errors import register_exception_handlers



# 모델 import 끝난 후에 create_all 실행
# Base.metadata.create_all(bind=engine)

logging.basicConfig(
    level=logging.DEBUG,
    format="%(levelname)s:%(name)s:%(message)s"
)

app = FastAPI()

origins = [
    "http://localhost:3000",  # React 개발 환경
    "http://138.2.124.34",    # 서버 도메인/IP
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # 허용할 Origin 리스트
    allow_credentials=True,
    allow_methods=["*"],             # 허용할 HTTP 메소드
    allow_headers=["*"],             # 허용할 HTTP 헤더
)

@app.on_event("startup")
async def on_startup():
    await set_sqlite_pragmas()

    async with async_engine.begin() as conn:

        await conn.run_sync(Base.metadata.create_all)

os.makedirs("uploads", exist_ok=True)       # 선택(폴더 자동 생성)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")  # 

register_exception_handlers(app)


app.include_router(user.router, prefix="/api", tags=["User"])
app.include_router(map.router, prefix="/api", tags=["Map"])
app.include_router(recipe.router)
app.include_router(mypage.router)
app.include_router(restaurant.router, prefix = "/api", tags=["Restaurants"])
app.include_router(comment.router)
app.include_router(ingredient.router)
app.include_router(admin_auth.router)
app.include_router(admin.router)