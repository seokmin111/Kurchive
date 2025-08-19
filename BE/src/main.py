from dotenv import load_dotenv
load_dotenv()  # .env 파일의 환경변수를 로드

from fastapi import FastAPI

import logging

import BE.src.models
from BE.src.routers import user, map, recipe, mypage, restaurant
from BE.src.database import Base, engine
from BE.src.errors import BusinessError

import BE.src.models.tags   # 모델 먼저 import
import BE.src.models.restaurants
import BE.src.models.users
import BE.src.models.regions

# 모델 import 끝난 후에 create_all 실행
Base.metadata.create_all(bind=engine)

logging.basicConfig(
    level=logging.DEBUG,
    format="%(levelname)s:%(name)s:%(message)s"
)


app = FastAPI()
@app.exception_handler(BusinessError)
async def business_error_handler(request: Request, exc: BusinessError):
    # 의도된(유효성/도메인) 오류는 항상 200으로, 메시지만 반환
    return JSONResponse(status_code=200, content={"ok": False, "message": exc.message})

app.include_router(user.router, prefix="/api", tags=["User"])
app.include_router(map.router, prefix="/api", tags=["Map"])
app.include_router(recipe.router)
app.include_router(mypage.router)
app.include_router(restaurant.router, tags=["Restaurants"])