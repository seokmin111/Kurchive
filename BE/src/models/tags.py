# 태그만 관리
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from BE.src.database import Base

class TagCategory(Base):
    __tablename__ = "restaurant_tag_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)

    tags = relationship("Tag", back_populates="category")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey("restaurant_tag_categories.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("tags.id"), nullable=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True)
    is_selectable = Column(Boolean, default=True)
    featured_rank = Column(Integer, nullable=True)

    category = relationship("TagCategory", back_populates="tags")
    parent = relationship("Tag", remote_side=[id], backref="children")
    restaurants = relationship("RestaurantTag", back_populates="tag")
