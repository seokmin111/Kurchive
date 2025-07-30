from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

import json

from BE.src.database import SessionLocal
from BE.src.models.recipes import Recipe, RecipeIngredient, RecipeStep, Ingredient, User, IngredientUnit, Unit, UnitConversion, ConvertRequestDTO
from BE.src.utils.units import get_conversion_coefficient, convert_unit

import logging
logger = logging.getLogger("convert")


router = APIRouter(prefix="/api/recipe", tags=["Recipe"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class RoleChecker:
    def __init__(self, min_role: str):
        self.min_role = min_role
        self.role_order = {"member": 1, "임원진": 2, "관리자": 3}

    def __call__(self, current_user: User = Depends(lambda: fake_current_user())):
        if self.role_order.get(current_user.role, 0) < self.role_order.get(self.min_role, 0):
            raise HTTPException(status_code=403, detail="Permission denied")
        return current_user

def fake_current_user():
    return User(id=1, userid="demo", nickname="demo", role="임원진")

class IngredientDTO(BaseModel):
    ingredient_id: int
    quantity: float
    unit_name: str   # unit -> unit_name 로 변경


class RecipeStepDTO(BaseModel):
    step_order: int
    description: str
    image_url: Optional[str] = None

    class Config:
        allow_population_by_field_name = True

class RecipeCreateDTO(BaseModel):
    title: str
    base_serving: int
    ingredients: List[IngredientDTO]
    steps: List[RecipeStepDTO]

class RecipeUpdateDTO(BaseModel):
    title: Optional[str] = None
    base_serving: Optional[int] = None
    ingredients: Optional[List[IngredientDTO]] = None
    steps: Optional[List[RecipeStepDTO]] = None

class RecipeResponseDTO(BaseModel):
    id: int
    title: str
    base_serving: int
    uploader_id: int
    created_at: datetime
    steps: List[RecipeStepDTO]

    class Config:
        orm_mode = True
        
# 재료 및 단위 변환
class IngredientDetailDTO(BaseModel):
    ingredient_id: int
    name: str
    quantity: float
    unit_name: str

class RecipeResponseDTO(BaseModel):
    id: int
    title: str
    base_serving: int
    uploader_id: int
    created_at: datetime
    steps: List[RecipeStepDTO]
    ingredients: List[IngredientDetailDTO]

    class Config:
        orm_mode = True


# ------API---------
@router.get("/search", response_model=List[RecipeResponseDTO])
def search_recipes(title: str, db: Session = Depends(get_db)):
    return db.query(Recipe).filter(Recipe.title.contains(title)).all()

@router.get("/list", response_model=List[RecipeResponseDTO])
def list_recipes(db: Session = Depends(get_db)):
    return db.query(Recipe).all()

# 레시피 id로 조회 && 인분 선택 || 재료 단위 변환
@router.get("/{recipe_id}", response_model=RecipeResponseDTO)
def get_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker("member"))
):
    """
    레시피 상세조회:
    - recipe_id 기준으로 원본 레시피 데이터를 그대로 반환
    - 인분 배수나 단위 변환 없음
    """
    recipe = (
        db.query(Recipe)
        .options(
            joinedload(Recipe.ingredients).joinedload(RecipeIngredient.ingredient),
            joinedload(Recipe.steps)
        )
        .filter(Recipe.id == recipe_id)
        .first()
    )
    if not recipe:
        raise HTTPException(404, "Recipe not found")

    # DB에 있는 값 그대로 ingredients 생성
    ingredients = [
        {
            "ingredient_id": ri.ingredient_id,
            "name": ri.ingredient.name,
            "quantity": ri.quantity,
            "unit_name": ri.unit_name,
        }
        for ri in recipe.ingredients
    ]

    return {
        "id": recipe.id,
        "title": recipe.title,
        "base_serving": recipe.base_serving,
        "uploader_id": recipe.uploader_id,
        "created_at": recipe.created_at,
        "steps": recipe.steps,
        "ingredients": ingredients,
    }

## 인분 배율 조정
@router.get("/{recipe_id}/scale", response_model=RecipeResponseDTO)
def scale_recipe(
    recipe_id: int,
    servings: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker("member"))
):
    """
    base_serving 대비 servings 비율로 재료 양만 조정해서 반환
    """
    recipe = (
        db.query(Recipe)
        .options(
            joinedload(Recipe.ingredients).joinedload(RecipeIngredient.ingredient),
            joinedload(Recipe.steps)
        )
        .filter(Recipe.id == recipe_id)
        .first()
    )
    if not recipe:
        raise HTTPException(404, "Recipe not found")

    factor = servings / recipe.base_serving
    ingredients = [
        {
            "ingredient_id": ri.ingredient_id,
            "name": ri.ingredient.name,
            "quantity": ri.quantity * factor,
            "unit_name": ri.unit_name,
        }
        for ri in recipe.ingredients
    ]

    return {
        "id": recipe.id,
        "title": recipe.title,
        "base_serving": recipe.base_serving,
        "uploader_id": recipe.uploader_id,
        "created_at": recipe.created_at,
        "steps": recipe.steps,
        "ingredients": ingredients,
    }


## 단위 변환 API
@router.post("/{recipe_id}/convert", response_model=RecipeResponseDTO)
def convert_recipe(
    recipe_id: int,
    request: ConvertRequestDTO,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker("staff"))
    ):
    """
    단위 변환 (unit_name 기반)
    프론트: { "units": { "2": "kg", "5": "cup" } }
    """
    unit_map = request.units
    logger.debug(f"unit_map: {unit_map}")
    
    recipe = (
        db.query(Recipe)
        .options(
            joinedload(Recipe.ingredients).joinedload(RecipeIngredient.ingredient),
            joinedload(Recipe.steps)
        )
        .filter(Recipe.id == recipe_id)
        .first()
    )
    if not recipe:
        raise HTTPException(404, "Recipe not found")

    converted_ingredients = []

    for ri in recipe.ingredients:
        ingredient = ri.ingredient
        qty = ri.quantity
        unit_name = ri.unit_name

        target_unit_name = unit_map.get(ri.ingredient_id)
        logger.debug(
            f"ingredient_id={ri.ingredient_id}, from={ri.unit_name}, "
            f"target={target_unit_name}, density={ingredient.density}"
        )
        if target_unit_name:
            # 허용된 단위 목록에서 unit_name 기반으로 체크
            allowed_units = db.query(IngredientUnit).filter(
            IngredientUnit.ingredient_id == ri.ingredient_id).all()

            allowed_unit_names = {u.unit_name for u in allowed_units}

            if target_unit_name in allowed_unit_names:
                qty, unit_name = convert_unit(
                    db=db,
                    ingredient=ingredient,
                    qty=ri.quantity,
                    from_unit_name=ri.unit_name,
                    to_unit_name=target_unit_name
                )

                logger.debug(
                        f"Converted {ri.ingredient_id}: {ri.quantity}{ri.unit_name} -> {qty}{unit_name}"
                    )

        converted_ingredients.append({
            "ingredient_id": ri.ingredient_id,
            "name": ingredient.name,
            "quantity": qty,
            "unit_name": unit_name
        })

    return {
        "id": recipe.id,
        "title": recipe.title,
        "base_serving": recipe.base_serving,
        "uploader_id": recipe.uploader_id,
        "created_at": recipe.created_at,
        "steps": recipe.steps,
        "ingredients": converted_ingredients,
    }
    
@router.post("", response_model=RecipeResponseDTO, status_code=status.HTTP_201_CREATED)
def create_recipe(data: RecipeCreateDTO, db: Session = Depends(get_db), current_user: User = Depends(RoleChecker("임원진"))):
    recipe = Recipe(
        title=data.title,
        base_serving=data.base_serving,
        uploader_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    for ing in data.ingredients:
        db.add(RecipeIngredient(recipe_id=recipe.id, ingredient_id=ing.ingredient_id, quantity=ing.quantity, unit_name=ing.unit_name))

    for step in data.steps:
        db.add(RecipeStep(
            recipe_id=recipe.id,
            step_order=step.step_order,
            description=step.description,
            image_url=step.image_url
        ))

    db.commit()
    db.refresh(recipe)
    return recipe

@router.put("/{recipe_id}", response_model=RecipeResponseDTO)
def update_recipe(recipe_id: int, data: RecipeUpdateDTO, db: Session = Depends(get_db), current_user: User = Depends(RoleChecker("임원진"))):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(404, "Recipe not found")

    if recipe.uploader_id != current_user.id and current_user.role not in ("admin", "staff"):
        raise HTTPException(403, "Permission denied")

    if data.title:
        recipe.title = data.title
    if data.base_serving:
        recipe.base_serving = data.base_serving
    db.commit()

    if data.ingredients:
        db.query(RecipeIngredient).filter(RecipeIngredient.recipe_id == recipe_id).delete()
        for ing in data.ingredients:
            db.add(RecipeIngredient(recipe_id=recipe.id, ingredient_id=ing.ingredient_id, quantity=ing.quantity, unit_name=ing.unit_name))

    if data.steps:
        db.query(RecipeStep).filter(RecipeStep.recipe_id == recipe_id).delete()
        for step in data.steps:
            db.add(RecipeStep(
                recipe_id=recipe.id,
                step_order=step.step_order,
                description=step.description,
                image_url=step.image_url
            ))

    db.commit()
    db.refresh(recipe)
    return recipe

@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db), current_user: User = Depends(RoleChecker("member"))):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(404, "Recipe not found")

    if recipe.uploader_id != current_user.id and current_user.role != "admin":
        raise HTTPException(403, "Permission denied")

    db.delete(recipe)
    db.commit()
    return

