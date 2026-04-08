# BE/src/tests/test_admin_delegate.py
"""
실행:
pytest -v BE/src/tests/test_admin_delegate.py
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from asgi_lifespan import LifespanManager

from BE.src.main import app
from BE.src.models.users import User
from BE.src.database import async_session_maker, get_async_db
from BE.src.dependencies import get_current_admin_user


# -----------------------
# 기본 fixtures
# -----------------------

@pytest_asyncio.fixture
async def db():
    async with async_session_maker() as session:
        yield session


@pytest_asyncio.fixture
async def override_db(db: AsyncSession):
    async def _override_db():
        return db   # ⭐ yield 말고 return

    app.dependency_overrides[get_async_db] = _override_db
    yield
    app.dependency_overrides.pop(get_async_db, None)

@pytest_asyncio.fixture
async def override_admin(db: AsyncSession, override_db):
    async def _override():
        result = await db.execute(
            select(User).where(User.userid == "jwhong1020")
        )
        return result.scalar_one()

    app.dependency_overrides[get_current_admin_user] = _override
    yield
    app.dependency_overrides.pop(get_current_admin_user, None)

@pytest_asyncio.fixture
async def async_client():
    async with LifespanManager(app):   # ⭐ 이거 없으면 계속 터짐
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            yield client

# -----------------------
# Helper
# -----------------------

async def get_user(db: AsyncSession, userid: str) -> User:
    result = await db.execute(select(User).where(User.userid == userid))
    return result.scalar_one()


# -----------------------
# 1. 정상 케이스
# -----------------------

@pytest.mark.asyncio
async def test_delegate_success(async_client, db, override_admin):
    admin = await get_user(db, "jwhong1020")
    target = await get_user(db, "test02")

    # 원래 상태 저장
    orig_admin_is_admin = admin.is_admin
    orig_admin_role = admin.role
    orig_target_is_admin = target.is_admin
    orig_target_role = target.role

    try:
        # 테스트 전 상태 강제 세팅
        admin.is_admin = True
        admin.role = "staff"
        target.is_admin = False
        target.role = "member"
        await db.commit()

        res = await async_client.put("/api/admin/delegate/test02")
        assert res.status_code == 200, res.text

        await db.refresh(admin)
        await db.refresh(target)

        assert admin.is_admin is False
        assert admin.role == "staff"

        assert target.is_admin is True
        assert target.role == "staff"

    finally:
        admin.is_admin = orig_admin_is_admin
        admin.role = orig_admin_role
        target.is_admin = orig_target_is_admin
        target.role = orig_target_role
        await db.commit()


# -----------------------
# 2. 자기 자신 위임 금지
# -----------------------

@pytest.mark.asyncio
async def test_delegate_to_self(async_client, db, override_admin):
    admin = await get_user(db, "jwhong1020")

    orig_admin_is_admin = admin.is_admin
    orig_admin_role = admin.role

    try:
        admin.is_admin = True
        admin.role = "staff"
        await db.commit()

        res = await async_client.put("/api/admin/delegate/jwhong1020")

        assert res.status_code == 400, res.text
        assert "자기 자신" in res.json()["detail"]

    finally:
        admin.is_admin = orig_admin_is_admin
        admin.role = orig_admin_role
        await db.commit()


# -----------------------
# 3. 존재하지 않는 유저
# -----------------------

@pytest.mark.asyncio
async def test_delegate_not_found(async_client, db, override_admin):
    admin = await get_user(db, "jwhong1020")

    orig_admin_is_admin = admin.is_admin
    orig_admin_role = admin.role

    try:
        admin.is_admin = True
        admin.role = "staff"
        await db.commit()

        res = await async_client.put("/api/admin/delegate/not_exist_user")

        assert res.status_code == 404, res.text
        assert "위임할 회원을 찾을 수 없습니다" in res.json()["detail"]

    finally:
        admin.is_admin = orig_admin_is_admin
        admin.role = orig_admin_role
        await db.commit()


# -----------------------
# 4. 관리자 2명 제한
# -----------------------

@pytest.mark.asyncio
async def test_delegate_admin_limit(async_client, db, override_admin):
    admin1 = await get_user(db, "jwhong1020")
    admin2 = await get_user(db, "test02")
    target = await get_user(db, "test03")

    orig_admin1_is_admin = admin1.is_admin
    orig_admin1_role = admin1.role
    orig_admin2_is_admin = admin2.is_admin
    orig_admin2_role = admin2.role
    orig_target_is_admin = target.is_admin
    orig_target_role = target.role

    try:
        admin1.is_admin = True
        admin1.role = "staff"
        admin2.is_admin = True
        admin2.role = "staff"
        target.is_admin = False
        target.role = "member"
        await db.commit()

        res = await async_client.put("/api/admin/delegate/test03")

        assert res.status_code == 400, res.text
        assert "최대 2명" in res.json()["detail"]

    finally:
        admin1.is_admin = orig_admin1_is_admin
        admin1.role = orig_admin1_role
        admin2.is_admin = orig_admin2_is_admin
        admin2.role = orig_admin2_role
        target.is_admin = orig_target_is_admin
        target.role = orig_target_role
        await db.commit()


# -----------------------
# 5. 이미 admin에게 위임
# -----------------------

@pytest.mark.asyncio
async def test_delegate_to_existing_admin(async_client, db, override_admin):
    admin = await get_user(db, "jwhong1020")
    target = await get_user(db, "test02")

    orig_admin_is_admin = admin.is_admin
    orig_admin_role = admin.role
    orig_target_is_admin = target.is_admin
    orig_target_role = target.role

    try:
        admin.is_admin = True
        admin.role = "staff"
        target.is_admin = True
        target.role = "staff"
        await db.commit()

        res = await async_client.put("/api/admin/delegate/test02")

        assert res.status_code == 200, res.text

        await db.refresh(admin)
        await db.refresh(target)

        assert admin.is_admin is False
        assert target.is_admin is True

    finally:
        admin.is_admin = orig_admin_is_admin
        admin.role = orig_admin_role
        target.is_admin = orig_target_is_admin
        target.role = orig_target_role
        await db.commit()


# -----------------------
# 6. 권한 전이 정확성
# -----------------------

@pytest.mark.asyncio
async def test_delegate_role_transition(async_client, db, override_admin):
    admin = await get_user(db, "jwhong1020")
    target = await get_user(db, "test02")

    orig_admin_is_admin = admin.is_admin
    orig_admin_role = admin.role
    orig_target_is_admin = target.is_admin
    orig_target_role = target.role

    try:
        admin.is_admin = True
        admin.role = "staff"
        target.is_admin = False
        target.role = "member"
        await db.commit()

        res = await async_client.put("/api/admin/delegate/test02")
        assert res.status_code == 200, res.text

        await db.refresh(admin)
        await db.refresh(target)

        assert admin.is_admin is False
        assert admin.role == "staff"
        assert target.is_admin is True
        assert target.role == "staff"

    finally:
        admin.is_admin = orig_admin_is_admin
        admin.role = orig_admin_role
        target.is_admin = orig_target_is_admin
        target.role = orig_target_role
        await db.commit()


# -----------------------
# 7. 인증 없이 접근
# -----------------------

@pytest.mark.asyncio
async def test_delegate_without_auth(async_client):
    res = await async_client.put("/api/admin/delegate/test02")
    assert res.status_code in (401, 403), res.text