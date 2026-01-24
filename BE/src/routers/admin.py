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
from typing import List

from BE.src.database import get_async_db
from BE.src.dependencies import get_current_admin_user
from BE.src.models.users import User

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Management"],
    dependencies=[Depends(get_current_admin_user)],
)

# --------------------
# DTO
# --------------------
class MemberStatus(BaseModel):
    userid: str
    role: str  # 'staff' | 'member'

class MemberStatusUpdateRequest(BaseModel):
    members: List[MemberStatus]

class MemberInfoResponse(BaseModel):
    id: int
    userid: str
    nickname: str
    role: str
    is_admin: bool

    class Config:
        from_attributes = True

# --------------------
# 회원 관리
# --------------------
@router.get(
    "/members",
    response_model=List[MemberInfoResponse],
    summary="전체 회원 목록 조회",
)
async def get_all_members(db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(User).order_by(User.id))
    return result.scalars().all()


@router.patch(
    "/members/status",
    status_code=204,
    summary="다수 회원의 임원진 상태(role) 일괄 변경",
)
async def update_members_status(
    payload: MemberStatusUpdateRequest,
    db: AsyncSession = Depends(get_async_db),
):
    """
    NOTE
    - 현재 이 엔드포인트는 role만 변경한다.
    - '관리자는 탈퇴 불가' 요구사항을 이 파일 범위에서 확실히 지키기 위해:
      * admin 계정에 대해서는 role을 'member'로 내리는 행위를 금지(관리자 강등/탈퇴 루트 방지)
    """
    for member_update in payload.members:
        if member_update.role not in ["staff", "member"]:
            continue

        result = await db.execute(select(User).filter(User.userid == member_update.userid))
        user = result.scalar_one_or_none()
        if not user:
            continue

        # ✅ 관리자 보호: 관리자는 (간접적으로라도) 탈퇴/강등 불가
        if user.is_admin and member_update.role != "staff":
            raise HTTPException(
                status_code=403,
                detail="관리자는 role을 member로 변경할 수 없습니다. (관리자 탈퇴/강등 불가)",
            )

        user.role = member_update.role

        # role 변경 시 관리자 권한 자동 해제
        if member_update.role != "admin":
            user.is_admin = False


    await db.commit()


# --------------------
# 관리자 위임 (최대 2명 제한)
# --------------------
@router.put(
    "/delegate/{userid}",
    response_model=MemberInfoResponse,
    summary="다른 회원에게 관리자 권한 위임 (관리자 최대 2명)",
)
async def delegate_admin_role(
    userid: str,
    db: AsyncSession = Depends(get_async_db),
    current_admin: User = Depends(get_current_admin_user),
):
    if current_admin.userid == userid:
        raise HTTPException(status_code=400, detail="자기 자신에게 관리자 권한을 위임할 수 없습니다.")

    user_to_promote = (
        await db.execute(select(User).filter(User.userid == userid))
    ).scalar_one_or_none()

    if not user_to_promote:
        raise HTTPException(status_code=404, detail="위임할 회원을 찾을 수 없습니다.")
    if user_to_promote.is_admin:
        raise HTTPException(status_code=400, detail="이미 관리자인 회원입니다.")

    # ✅ 관리자 최대 2명 제한
    admin_count = await db.scalar(select(func.count()).select_from(User).where(User.is_admin == True))
    if (admin_count or 0) >= 2:
        raise HTTPException(status_code=400, detail="관리자는 최대 2명까지만 지정 가능합니다.")

    # ✅ 위임은 '추가 지정'으로 동작 (기존 관리자는 유지)
    user_to_promote.is_admin = True
    user_to_promote.role = "staff"

    await db.commit()
    await db.refresh(user_to_promote)
    return user_to_promote
