import sys
import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from BE.src.main import app as fastapi_app
from BE.src.database import async_session_maker


if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


@pytest.fixture
async def db_session() -> AsyncSession:
    async with async_session_maker() as session:
        yield session


@pytest.fixture
def app():
    return fastapi_app


@pytest.fixture
async def client(app):
    transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=transport,
        base_url="http://test"
    ) as ac:
        yield ac