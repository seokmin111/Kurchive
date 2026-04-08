# BE/src/dependencies.py 

from typing import Generator, Optional
from datetime import datetime, timedelta, timezone


from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import os

# from BE.src.database import SessionLocal
from BE.src.models.users import User

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from BE.src.database import get_async_db

# 요청마다 DB 세션을 열고 닫아주는 dependency.. 나중에 비동기로 수정?
'''
def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
'''

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-key")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

admin_security = HTTPBearer()
'''
def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(security), 
    db: Session = Depends(get_db)
):

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user
'''

def create_access_token(sub: str, expires_in_seconds: int = 3600, scope: str = "user") -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": sub,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=expires_in_seconds)).timestamp()),
        "scope": scope 
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


# 관리자 API 용으로 추가 
from .database import get_async_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
async def get_current_user_from_token(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_async_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )
    print("TOKEN:", token)

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return user

# guest 판별
async def require_not_guest(
    current_user: User = Depends(get_current_user_from_token)
) -> User:
    if current_user.role == "guest":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Guest user cannot perform this action",
        )
    return current_user

async def get_optional_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_async_db)
) -> Optional[User]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            return None

        result = await db.execute(select(User).where(User.id == int(user_id)))
        return result.scalar_one_or_none()

    except Exception:
        return None
# 관리자

async def get_current_admin_user(
    token: HTTPAuthorizationCredentials = Depends(admin_security),
    db: AsyncSession = Depends(get_async_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )

    try:
        payload = jwt.decode(token.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    if not user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return user
