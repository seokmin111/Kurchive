from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from BE.src.database import Base
import enum


class AdminConfig(Base):
    __tablename__ = "admin_config"
    
    id = Column(Integer, primary_key=True)
    auth_code = Column(String(500), nullable=True) # 관리자 인증 코드(관리자 비밀번호)


class PwdChangeStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class AuthCodeChangeRequest(Base):
    __tablename__ = "auth_code_change_requests"
    
    id = Column(Integer, primary_key=True)
    new_auth_code = Column(String(500), nullable=False)
    status = Column(SQLAlchemyEnum(PwdChangeStatus), default=PwdChangeStatus.PENDING, nullable=False)

    # 요청자 정보 
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    requester = relationship("User", foreign_keys=[requester_id])
    
    # 승인자 정보 
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approver = relationship("User", foreign_keys=[approver_id])
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())