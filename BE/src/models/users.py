from sqlalchemy import Column, Integer, String, DateTime, func, Boolean
from sqlalchemy.orm import relationship
from BE.src.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    userid = Column(String(500), nullable=False, unique=True)
    password = Column(String(500), nullable=False)
    name = Column(String(500))
    nickname = Column(String(500), nullable=False, unique=True)

    is_admin = Column(Boolean, default=False, nullable=False)
    # 임원진(레시피 접근 가능) 여부
    role = Column(String(500), default="member", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 관계 설정
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")