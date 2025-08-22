import asyncio
from sqlalchemy import select, delete

# [추가] 모든 모델을 올바른 순서로 임포트하여 SQLAlchemy가 관계를 파악하게 함
from BE.src.models.users import User
from BE.src.models.tags import Tag
from BE.src.models.restaurants import Restaurant, RestaurantTag
# (이하 다른 모델들은 이 스크립트와 직접적인 관련은 없지만, 만일을 위해 추가해도 무방합니다.)

from BE.src.database import async_session_maker

async def delete_users():
    print("Connecting to DB to delete test users...")
    async with async_session_maker() as session:
        async with session.begin():
            user_ids_to_delete = ["test01", "test02"]
            
            # 삭제할 사용자 찾기
            result = await session.execute(
                select(User).filter(User.userid.in_(user_ids_to_delete))
            )
            users_to_delete = result.scalars().all()

            if not users_to_delete:
                print("Test users 'test01', 'test02' not found. Nothing to delete.")
            else:
                # 사용자 삭제 실행
                for user in users_to_delete:
                    print(f"Deleting user: {user.userid}")
                    await session.delete(user)
                
                print("Test users deleted successfully.")
        await session.commit()

if __name__ == "__main__":
    asyncio.run(delete_users())