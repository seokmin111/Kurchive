from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from BE.src.database import Base
import time

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True)
    name = Column(String(500), nullable=False)
    address = Column(String(500), nullable=False)
    location_link = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_tag_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, default=0)
    summary = Column(Text)
    description = Column(Text)
    price_min = Column(Integer, nullable=False)
    price_max = Column(Integer, nullable=False)
    created_at = Column(Float)  # timestamp 저장

    # 관계
    tags = relationship("RestaurantTag", back_populates="restaurant")
    favorites = relationship("Favorite", back_populates="restaurant")
    images = relationship("RestaurantImage", back_populates="restaurant", cascade="all, delete-orphan")

# 식당별 태그
class RestaurantTag(Base):
    __tablename__ = "restaurant_tags"

    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)

    restaurant = relationship("Restaurant", back_populates="tags")
    tag = relationship("Tag", back_populates="restaurants")
    

# 식당 이미지
class RestaurantImage(Base):  
    __tablename__ = "restaurant_images"

    id = Column(Integer, primary_key=True, autoincrement=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    created_at = Column(Float, default=lambda: time.time())
    is_cover = Column(Boolean, default=False)

    restaurant = relationship("Restaurant", back_populates="images")