from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from BE.src.database import SessionLocal
from BE.src.models.recipes import Recipe, RecipeIngredient, RecipeStep, Ingredient, User

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
    amount: float
    unit: str

class RecipeStepDTO(BaseModel):
    step_number: int = Field(alias="step_order")
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
    title: Optional[str]
    base_serving: Optional[int]
    ingredients: Optional[List[IngredientDTO]]
    steps: Optional[List[RecipeStepDTO]]

class RecipeResponseDTO(BaseModel):
    id: int
    title: str
    base_serving: int
    uploader_id: int
    created_at: datetime
    steps: List[RecipeStepDTO]

    class Config:
        orm_mode = True

@router.get("/search", response_model=List[RecipeResponseDTO])
def search_recipes(title: str, db: Session = Depends(get_db)):
    return db.query(Recipe).filter(Recipe.title.contains(title)).all()

@router.get("/list", response_model=List[RecipeResponseDTO])
def list_recipes(db: Session = Depends(get_db)):
    return db.query(Recipe).all()

@router.get("/{recipe_id}", response_model=RecipeResponseDTO)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    return recipe

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
        db.add(RecipeIngredient(recipe_id=recipe.id, ingredient_id=ing.ingredient_id, amount=ing.amount, unit=ing.unit))

    for step in data.steps:
        db.add(RecipeStep(
            recipe_id=recipe.id,
            step_order=step.step_number,
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

    if recipe.uploader_id != current_user.id and current_user.role not in ("관리자", "임원진"):
        raise HTTPException(403, "Permission denied")

    if data.title:
        recipe.title = data.title
    if data.base_serving:
        recipe.base_serving = data.base_serving
    db.commit()

    if data.ingredients:
        db.query(RecipeIngredient).filter(RecipeIngredient.recipe_id == recipe_id).delete()
        for ing in data.ingredients:
            db.add(RecipeIngredient(recipe_id=recipe.id, ingredient_id=ing.ingredient_id, amount=ing.amount, unit=ing.unit))

    if data.steps:
        db.query(RecipeStep).filter(RecipeStep.recipe_id == recipe_id).delete()
        for step in data.steps:
            db.add(RecipeStep(
                recipe_id=recipe.id,
                step_order=step.step_number,
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

    if recipe.uploader_id != current_user.id and current_user.role != "관리자":
        raise HTTPException(403, "Permission denied")

    db.delete(recipe)
    db.commit()
    return
