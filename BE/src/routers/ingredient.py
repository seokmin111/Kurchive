# ingredient.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from BE.src.database import get_async_db
from BE.src.models.recipes import Ingredient, IngredientUnit, Recipe, RecipeIngredient


from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


router = APIRouter(prefix="/api/ingredient", tags=["Ingredient"])

'''mode = 1 : 해당 재료에 해당되는 단위 목록
   mode = 2 : 해당 재료가 속하는 레시피 목록'''
@router.get("/{ingredient_name}")
async def get_ingredient_info(
    ingredient_name: str,
    mode: int = Query(..., description="1: 단위 목록, 2: 레시피 목록"),
    db: AsyncSession = Depends(get_async_db)
):
    # Ingredient 여러 unit을 포함할 수 있으므로 all()로 가져옴
    result = await db.execute(
        select(Ingredient)
        .options(selectinload(Ingredient.ingredient_units))
        .filter(Ingredient.name == ingredient_name)
    )
    ingredients = result.scalars().all()   # ✅ 리스트 형태로 반환

    if not ingredients:
        raise HTTPException(404, "Ingredient not found")

    # mode 1 → 단위 목록
    if mode == 1:
        return {
            "ingredient": ingredient_name,
            "units": list({
                u.unit_name
                for ing in ingredients
                for u in ing.ingredient_units
            })
        }

    # mode 2 → 레시피 목록
    elif mode == 2:
        recipes_result = await db.execute(
            select(Recipe)
            .join(RecipeIngredient)
            .filter(RecipeIngredient.ingredient_id.in_([ing.id for ing in ingredients]))
        )
        recipes = recipes_result.scalars().all()
        return {
            "ingredient": ingredient_name,
            "recipes": [{"id": r.id, "title": r.title} for r in recipes]
        }

    else:
        raise HTTPException(400, "Invalid mode. Use 1 or 2.")


class IngredientSearchItem(BaseModel):
    id: int
    name: str
    unit_type: Optional[str] = "mass"


@router.get("/search", response_model=List[IngredientSearchItem])
async def search_ingredients(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_async_db),
):
    result = await db.execute(
        select(Ingredient)
        .where(Ingredient.name.ilike(f"%{q}%"))
        .order_by(Ingredient.name)
        .limit(limit)
    )
    items = result.scalars().all()

    return [
        {
            "id": it.id,
            "name": it.name,
            "unit_type": it.unit_type,
        }
        for it in items
    ]
