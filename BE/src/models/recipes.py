from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime

from pydantic import BaseModel
from typing import Dict

from BE.src.database import Base
from BE.src.models.users import User # 단방향


class Recipe(Base):
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    base_serving = Column(Integer, nullable=False)
    uploader_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    thumbnail_url = Column(String, nullable = True)
    steps = relationship("RecipeStep", cascade="all, delete", back_populates="recipe")
    ingredients = relationship("RecipeIngredient", cascade="all, delete", back_populates="recipe")

# 레시피 순서(지시사항)
class RecipeStep(Base):
    __tablename__ = "recipe_steps"
    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"))
    step_order = Column(Integer, nullable=False)  # 컬럼명 맞춤
    description = Column(Text, nullable=False)
    
    images = relationship("RecipeStepImage", cascade="all, delete", back_populates="step")

    recipe = relationship("Recipe", back_populates="steps")

class RecipeStepImage(Base):
    __tablename__ = "recipe_step_images"
    id = Column(Integer, primary_key=True, autoincrement=True)
    step_id = Column(Integer, ForeignKey("recipe_steps.id"), nullable=False)
    image_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    step = relationship("RecipeStep", back_populates="images")

class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"
    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"))
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"))
    quantity = Column(Float, nullable=False)
    unit_name = Column(String, nullable=False)

    recipe = relationship("Recipe", back_populates="ingredients")
    ingredient = relationship("Ingredient")

# 재료 
class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100))
    density = Column(Float)
    average_weight = Column(Float)
    unit_type = Column(String)   # SQLite에서는 CHECK는 따로 처리
    category_id = Column(Integer, ForeignKey("ingredient_categories.id"))

    # 관계 추가
    ingredient_units = relationship("IngredientUnit", back_populates="ingredient")

class Unit(Base):
    __tablename__ = "units"

    unit_id = Column(Integer, primary_key=True, autoincrement=True)
    unit_name = Column(String, unique=True, nullable=False)
    unit_type = Column(String, nullable=False)


## 단위 변환
class ConvertRequestDTO(BaseModel):
    units: Dict[int, str]
    # key: ingredient_id, value: target_unit_id
    
class UnitConversion(Base):
    __tablename__ = "unit_conversions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    from_unit_id = Column(Integer, ForeignKey("units.unit_id"), nullable=False)
    to_unit_id = Column(Integer, ForeignKey("units.unit_id"), nullable=False)
    coefficient = Column(Float, nullable=False)

    # 양방향 참조 (선택)
    from_unit = relationship("Unit", foreign_keys=[from_unit_id])
    to_unit = relationship("Unit", foreign_keys=[to_unit_id])
    
class IngredientUnit(Base):
    __tablename__ = "ingredient_units"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    unit_name = Column(String, nullable=False)
    is_default = Column(Boolean, default=False)


    ingredient = relationship("Ingredient", back_populates="ingredient_units")

    __table_args__ = (
        UniqueConstraint('ingredient_id', 'unit_name', name='uq_ingredient_unit'),
    )

