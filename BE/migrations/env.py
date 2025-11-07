from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
import os
import sys

# Alembic Config 객체
config = context.config
fileConfig(config.config_file_name)

# --- 프로젝트 모듈 인식 ---
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

# --- Base import ---
from src.database import Base
from src.models import *  # 모든 모델 로드해서 Base.metadata 채움

target_metadata = Base.metadata

def run_migrations_offline():
    """Offline 모드 (SQL 스크립트 출력용)"""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    """실제 마이그레이션 실행 (sync 코드로 실행됨)"""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online():
    """비동기 모드"""
    connectable = create_async_engine(
        config.get_main_option("sqlalchemy.url"),
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    import asyncio
    asyncio.run(run_migrations_online())
