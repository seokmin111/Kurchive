from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging
import os

from BE.src.utils.image_upload import save_image

from BE.src.database import get_async_db
from BE.src.dependencies import get_current_user_from_token 
from BE.src.models.recipes import (
    Recipe, RecipeIngredient, RecipeStep, RecipeStepImage,
    Ingredient, IngredientUnit, ConvertRequestDTO
)
from BE.src.models.users import User
from BE.src.utils.units import convert_unit


logger = logging.getLogger("convert")


async def get_current_executive_user(current_user: User = Depends(get_current_user_from_token)) -> User:
    # 권한 확인 
    is_privileged = current_user.role == 'staff' or current_user.is_admin
    if not is_privileged:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Executive or admin access required",
        )
    return current_user

router = APIRouter(prefix="/api/recipe", tags=["Recipe"], dependencies=[Depends(get_current_executive_user)])



# -------- DTO --------
class IngredientDTO(BaseModel):
    ingredient_id: int
    quantity: float
    unit_name: str

class RecipeStepDTO(BaseModel):
    step_order: int
    description: str
    image_urls: List[str] = []

    class Config:
        populate_by_name = True

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
    thumbnail_url: Optional[str] = None
    steps: List[RecipeStepDTO]
    ingredients: List[IngredientDetailDTO]

    class Config:
        from_attributes = True


# -------- 공통 --------
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/recipes")

async def assert_can_edit_recipe(recipe: Recipe, current_user: User):
    is_uploader = recipe.uploader_id == current_user.id
    is_privileged = current_user.role == 'staff' or current_user.is_admin
    if not (is_uploader or is_privileged):
        raise HTTPException(status_code=403, detail="You do not have permission to modify this recipe")

async def _load_recipe_with_images(db: AsyncSession, recipe_id: int) -> Recipe:
    result = await db.execute(
        select(Recipe).options(
            selectinload(Recipe.ingredients).selectinload(RecipeIngredient.ingredient),
            selectinload(Recipe.steps).selectinload(RecipeStep.images),
        ).filter(Recipe.id == recipe_id)
    )
    return result.scalar_one_or_none()

def _build_recipe_response(recipe: Recipe):
    ingredients = [
        {
            "ingredient_id": ri.ingredient_id,
            "name": ri.ingredient.name,
            "quantity": ri.quantity,
            "unit_name": ri.unit_name,
        } for ri in recipe.ingredients
    ]
    steps = [
        {
            "step_order": s.step_order,
            "description": s.description,
            "image_urls": [img.image_url for img in s.images],
        } for s in recipe.steps
    ]
    return {
        "id": recipe.id,
        "title": recipe.title,
        "base_serving": recipe.base_serving,
        "uploader_id": recipe.uploader_id,
        "created_at": recipe.created_at,
        "thumbnail_url": recipe.thumbnail_url,
        "steps": steps,
        "ingredients": ingredients,
    }


# -------- API --------
@router.get("/search", response_model=List[RecipeResponseDTO])
async def search_recipes(title: str, db: AsyncSession = Depends(get_async_db)):
    """
    제목으로 레시피 검색
    """
    result = await db.execute(
        select(Recipe).options(
            selectinload(Recipe.ingredients).selectinload(RecipeIngredient.ingredient),
            selectinload(Recipe.steps).selectinload(RecipeStep.images)
        ).filter(Recipe.title.contains(title))
    )
    recipes = result.scalars().all()
    return [_build_recipe_response(r) for r in recipes]

@router.get("/list", response_model=List[RecipeResponseDTO])
async def list_recipes(db: AsyncSession = Depends(get_async_db)):
    """
    전체 레시피 목록 조회
    """
    result = await db.execute(
        select(Recipe).options(
            selectinload(Recipe.ingredients).selectinload(RecipeIngredient.ingredient),
            selectinload(Recipe.steps).selectinload(RecipeStep.images)
        )
    )
    recipes = result.scalars().all()
    return [_build_recipe_response(r) for r in recipes]

@router.get("/{recipe_id}", response_model=RecipeResponseDTO)
async def get_recipe(
    recipe_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token) 
):
    """
    레시피 상세조회
    """
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    return _build_recipe_response(recipe)


@router.get("/{recipe_id}/scale", response_model=RecipeResponseDTO)
async def scale_recipe(
    recipe_id: int, servings: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token) 
):
    """
    base_serving 대비 servings 비율로 재료 양만 조정해서 반환
    """
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    
    factor = servings / recipe.base_serving
    for ri in recipe.ingredients:
        ri.quantity *= factor

    return _build_recipe_response(recipe)


@router.post("/{recipe_id}/convert", response_model=RecipeResponseDTO)
async def convert_recipe(
    recipe_id: int, request: ConvertRequestDTO,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_executive_user)
):
    """
    단위 변환
    """
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")

    unit_map = request.units
    for ri in recipe.ingredients:
        target_unit_name = unit_map.get(ri.ingredient_id)
        if target_unit_name:
            allowed_units_result = await db.execute(
                select(IngredientUnit).filter(IngredientUnit.ingredient_id == ri.ingredient_id)
            )
            allowed_units = allowed_units_result.scalars().all()
            allowed_unit_names = {u.unit_name for u in allowed_units}

            if target_unit_name in allowed_unit_names:
                ri.quantity, ri.unit_name = await convert_unit(
                    db=db,
                    ingredient=ri.ingredient,
                    qty=ri.quantity,
                    from_unit_name=ri.unit_name,
                    to_unit_name=target_unit_name
                )

    return _build_recipe_response(recipe)


@router.post("", response_model=RecipeResponseDTO, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    data: RecipeCreateDTO,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_executive_user)
):
    """
    레시피 생성
    """
    recipe = Recipe(
        title=data.title,
        base_serving=data.base_serving,
        uploader_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(recipe)
    await db.commit()
    await db.refresh(recipe)

    for ing in data.ingredients:
        db.add(RecipeIngredient(
            recipe_id=recipe.id,
            ingredient_id=ing.ingredient_id,
            quantity=ing.quantity,
            unit_name=ing.unit_name
        ))

    for step in data.steps:
        db.add(RecipeStep(
            recipe_id=recipe.id,
            step_order=step.step_order,
            description=step.description
        ))

    await db.commit()
    recipe = await _load_recipe_with_images(db, recipe.id)
    return _build_recipe_response(recipe)


@router.put("/{recipe_id}", response_model=RecipeResponseDTO)
async def update_recipe(
    recipe_id: int, data: RecipeUpdateDTO,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    await assert_can_edit_recipe(recipe, current_user)

    if data.title:
        recipe.title = data.title
    if data.base_serving:
        recipe.base_serving = data.base_serving
    await db.commit()

    if data.ingredients:
        await db.execute(
            RecipeIngredient.__table__.delete().where(RecipeIngredient.recipe_id == recipe_id)
        )
        for ing in data.ingredients:
            db.add(RecipeIngredient(
                recipe_id=recipe.id,
                ingredient_id=ing.ingredient_id,
                quantity=ing.quantity,
                unit_name=ing.unit_name
            ))

    if data.steps:
        await db.execute(
            RecipeStep.__table__.delete().where(RecipeStep.recipe_id == recipe_id)
        )
        for step in data.steps:
            db.add(RecipeStep(
                recipe_id=recipe.id,
                step_order=step.step_order,
                description=step.description
            ))

    await db.commit()
    recipe = await _load_recipe_with_images(db, recipe_id)
    return _build_recipe_response(recipe)


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipe(
    recipe_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """
    레시피 삭제
    """
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")

    await assert_can_edit_recipe(recipe, current_user)

    await db.delete(recipe)
    await db.commit()
    return


# ===================================================================
# 썸네일
# ===================================================================
@router.post("/{recipe_id}/thumbnail", response_model=RecipeResponseDTO)
async def upload_thumbnail(
    recipe_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_executive_user)
):
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    await assert_can_edit_recipe(recipe, current_user)

    _, url_path = await save_image(file, os.path.join(UPLOAD_DIR, str(recipe_id), "thumbnail"))
    recipe.thumbnail_url = url_path
    await db.commit()
    recipe = await _load_recipe_with_images(db, recipe_id)
    return _build_recipe_response(recipe)

@router.patch("/{recipe_id}/thumbnail", response_model=RecipeResponseDTO)
async def replace_thumbnail(
    recipe_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    await assert_can_edit_recipe(recipe, current_user)

    if recipe.thumbnail_url:
        try:
            fp = recipe.thumbnail_url.lstrip("/")
            if fp.startswith("uploads/") and os.path.exists(fp):
                os.remove(fp)
        except: pass

    _, url_path = await save_image(file, os.path.join(UPLOAD_DIR, str(recipe_id), "thumbnail"))
    recipe.thumbnail_url = url_path
    await db.commit()
    recipe = await _load_recipe_with_images(db, recipe_id)
    return _build_recipe_response(recipe)

@router.delete("/{recipe_id}/thumbnail", status_code=status.HTTP_204_NO_CONTENT)
async def delete_thumbnail(
    recipe_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    await assert_can_edit_recipe(recipe, current_user)

    if recipe.thumbnail_url:
        try:
            fp = recipe.thumbnail_url.lstrip("/")
            if fp.startswith("uploads/") and os.path.exists(fp):
                os.remove(fp)
        except: pass
        recipe.thumbnail_url = None
        await db.commit()
    return


# ===================================================================
# 단계 이미지 (append/replace/delete)
# ===================================================================
@router.post("/{recipe_id}/steps/{step_order}/images", response_model=RecipeResponseDTO)
async def upload_step_images(
    recipe_id: int,
    step_order: int,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_executive_user),
):
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    await assert_can_edit_recipe(recipe, current_user)

    step = next((s for s in recipe.steps if s.step_order == step_order), None)
    if not step:
        raise HTTPException(404, f"Step {step_order} not found")

    for f in files:
        _, url_path = await save_image(f, os.path.join(UPLOAD_DIR, str(recipe_id), f"steps/{step_order}"))
        db.add(RecipeStepImage(step_id=step.id, image_url=url_path))

    await db.commit()
    recipe = await _load_recipe_with_images(db, recipe_id)
    return _build_recipe_response(recipe)


@router.put("/{recipe_id}/steps/{step_order}/images", response_model=RecipeResponseDTO)
async def replace_step_images(
    recipe_id: int,
    step_order: int,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    await assert_can_edit_recipe(recipe, current_user)

    step = next((s for s in recipe.steps if s.step_order == step_order), None)
    if not step:
        raise HTTPException(404, f"Step {step_order} not found")

    for img in list(step.images):
        try:
            fp = img.image_url.lstrip("/")
            if fp.startswith("uploads/") and os.path.exists(fp):
                os.remove(fp)
        except: pass
        await db.delete(img)

    for f in files:
        _, url_path = await save_image(f, os.path.join(UPLOAD_DIR, str(recipe_id), f"steps/{step_order}"))
        db.add(RecipeStepImage(step_id=step.id, image_url=url_path))

    await db.commit()
    recipe = await _load_recipe_with_images(db, recipe_id)
    return _build_recipe_response(recipe)


@router.delete("/{recipe_id}/steps/{step_order}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_one_step_image(
    recipe_id: int,
    step_order: int,
    image_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token),
):
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    await assert_can_edit_recipe(recipe, current_user)

    step = next((s for s in recipe.steps if s.step_order == step_order), None)
    if not step:
        raise HTTPException(404, f"Step {step_order} not found")

    target = next((img for img in step.images if img.id == image_id), None)
    if not target:
        raise HTTPException(404, "Image not found")

    try:
        fp = target.image_url.lstrip("/")
        if fp.startswith("uploads/") and os.path.exists(fp):
            os.remove(fp)
    except: pass

    await db.delete(target)
    await db.commit()
    return
