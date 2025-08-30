from sqlalchemy import Column, Integer, String, Boolean
from BE.src.database import Base

class RolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String(500), nullable=False)             # 예: member, admin
    permission_id = Column(Integer, nullable=False)   # permissions 테이블 id
    is_enabled = Column(Boolean, default=True)
