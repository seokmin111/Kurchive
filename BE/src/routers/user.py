# 회원가입과 로그인 담당 API
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# --- Pydantic 모델 ---
class SignupRequest(BaseModel):
    id: str
    pw: str
    pwConfirm: str
    nickname: str
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


# 1.1 회원가입
@router.post("/signup", response_model=SignupResponse)
async def signup(data: SignupRequest):
    # 여기에 실제 DB 저장 로직 추가 예정
    return {"success": True, "message": "회원가입 성공", "status": "ok"}


# ID 중복 확인
@router.get("/signup/check_id")
async def check_id(username: str):
    # DB 조회 로직 필요
    return {"isDuplicate": False, "status": "ok"}


# 닉네임 중복 확인
@router.get("/check_nickname")
async def check_nickname(nickname: str):
    return {"isDuplicate": False, "status": "ok"}


# 커손연 코드 검증
@router.post("/validate_code", response_model=ValidateCodeResponse)
async def validate_code(data: ValidateCodeRequest):
    # code 검증 로직
    return {"status": "valid"}


# 1.2 로그인
@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest):
    # 실제 인증 로직 필요
    return {
        "user_id": "1",
        "username": data.ID,
        "role": "member",
        "loginSuccess": True,
        "message": "로그인 성공",
        "status": "ok",
    }
