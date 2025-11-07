from sqlalchemy import Column, Integer, String, Boolean, DateTime
from src.database import Base

class SignupCode(Base):
    __tablename__ = "signup_code"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), nullable=False)
    is_active = Column(Boolean, default=True)
    changed_by = Column(Integer)          # 관리자 user_id
    changed_at = Column(DateTime)
