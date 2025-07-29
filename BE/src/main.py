from fastapi import FastAPI

from BE.src.routers import user
from src import models
from src.database import Base, engine

# 앱 시작 시 테이블 생성 (이미 DB에 있으면 건너뜀)
Base.metadata.create_all(bind=engine)


app = FastAPI()
app.include_router(user.router, prefix="/api", tags=["User"])
