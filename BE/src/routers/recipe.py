from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

import json

from BE.src.database import SessionLocal
from BE.src.models.recipes import Recipe, RecipeIngredient, RecipeStep, Ingredient, User, IngredientUnit

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


# 함수

def parse_units_param(units_param: Optional[str]) -> dict[int, int]:
    """
    units 파라미터(JSON 문자열)를 {ingredient_id: unit_id} dict로 변환
    예: '{"12":3,"15":5}' -> {12: 3, 15: 5}
    """
    if not units_param:
        return {}
    try:
        data = json.loads(units_param)
        return {int(k): int(v) for k, v in data.items()}
    except Exception:
        return {}

def convert_unit(db, ingredient, qty, from_unit_name: str, to_unit_id: int):
    """
    현재로서는
    - 기본 count 단위(개, 단 등)만 average_weight 기반 변환 가능
    - mass/volume 단위는 density 기반
    - 나머지 count 단위는 단위명만 바꿔서 보여주기 (수치는 그대로)
    """
    to_unit = db.query(IngredientUnit).filter(
        IngredientUnit.id == to_unit_id
    ).first()
    if not to_unit:
        return qty, from_unit_name

    # 같은 단위면 그대로
    if to_unit.unit_name == from_unit_name:
        return qty, from_unit_name

    # mass/volume 변환
    if to_unit.unit_type == "mass" and from_unit_name == "ml" and ingredient.density:
        return qty * ingredient.density, to_unit.unit_name
    if to_unit.unit_type == "volume" and from_unit_name == "g" and ingredient.density:
        return qty / ingredient.density, to_unit.unit_name

    # count 단위 변환 (기본 단위만)
    if to_unit.unit_type == "count":
        # 기본 단위만 average_weight로 계산 가능
        # 비기본 count 단위는 단순 표기만 변경
        return qty, to_unit.unit_name

    return qty, from_unit_name

# ------API---------
@router.get("/search", response_model=List[RecipeResponseDTO])
def search_recipes(title: str, db: Session = Depends(get_db)):
    return db.query(Recipe).filter(Recipe.title.contains(title)).all()

@router.get("/list", response_model=List[RecipeResponseDTO])
def list_recipes(db: Session = Depends(get_db)):
    return db.query(Recipe).all()

# 레시피 id로 조회 && 인분 선택 || 재료 단위 변환
'''인분 또는 재료 단위만 선택해도 됨.'''
@router.get("/{recipe_id}", response_model=RecipeResponseDTO)
def get_recipe(
    recipe_id: int,
    servings: Optional[int] = None,
    units: Optional[str] = None,  # JSON 문자열 {ingredient_id: unit_id}
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker("member"))
):
    """
    레시피 상세조회:
    - servings: 기준 인분 대비 배율 적용
    - units: 재료별 단위 변환(JSON 문자열)
    """
    unit_map = parse_units_param(units)

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

    factor = servings / recipe.base_serving if servings else 1.0
    converted_ingredients = []

    for ri in recipe.ingredients:
        ingredient = ri.ingredient
        qty = ri.quantity * factor
        unit_name = ri.unit_name

        # 재료별 단위 변환
        if ri.ingredient_id in unit_map:
            target_unit_id = unit_map[ri.ingredient_id]
            qty, unit_name = convert_unit(db, ingredient, qty, ri.unit_name, target_unit_id)

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
        "ingredients": converted_ingredients
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

