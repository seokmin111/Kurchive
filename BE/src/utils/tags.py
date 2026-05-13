
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, status
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from BE.src.models.tags import Tag, TagCategory

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

async def expand_tag_ids(db: AsyncSession, tag_ids: List[int]) -> Dict[int, List[int]]:
    result = await db.execute(select(Tag.id, Tag.parent_id, Tag.category_id))
    all_tags = result.all()

    children_map = {}
    category_map = {}

    for tid, parent_id, cid in all_tags:
        category_map[tid] = cid
        if parent_id is not None:   # 🔥 FIX
            children_map.setdefault(parent_id, []).append(tid)

    # 🔥 재귀 확장 함수
    def get_all_descendants(tid):
        result = [tid]
        for child in children_map.get(tid, []):
            result.extend(get_all_descendants(child))
        return result

    category_groups = {}

    for tid in tag_ids:
        cid = category_map.get(tid)
        expanded = get_all_descendants(tid)

        category_groups.setdefault(cid, []).extend(expanded)

    # 중복 제거
    for cid in category_groups:
        category_groups[cid] = list(set(category_groups[cid]))

    return category_groups