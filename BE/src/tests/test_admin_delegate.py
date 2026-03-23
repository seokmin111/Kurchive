# tests/test_admin_delegate.py
'''테스트 방법 : 루트 터미널에 입력
pytest -v BE/src/tests/test_admin_delegate.py'''
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from BE.src.main import app
from BE.src.models.users import User
from BE.src.dependencies import get_current_admin_user

from httpx import AsyncClient
from httpx import ASGITransport

import pytest_asyncio

@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

@pytest_asyncio.fixture
async def db():
    from BE.src.database import async_session_maker
    async with async_session_maker() as session:
        yield session
@pytest.fixture
async def override_admin(db: AsyncSession):
    """
    실제 DB의 jwhong1020을 admin으로 강제 주입
    """
    result = await db.execute(
        select(User).where(User.userid == "jwhong1020")
    )
    admin = result.scalar_one()

    async def _override():
        return admin

    app.dependency_overrides[get_current_admin_user] = _override
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_delegate_real_db(async_client: AsyncClient, db: AsyncSession, override_admin):
    """
    실제 DB 기반 delegate 테스트
    - 테스트 후 롤백
    """

    # 테스트 대상 유저 - 이미 존재하는 유저를 사용
    target_userid = "test02"

    # 기존 상태 저장
    result = await db.execute(select(User).where(User.userid == target_userid))
    target = result.scalar_one()

    original_target_admin = target.is_admin

    result = await db.execute(select(User).where(User.userid == "jwhong1020"))
    admin = result.scalar_one()
    original_admin_admin = admin.is_admin

    try:
        # API 호출
        res = await async_client.put(f"/api/admin/delegate/{target_userid}")

        assert res.status_code == 200

        # DB 반영 확인
        result = await db.execute(
            select(User).where(User.userid == "jwhong1020")
        )
        admin = result.scalar_one()
        await db.refresh(target)

        assert admin.is_admin is False
        assert target.is_admin is True

    finally:
        # 롤백 (중요)
        admin.is_admin = original_admin_admin
        target.is_admin = original_target_admin
        await db.commit()