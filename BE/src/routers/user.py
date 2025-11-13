# 회원가입과 로그인 담당 API (비동기화)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

import os

from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

from BE.src.database import async_session_maker
from BE.src.models.users import User
from BE.src.models.signup_code import SignupCode

from BE.src.database import get_async_db


from BE.src.dependencies import create_access_token

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 로그인용 환경변수 읽기
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-key")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.environ.get("JWT_EXPIRE_MINUTES", "60"))

# -------- DTO --------
class SignupRequest(BaseModel):
    userid: str
    pw: str
    pwConfirm: str
    nickname: str
    name: str
    code: str

class SignupResponse(BaseModel):
    success: bool
    message: str
    status: str

class ValidateCodeRequest(BaseModel):
    code: str

class ValidateCodeResponse(BaseModel):
    status: str

class LoginRequest(BaseModel):
    ID: str
    PW: str

class LoginResponse(BaseModel):
    user_id: str
    username: str
    role: str
    loginSuccess: bool
    message: str
    status: str
    access_token: str


# -------- API --------
@router.post("/signup")
async def signup(data: SignupRequest, db: AsyncSession = Depends(get_async_db)):
    """
    회원가입 API
    """
    # 비밀번호 확인
    if data.pw != data.pwConfirm:
        raise HTTPException(status_code=400, detail="비밀번호 확인 불일치")

    # ID 중복 검사
    result = await db.execute(select(User).filter(User.userid == data.userid))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="이미 존재하는 ID입니다.")

    # 닉네임 중복 검사
    result = await db.execute(select(User).filter(User.nickname == data.nickname))
    existing_nick = result.scalar_one_or_none()
    if existing_nick:
        raise HTTPException(status_code=400, detail="이미 존재하는 닉네임입니다.")

    # 커손연 코드
    result = await db.execute(select(SignupCode).filter(SignupCode.code == data.code))
    signup_code = result.scalar_one_or_none()
    if not signup_code:
        raise HTTPException(status_code=400, detail="가입 코드가 존재하지 않습니다.")
    if not bool(signup_code.is_active):
        raise HTTPException(status_code=400, detail="비활성화된 가입 코드입니다.")

    # 비밀번호 해싱
    hashed_pw = pwd_context.hash(data.pw)

    new_user = User(
        userid=data.userid,
        password=hashed_pw,
        nickname=data.nickname,
        name=data.name,
        role="member",
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {"success": True, "message": "회원가입 성공", "user_id": new_user.id}


@router.get("/signup/check_id")
async def check_id(userid: str, db: AsyncSession = Depends(get_async_db)):
    """
    ID 중복 확인
    """
    result = await db.execute(select(User).filter(User.userid == userid))
    exists = result.scalar_one_or_none()
    return {"isDuplicate": bool(exists), "status": "ok"}


@router.get("/check_nickname")
async def check_nickname(nickname: str, db: AsyncSession = Depends(get_async_db)):
    """
    닉네임 중복 확인
    """
    result = await db.execute(select(User).filter(User.nickname == nickname))
    exists = result.scalar_one_or_none()
    return {"isDuplicate": bool(exists), "status": "ok"}


@router.post("/validate_code", response_model=ValidateCodeResponse)
async def validate_code(data: ValidateCodeRequest, db: AsyncSession = Depends(get_async_db)):
    """
    커손연 코드 검증
    """
    result = await db.execute(select(SignupCode).filter(SignupCode.code == data.code))
    signup_code = result.scalar_one_or_none()

    if not signup_code:
        return {"status": "invalid"}
    if not bool(signup_code.is_active):
        return {"status": "inactive"}
    return {"status": "valid"}


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_async_db)):
    """
    로그인 API
    """
    import traceback

    try:
        result = await db.execute(select(User).filter(User.userid == data.ID))
        user = result.scalar_one_or_none()
        if not user or not pwd_context.verify(data.PW, user.password):
            raise HTTPException(status_code=400, detail="아이디 또는 비밀번호가 잘못되었습니다.")

        access_token = create_access_token(sub=str(user.id))

        return {
            "user_id": str(user.id),
            "username": user.userid,
            "role": user.role,
            "loginSuccess": True,
            "message": "로그인 성공",
            "status": "ok",
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": JWT_EXPIRE_MINUTES * 60,
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

