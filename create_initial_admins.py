# create_initial_admins.py
# 테스트용 관리자 2명을 생성

import asyncio
from passlib.context import CryptContext
from sqlalchemy import select

from src.models.users import User
from src.models.tags import Tag
from src.models.restaurants import Restaurant, RestaurantTag

from src.models.admin_config import AdminConfig
from src.models.favorites import Favorite
from src.models.recipes import Recipe
from src.models.regions import Region
from src.models.role_permissions import RolePermission
from src.models.signup_code import SignupCode

from src.database import async_session_maker

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_or_update_admins():
    print("Connecting to DB...")
    async with async_session_maker() as session:
        async with session.begin():
            print("Checking for admin users...")

            # 관리자 1 정보 
            admin1_userid = "test01"
            
            result1 = await session.execute(select(User).filter_by(userid=admin1_userid))
            admin1 = result1.scalar_one_or_none()
            
            if admin1:
                print(f"User '{admin1_userid}' found. Updating to admin.")
                admin1.role = "staff"    
                admin1.is_admin = True 
            else:
                print(f"User '{admin1_userid}' not found. Creating as new admin.")
                admin1 = User(
                    userid=admin1_userid,
                    password=pwd_context.hash("adminpass123"), 
                    name="김총무",
                    nickname="총무",
                    role="staff",
                    is_admin=True
                )
                session.add(admin1)

            # 관리자 2
            admin2_userid = "test02"

            result2 = await session.execute(select(User).filter_by(userid=admin2_userid))
            admin2 = result2.scalar_one_or_none()

            if admin2:
                print(f"User '{admin2_userid}' found. Updating to admin.")
                admin2.role = "staff"
                admin2.is_admin = True
            else:
                print(f"User '{admin2_userid}' not found. Creating as new admin.")
                admin2 = User(
                    userid=admin2_userid,
                    password=pwd_context.hash("adminpass123"), 
                    name="김회장",
                    nickname="회장",
                    role="staff",
                    is_admin=True
                )
                session.add(admin2)
        
        await session.commit()
    print("Admin user setup process finished.")

if __name__ == "__main__":
    asyncio.run(create_or_update_admins())