from dotenv import load_dotenv
# load_dotenv()  # .env 파일의 환경변수를 로드
load_dotenv(".dev.env") # 개발용
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

from BE.src.database import Base, async_engine, set_sqlite_pragmas

from BE.src.routers import user, map, recipe, mypage, restaurant, admin, ingredient, comment, restaurant_review
from BE.src.errors import register_exception_handlers



# 모델 import 끝난 후에 create_all 실행
# Base.metadata.create_all(bind=engine)

logging.basicConfig(
    level=logging.DEBUG,
    format="%(levelname)s:%(name)s:%(message)s"
)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://146.56.117.219:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
app.include_router(admin.router)
app.include_router(restaurant_review.router, prefix = "/api", tags=["Reviews"])