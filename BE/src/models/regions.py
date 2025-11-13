# 지역만 관리
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from BE.src.database import Base

class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(500), nullable=False)
    parent_id = Column(Integer, ForeignKey("regions.id"), nullable=True)
    depth = Column(Integer, nullable=False)

    children = relationship("Region", backref="parent", remote_side=[id])
    restaurants = relationship("Restaurant", backref="region")
