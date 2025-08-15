from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from BE.src.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    userid = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    name = Column(String)
    nickname = Column(String, nullable=False, unique=True)
    role = Column(String, default="member")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # 찜한 목록

    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")