# 회원가입과 로그인 담당 API
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

import os

from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

from BE.src.dependencies import get_db
from BE.src.models.users import User
from BE.src.models.signup_code import SignupCode

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 로그인용 환경변수 읽기
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-key")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.environ.get("JWT_EXPIRE_MINUTES", "60"))

class SignupRequest(BaseModel):
    userid: str
    pw: str
    pwConfirm: str
    nickname: str
    name : str
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


# 1.1 회원가입
@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    # 비밀번호 확인
    if data.pw != data.pwConfirm:
        raise HTTPException(status_code=400, detail="비밀번호 확인 불일치")

    # ID 중복 검사
    existing = db.query(User).filter(User.userid == data.userid).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 존재하는 ID입니다.")

    # 닉네임 중복 검사
    existing_nick = db.query(User).filter(User.nickname == data.nickname).first()
    if existing_nick:
        raise HTTPException(status_code=400, detail="이미 존재하는 닉네임입니다.")

    # 커손연 코드
    signup_code = (
        db.query(SignupCode)
        .filter(SignupCode.code == data.code)
        .first()
    )

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
    name=data.name,     # 여기 추가
    role="member",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"success": True, "message": "회원가입 성공", "user_id": new_user.id}


# ID 중복 확인
@router.get("/signup/check_id")
def check_id(userid: str, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.userid == userid).first()
    return {"isDuplicate": bool(exists), "status": "ok"}

# 닉네임 중복 확인
@router.get("/check_nickname")
def check_nickname(nickname: str, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.nickname == nickname).first()
    return {"isDuplicate": bool(exists), "status": "ok"}

# 커손연 코드 검증
@router.post("/validate_code", response_model=ValidateCodeResponse)
def validate_code(data: ValidateCodeRequest, db: Session = Depends(get_db)):
    signup_code = db.query(SignupCode).filter(SignupCode.code == data.code).first()

    if not signup_code:
        return {"status": "invalid"}
    if not bool(signup_code.is_active):
        return {"status": "inactive"}
    return {"status": "valid"}


# 1.2 로그인
@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.userid == data.ID).first()
    if not user or not pwd_context.verify(data.PW, user.password):
        raise HTTPException(status_code=400, detail="아이디 또는 비밀번호가 잘못되었습니다.")

    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": str(user.id), "exp": expire}
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return {
        "user_id": str(user.id),
        "username": user.userid,
        "role": user.role,
        "loginSuccess": True,
        "message": "로그인 성공",
        "status": "ok",
        "access_token": token,
    }