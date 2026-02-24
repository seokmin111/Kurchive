from sqlalchemy import Column, Integer, ForeignKey, Datetime, func
from sqlalchemy.orm import relationship
from BE.src.database import Base


# from .users import User
# from .restaurants import Restaurant 

# 식당 즐겨찾기 모델 
class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))

    # user랑 restaurant 테이블 접근
    user = relationship("User", back_populates="favorites")
    restaurant = relationship("Restaurant", back_populates="favorites")

# 레시피 즐겨찾기 모델 
class RecipeFavorite(Base):
    __tablename__ = "recipe_favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User") 
    recipe = relationship("Recipe")