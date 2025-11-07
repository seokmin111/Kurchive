# BE/src/dependencies.py 

from typing import Generator
from datetime import datetime, timedelta, timezone


from fastapi import Depends, HTTPException, status

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordBearer
# from sqlalchemy.orm import Session
from jose import JWTError, jwt
import os

# from src.database import SessionLocal
from src.models.users import User

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.database import get_async_db

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

security = HTTPBearer() # 수정 

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
    token: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_async_db)
) -> User:
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        
        token_data = {"sub": user_id, "scope": payload.get("scope", "user")}

    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).filter(User.id == int(token_data["sub"])))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception
    
    
    user.token_scope = token_data["scope"]
    
    
    return user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user_from_token)
) -> User:
    if not (current_user.token_scope == "admin" and current_user.is_admin is True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
