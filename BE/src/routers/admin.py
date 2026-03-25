# BE/src/routers/admin.py
# 관리자 API (비번 변경/관리자 동의 플로우 제거 버전)
# 요구사항 반영:
# 1) 관리자는 탈퇴(강제탈퇴 포함) 불가  -> (현재 파일 내 탈퇴 엔드포인트가 없어서)
#    최소한 "관리자 권한/role을 member로 내리거나" 같은 관리행위를 막고,
#    추후 강제탈퇴 엔드포인트가 붙을 때도 동일 가드 로직을 재사용하도록 구성.
# 2) 관리자는 최대 2명까지만 지정 가능

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from enum import Enum
from typing import List
from passlib.context import CryptContext

from BE.src.database import get_async_db
from BE.src.dependencies import get_current_admin_user, create_access_token
from BE.src.models.users import User



router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Management"],
)

# --------------------
# DTO
# --------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# 관리자 로그인
class AdminLoginRequest(BaseModel):
    userid: str
    password: str

class AdminLoginResponse(BaseModel):
    message: str
    userid: str
# 회원 관리
class MemberStatus(BaseModel):
    userid: str
    role: str  # 'staff' | 'member'

class MemberStatusUpdateRequest(BaseModel):
    members: List[MemberStatus]

class MemberInfoResponse(BaseModel):
    id: int
    userid: str
    name: str
    nickname: str
    role: str
    is_admin: bool

    class Config:
        from_attributes = True
        
# 권한
class RoleEnum(str, Enum):
    staff = "staff"
    member = "member"

# =============== 라우터 ====================
# 로그인
@router.post("/login", summary="관리자 로그인", dependencies=[])
async def admin_login(
    payload: AdminLoginRequest,
    db: AsyncSession = Depends(get_async_db)
):

    # 유저 조회
    result = await db.execute(
        select(User).where(User.userid == payload.userid)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호 오류")

    # 비밀번호 검증
    if not pwd_context.verify(payload.password, user.password):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호 오류")

    # 관리자 확인
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="관리자 권한이 없습니다")

    token = create_access_token(
    sub=str(user.id),
    scope="admin"       
)

    return {
        "message": "관리자 로그인 성공",
        "access_token": token,
        "token_type": "bearer"
    }
# --------------------
# 회원 관리
# --------------------
# 회원 조회
@router.get(
    "/members",
    response_model=List[MemberInfoResponse],
    summary="전체 회원 목록 조회",
)
async def get_all_members(db: AsyncSession = Depends(get_async_db),
                          current_admin: User = Depends(get_current_admin_user)):
    result = await db.execute(select(User).order_by(User.id))
    return result.scalars().all()

# 회원 권한 관리
@router.patch(
    "/members/status",
    summary="다수 회원의 임원진 상태(role) 일괄 변경",
)
async def update_members_status(
    payload: MemberStatusUpdateRequest,
    db: AsyncSession = Depends(get_async_db),
    current_admin: User = Depends(get_current_admin_user)
):
    updated_users = []

    for member_update in payload.members:

        # 1. role 검증
        if member_update.role not in ["staff", "member"]:
            raise HTTPException(
                status_code=400,
                detail=f"잘못된 role 값: {member_update.role}"
            )

        # 2. 유저 조회
        result = await db.execute(
            select(User).where(User.userid == member_update.userid)
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=404,
                detail=f"존재하지 않는 유저: {member_update.userid}"
            )

        # 3. 관리자 보호
        if user.is_admin:
            raise HTTPException(
                status_code=403,
                detail=f"{user.userid}는 관리자라 변경 불가"
            )

        # 4. 변경
        user.role = member_update.role
        updated_users.append(user.userid)

    await db.commit()

    return {
        "message": "회원 권한 변경 완료",
        "updated": updated_users
    }

# --------------------
# 관리자 위임 (최대 2명 제한)
# --------------------

@router.put(
    "/delegate/{userid}",
    response_model=MemberInfoResponse,
    summary="관리자 권한 위임 (본인 → 다른 사용자로 교체)",
)
async def delegate_admin_role(
    userid: str,
    db: AsyncSession = Depends(get_async_db),
    current_admin: User = Depends(get_current_admin_user),
):
    # 1. 자기 자신에게 위임 금지
    if current_admin.userid == userid:
        raise HTTPException(
            status_code=400,
            detail="자기 자신에게 관리자 권한을 위임할 수 없습니다."
        )

    # 2. 대상 유저 조회
    result = await db.execute(
        select(User).where(User.userid == userid)
    )
    user_to_promote = result.scalar_one_or_none()

    if not user_to_promote:
        raise HTTPException(
            status_code=404,
            detail="위임할 회원을 찾을 수 없습니다."
        )

    # 3. 현재 관리자 수 확인
    admin_count = await db.scalar(
        select(func.count()).select_from(User).where(User.is_admin == True)
    )

    # 4. 관리자 수 제한 체크
    # - 이미 admin인 경우는 그냥 통과 (중복 위임 방지)
    # - 새로운 admin 추가 상황이면 제한 적용
    if not user_to_promote.is_admin and admin_count >= 2:
        raise HTTPException(
            status_code=400,
            detail="관리자는 최대 2명까지만 지정할 수 있습니다."
        )

    # 5. 현재 관리자 권한 해제
    current_admin.is_admin = False
    current_admin.role = "staff"

    # 6. 대상 유저에게 관리자 권한 부여
    user_to_promote.is_admin = True
    user_to_promote.role = "staff"

    # 7. 저장
    await db.commit()
    await db.refresh(user_to_promote)

    return user_to_promote

