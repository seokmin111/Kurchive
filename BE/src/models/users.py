from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    userid = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    name = Column(String)
    nickname = Column(String, nullable=False)
    role = Column(String, default="member")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
