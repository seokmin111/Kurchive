from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from BE.src.database import Base

# from .users import User
# from .restaurants import Restaurant 

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))

    # user랑 restaurant 테이블 접근
    user = relationship("User", back_populates="favorites")
    restaurant = relationship("Restaurant", back_populates="favorites")