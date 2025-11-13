# BE/src/routers/admin_auth.py

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from BE.src.database import get_async_db
from BE.src.dependencies import get_current_user_from_token, create_access_token
from BE.src.models.users import User
from BE.src.models.admin_config import AdminConfig

router = APIRouter(prefix="/api/admin", tags=["Admin Authentication"])

@router.post("/login", summary="[2단계] 관리자 인증 및 전용 토큰 발급")
async def admin_login(
    auth_code: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    # admin role인지 확인
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not an admin user")

    # DB에서 관리자 인증 코드 조회
    result = await db.execute(select(AdminConfig).limit(1))
    config = result.scalar_one_or_none()
    
    if not config or not config.auth_code:
        raise HTTPException(status_code=404, detail="Admin auth code is not set yet")

    if config.auth_code != auth_code:
        raise HTTPException(status_code=401, detail="Incorrect admin auth code")

    # 성공 시 admin 용 새로운 토큰 발급
    admin_token = create_access_token(sub=str(current_user.id), scope="admin")
    return {"access_token": admin_token, "token_type": "bearer"}

@router.put("/auth-code", summary="관리자 인증 코드 최초 설정 또는 변경")
async def set_auth_code(
    code: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token) 
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can set the auth code")

    result = await db.execute(select(AdminConfig).limit(1))
    config = result.scalar_one_or_none()
    
    if config:
        config.auth_code = code
    else: 
        config = AdminConfig(id=1, auth_code=code)
        db.add(config)
    await db.commit()
    return {"message": "Admin auth code updated successfully"}