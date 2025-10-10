from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from BE.src.models.comments import Comment
from BE.src.database import get_async_db
from BE.src.dependencies import get_current_user_from_token

router = APIRouter(prefix="/comments", tags=["Comments"])

from pydantic import BaseModel
from datetime import datetime

# 댓글 생성용 스키마 (POST 요청 시)
class CommentCreate(BaseModel):
    restaurant_id: int
    content: str


# 댓글 조회용 스키마 (Response)
class CommentRead(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    content: str
    created_at: datetime

    class Config:
        orm_mode = True
        
# 댓글 조회
@router.get("/{restaurant_id}")
async def get_comments(restaurant_id: int, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(Comment).where(Comment.restaurant_id == restaurant_id))
    comments = result.scalars().all()
    return {"ok": True, "data": comments}

# 댓글 등록
@router.post("/")
async def create_comment(
    payload: CommentCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user=Depends(get_current_user_from_token)
):
    new_comment = Comment(
        restaurant_id=payload.restaurant_id,
        user_id=current_user.id,
        content=payload.content
    )
    db.add(new_comment)
    await db.commit()
    await db.refresh(new_comment)
    return {"ok": True, "data": {"id": new_comment.id}}
