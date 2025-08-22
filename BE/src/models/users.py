from sqlalchemy import Column, Integer, String, DateTime, func, Boolean
from sqlalchemy.orm import relationship
from BE.src.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    userid = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    name = Column(String)
    nickname = Column(String, nullable=False, unique=True)

    is_admin = Column(Boolean, default=False, nullable=False)
    # 임원진(레시피 접근 가능) 여부
    role = Column(String, default="member", nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 찜한 목록
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")