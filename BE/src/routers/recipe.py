# BE/src/routers/recipe.py
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Query

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging
import os

from BE.src.database import get_async_db
from BE.src.dependencies import get_current_user_from_token
from BE.src.models.recipes import (
    Recipe, RecipeIngredient, RecipeStep, RecipeStepImage,
    Ingredient, IngredientUnit, ConvertRequestDTO
)
from BE.src.models.users import User

# Helper 함수 호출
from BE.src.utils.units import convert_unit
from BE.src.utils.image_cleanup import cleanup_recipe_images, cleanup_restaurant_images
from BE.src.utils.image_upload import save_image, delete_image_oci

logger = logging.getLogger("convert")

router = APIRouter(prefix="/api/recipe", tags=["Recipe"])


# -------- DTO 정의 --------
class IngredientDTO(BaseModel):
    ingredient_id: int
    quantity: float
    unit_name: str


class IngredientCreateDTO(BaseModel):
    name: str
    quantity: float
    unit_name: str
    unit_type: Optional[str] = "mass"


class IngredientDetailDTO(BaseModel):
    ingredient_id: int
    name: str
    quantity: float
    unit_name: str


class RecipeStepDTO(BaseModel):
    step_order: int
    description: str
    image_urls: List[str] = []

    class Config:
        populate_by_name = True


class IngredientUpsertDTO(BaseModel):
    ingredient_id: Optional[int] = None
    name: Optional[str] = None
    unit_type: Optional[str] = "mass"
    quantity: float
    unit_name: str


class RecipeCreateDTO(BaseModel):
    title: str
    base_serving: int
    description: Optional[str] = None
    ingredients: List[IngredientCreateDTO]
    steps: List[RecipeStepDTO]


class RecipeUpdateDTO(BaseModel):
    title: Optional[str] = None
    base_serving: Optional[int] = None
    description: Optional[str] = None
    ingredients: Optional[List[IngredientUpsertDTO]] = None
    steps: Optional[List[RecipeStepDTO]] = None


class RecipeResponseDTO(BaseModel):
    id: int
    title: str
    base_serving: int
    uploader_id: int
    created_at: datetime
    thumbnail_url: Optional[str] = None
    description: Optional[str] = None
    steps: List[RecipeStepDTO]
    ingredients: List[IngredientDetailDTO]

    class Config:
        from_attributes = True


# -------- 공통 --------
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
            "is_custom": getattr(ri.ingredient, "is_custom", False),  # 프론트용 추가
        } for ri in recipe.ingredients
    ]

    steps = [
    {
        "step_order": s.step_order,
        "description": s.description,
        "image_urls": [img.image_url for img in s.images],  # 기존 유지
        "images": [
            {"id": img.id, "image_url": img.image_url}
            for img in s.images
        ],
    } for s in recipe.steps
    ]

    return {
        "id": recipe.id,
        "title": recipe.title,
        "base_serving": recipe.base_serving,
        "uploader_id": recipe.uploader_id,
        "created_at": recipe.created_at,
        "thumbnail_url": recipe.thumbnail_url,
        "description": getattr(recipe, "description", None),  # ✅ 추가
        "steps": steps,
        "ingredients": ingredients,
    }


# 재료 추가 API
'''DB에 없는 재료가 들어올 경우, 기본 재료 타입과 유닛 타입 지정'''
async def get_or_create_ingredient(
    db: AsyncSession,
    name: str,
    unit_type: str = "mass",
    is_custom: bool = True
):
    result = await db.execute(select(Ingredient).filter(Ingredient.name == name))
    ingredient = result.scalar_one_or_none()

    if ingredient:
        return ingredient

    ingredient = Ingredient(
        name=name,
        unit_type=unit_type,
        is_custom=is_custom
    )
    db.add(ingredient)
    await db.commit()
    await db.refresh(ingredient)

    default_units = {
        "mass": ["g", "kg"],
        "volume": ["ml", "L"],
        "count": ["개"],
        "misc": []
    }

    units = default_units.get(unit_type, ["g"])
    for i, u in enumerate(units):
        db.add(IngredientUnit(
            ingredient_id=ingredient.id,
            unit_name=u,
            is_default=(i == 0)
        ))

    await db.commit()
    return ingredient


# ============================================================
# 조회 API
# ============================================================
@router.get("/search", response_model=List[RecipeResponseDTO])
async def search_recipes(
    title: str,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    result = await db.execute(
        select(Recipe).options(
            selectinload(Recipe.ingredients).selectinload(RecipeIngredient.ingredient),
            selectinload(Recipe.steps).selectinload(RecipeStep.images)
        ).filter(Recipe.title.contains(title))
    )
    recipes = result.scalars().all()
    return [_build_recipe_response(r) for r in recipes]


@router.get("/list", response_model=List[RecipeResponseDTO])
async def list_recipes(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
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
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    return _build_recipe_response(recipe)


@router.get("/{recipe_id}/scale", response_model=RecipeResponseDTO)
async def scale_recipe(
    recipe_id: int,
    servings: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")

    factor = servings / recipe.base_serving
    for ri in recipe.ingredients:
        ri.quantity *= factor

    return _build_recipe_response(recipe)


@router.post("/{recipe_id}/convert", response_model=RecipeResponseDTO)
async def convert_recipe(
    recipe_id: int,
    request: ConvertRequestDTO,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
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


# ============================================================
# 생성/수정/삭제 API
# ============================================================
@router.post("", response_model=RecipeResponseDTO, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    data: RecipeCreateDTO,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    recipe = Recipe(
        title=data.title,
        base_serving=data.base_serving,
        description=data.description,  # ✅ 추가
        uploader_id=current_user.id,
        created_at=datetime.utcnow()
    )

    db.add(recipe)
    await db.commit()
    await db.refresh(recipe)

    for ing in data.ingredients:
        ingredient = await get_or_create_ingredient(db, ing.name, ing.unit_type or "mass")

        db.add(RecipeIngredient(
            recipe_id=recipe.id,
            ingredient_id=ingredient.id,
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
    recipe_id: int,
    data: RecipeUpdateDTO,
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
    if data.description is not None:
        recipe.description = data.description  # ✅ 추가

    await db.commit()

    # ingredients 재구성 (전체 삭제 후 재삽입)
    if data.ingredients is not None:
        await db.execute(
            RecipeIngredient.__table__.delete().where(RecipeIngredient.recipe_id == recipe_id)
        )

        for ing in data.ingredients:
            if ing.ingredient_id:
                ingredient_id = ing.ingredient_id
            else:
                if not ing.name:
                    raise HTTPException(status_code=400, detail="ingredient_id or name is required")
                ingredient = await get_or_create_ingredient(
                    db=db,
                    name=ing.name,
                    unit_type=ing.unit_type or "mass",
                    is_custom=True
                )
                ingredient_id = ingredient.id

            db.add(RecipeIngredient(
                recipe_id=recipe.id,
                ingredient_id=ingredient_id,
                quantity=ing.quantity,
                unit_name=ing.unit_name,
            ))

    # steps 재구성 (전체 삭제 후 재삽입)
    if data.steps is not None:
        # ✅ 1) 기존 step 이미지 먼저 삭제 (FK 충돌 방지)
        for s in list(recipe.steps):
            for img in list(s.images):
                try:
                    delete_image_oci(img.image_url)
                except Exception as e:
                    logger.warning(f"단계 이미지 삭제 실패: {e}")
                await db.delete(img)
        await db.flush()

        # ✅ 2) step 삭제
        await db.execute(
            RecipeStep.__table__.delete().where(RecipeStep.recipe_id == recipe_id)
        )

        # ✅ 3) step 재삽입
        for step in data.steps:
            db.add(RecipeStep(
                recipe_id=recipe.id,
                step_order=step.step_order,
                description=step.description
            ))


    await db.commit()
    recipe = await _load_recipe_with_images(db, recipe_id)
    return _build_recipe_response(recipe)


# Recipe 삭제
@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipe(
    recipe_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")

    is_uploader = recipe.uploader_id == current_user.id
    is_admin = current_user.is_admin
    if not (is_uploader or is_admin):
        raise HTTPException(status_code=403, detail="You do not have permission to delete this recipe")

    await cleanup_recipe_images(recipe)

    await db.delete(recipe)
    await db.commit()


# ============================================================
# 썸네일
# ============================================================
@router.post("/{recipe_id}/thumbnail", response_model=RecipeResponseDTO)
async def upload_thumbnail(
    recipe_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    await assert_can_edit_recipe(recipe, current_user)

    _, url_path = await save_image(file, f"recipes/{recipe_id}/thumbnail")
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
            delete_image_oci(recipe.thumbnail_url)
        except Exception as e:
            logger.warning(f"썸네일 삭제 실패: {e}")

    _, url_path = await save_image(file, f"recipes/{recipe_id}/thumbnail")
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
            delete_image_oci(recipe.thumbnail_url)
        except Exception as e:
            logger.warning(f"썸네일 삭제 실패: {e}")
        recipe.thumbnail_url = None
        await db.commit()
    return


# ============================================================
# 단계 이미지 (append/replace)
# ============================================================
@router.post("/{recipe_id}/steps/{step_order}/images", response_model=RecipeResponseDTO)
async def upload_step_images(
    recipe_id: int,
    step_order: int,
    files: List[UploadFile] = File(...),
    replace: bool = Query(False, description="true면 해당 스텝의 기존 이미지를 모두 교체"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_from_token)
):
    recipe = await _load_recipe_with_images(db, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    await assert_can_edit_recipe(recipe, current_user)

    step = next((s for s in recipe.steps if s.step_order == step_order), None)
    if not step:
        raise HTTPException(404, f"Step {step_order} not found")

    if replace:
        for img in list(step.images):
            try:
                url = img.image_url or ""
                # OCI URL이면 OCI 삭제
                if "/o/" in url:
                    delete_image_oci(url)
                else:
                    # 로컬 업로드면 로컬 삭제
                    fp = url.lstrip("/")
                    if fp.startswith("uploads/") and os.path.exists(fp):
                        os.remove(fp)
            except Exception as e:
                logger.warning(f"[레시피 단계 이미지 삭제 실패] {e}")
            await db.delete(img)
        await db.flush()


    for i, f in enumerate(files):
        _, url_path = await save_image(f, f"recipes/{recipe_id}/steps/{step_order}")
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
            delete_image_oci(img.image_url)
        except Exception as e:
            logger.warning(f"단계 이미지 삭제 실패: {e}")
        await db.delete(img)

    for f in files:
        _, url_path = await save_image(f, f"recipes/{recipe_id}/steps/{step_order}")
        db.add(RecipeStepImage(step_id=step.id, image_url=url_path))

    await db.commit()
    recipe = await _load_recipe_with_images(db, recipe_id)
    return _build_recipe_response(recipe)

# 단건 이미지 삭제
@router.delete(
    "/{recipe_id}/steps/{step_order}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_step_image(
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

    img = next((i for i in step.images if i.id == image_id), None)
    if not img:
        raise HTTPException(404, "Image not found")

    # 실제 파일 삭제
    try:
        delete_image_oci(img.image_url)
    except Exception as e:
        logger.warning(f"[단계 이미지 단건 삭제 실패] {e}")

    await db.delete(img)
    await db.commit()
