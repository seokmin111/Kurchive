from sqlalchemy import Column, Integer, String, DateTime, func
from BE.src.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    userid = Column(String, nullable=False, unique=True) # login ID
    password = Column(String, nullable=False) # 해시 pw
    name = Column(String)
    nickname = Column(String, nullable=False)
    role = Column(String, default="member")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 찜한 목록
    # favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")