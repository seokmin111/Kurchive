from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from BE.src.database import get_async_db
from BE.src.models.recipes import Ingredient, IngredientUnit, Recipe, RecipeIngredient

router = APIRouter(prefix="/api/ingredient", tags=["Ingredient"])

'''mode = 1 : 해당 재료에 해당되는 단위 목록
   mode = 2 : 해당 재료가 속하는 레시피 목록'''
@router.get("/{ingredient_name}")
async def get_ingredient_info(
    ingredient_name: str,
    mode: int = Query(..., description="1: 단위 목록, 2: 레시피 목록"),
    db: AsyncSession = Depends(get_async_db)
):
    # 재료 검색 (단위 관계까지 함께 로드)
    result = await db.execute(
    select(Ingredient)
    .options(selectinload(Ingredient.ingredient_units))
    .filter(Ingredient.name == ingredient_name)
)
    ingredient = result.unique().scalar_one_or_none()

    if not ingredient:
        raise HTTPException(404, "Ingredient not found")
    # mode=1 → 단위 목록
    if mode == 1:
        return {
            "ingredient": ingredient.name,
            "units": [u.unit_name for u in ingredient.ingredient_units]
        }

    # mode=2 → 레시피 목록
    elif mode == 2:
        recipes_result = await db.execute(
            select(Recipe).join(RecipeIngredient)
            .filter(RecipeIngredient.ingredient_id == ingredient.id)
        )
        recipes = recipes_result.unique().scalars().all()

        return {
            "ingredient": ingredient.name,
            "recipes": [{"id": r.id, "title": r.title} for r in recipes]
        }

    # 잘못된 mode 값
    else:
        raise HTTPException(400, "Invalid mode. Use 1 or 2.")
