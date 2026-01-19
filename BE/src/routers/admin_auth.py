# BE/src/routers/admin_auth.py
# /admin 진입 시: "비번/코드 없이" 현재 로그인한 유저가 admin이면 관리자 전용 토큰 발급
# (구 auth_code, 비번 변경/동의 같은 흐름은 제거)

from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Optional

from BE.src.database import get_async_db
from BE.src.dependencies import get_current_user_from_token, create_access_token
from BE.src.models.users import User

router = APIRouter(prefix="/api/admin", tags=["Admin Authentication"])


@router.post("/login", summary="관리자 자동 로그인 및 전용 토큰 발급")
async def admin_login(
    # 프론트에서 {}로 보내도 422 안 나게 Optional 처리
    # (백엔드에서 이제 auth_code를 쓰지 않지만, 혹시 남겨둔 클라이언트가 보내도 무시 가능)
    auth_code: Optional[str] = Body(default=None, embed=True),
    current_user: User = Depends(get_current_user_from_token),
):
    # 1) 현재 로그인 토큰의 유저가 admin인지 확인
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not an admin user")

    # 2) admin 전용 토큰 발급 (admin.py는 이 토큰(scope=admin)을 요구해야 함)
    admin_token = create_access_token(sub=str(current_user.id), scope="admin")
    return {"access_token": admin_token, "token_type": "bearer"}
