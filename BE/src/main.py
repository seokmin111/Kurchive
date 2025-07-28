from fastapi import FastAPI
from BE.src.routers import user

app = FastAPI()
app.include_router(user.router, prefix="/api", tags=["User"])
