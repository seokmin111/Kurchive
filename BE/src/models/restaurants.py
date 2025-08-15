from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from BE.src.database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    address = Column(String)
    rating = Column(Float)
    # favorites.py에 필요해서 미리 만들어둠 
    # 이 뒤는 필요에 따라 추가...

    favorites = relationship("Favorite", back_populates="restaurant", cascade="all, delete-orphan")