# app/core/errors.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from fastapi.responses import JSONResponse

def err(status: int, msg: str, details=None):
    # 예외 객체를 안전하게 문자열/딕셔너리로 변환
    if isinstance(details, BaseException):
        details = {
            "type": details.__class__.__name__,
            "message": str(details)
        }

    # dict / list / str / int / None 은 그대로 두고,
    # 직렬화 불가능한 타입은 문자열로 변환
    try:
        JSONResponse(status_code=status, content={
            "ok": False, "error": msg, "details": details
        })
    except TypeError:
        details = str(details)

    return JSONResponse(
        status_code=status,
        content={"ok": False, "error": msg, "details": details},
    )

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(RequestValidationError)
    async def _(request: Request, exc: RequestValidationError):
        return err(422, "Invalid input", exc.errors())

    @app.exception_handler(StarletteHTTPException)
    async def _(request: Request, exc: StarletteHTTPException):
        # FastAPI의 HTTPException도 여기로 옴
        return err(exc.status_code, exc.detail)

    @app.exception_handler(IntegrityError)
    async def _(request: Request, exc: IntegrityError):
        return err(409, "Integrity constraint violated", str(exc.orig))

    @app.exception_handler(SQLAlchemyError)
    async def _(request: Request, exc: SQLAlchemyError):
        return err(500, "Database error", exc.__class__.__name__)

    @app.exception_handler(Exception)
    async def _(request: Request, exc: Exception):
        # 진짜 예기치 못한 것들까지 500 JSON으로 통일
        return err(500, "Unexpected server error", exc.__class__.__name__)
