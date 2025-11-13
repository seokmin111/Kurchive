import asyncio
import argparse
from passlib.context import CryptContext
from sqlalchemy import select, or_


from BE.src.models.users import User
from BE.src.models.tags import Tag
from BE.src.models.restaurants import Restaurant, RestaurantTag
from BE.src.models.admin_config import AdminConfig
from BE.src.models.favorites import Favorite
from BE.src.models.recipes import Recipe
from BE.src.models.regions import Region
from BE.src.models.role_permissions import RolePermission
from BE.src.models.signup_code import SignupCode

from BE.src.database import async_session_maker

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_user(args):
    
    print("Connecting to the database...")
    async with async_session_maker() as session:
        async with session.begin():

            print(f"Checking for existing user with userid='{args.userid}' or nickname='{args.nickname}'...")
            result = await session.execute(
                select(User).filter(or_(User.userid == args.userid, User.nickname == args.nickname))
            )
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                print("\n[ERROR] A user with this userid or nickname already exists. Aborting.")
                print(f"  - Existing UserID: {existing_user.userid}")
                print(f"  - Existing Nickname: {existing_user.nickname}")
                return

            
            hashed_password = pwd_context.hash(args.password)
            
            
            new_user = User(
                userid=args.userid,
                password=hashed_password,
                nickname=args.nickname,
                name=args.name,
                role=args.role,
                is_admin=args.admin
            )
            
            session.add(new_user)
            await session.commit()
            
            print("\n[SUCCESS] 유저 생성됨")
            print("---------------------------------")
            print(f"  ID:         {new_user.userid}")
            print(f"  닉네임:   {new_user.nickname}")
            print(f"  이름:       {new_user.name}")
            print(f"  Role:       {new_user.role}")
            print(f"  Is Admin:   {new_user.is_admin}")
            print("---------------------------------")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a new user in the Kurchive database.")
    

    parser.add_argument("--userid", type=str, required=True, help="The login ID for the new user.")
    parser.add_argument("--password", type=str, required=True, help="The password for the new user.")
    parser.add_argument("--nickname", type=str, required=True, help="The unique nickname for the new user.")
    

    parser.add_argument("--name", type=str, help="The real name of the user. Defaults to nickname if not provided.")
    parser.add_argument("--role", type=str, choices=["member", "staff"], default="member", help="Set the user's role (default: member).")
    parser.add_argument("--admin", action="store_true", help="Set this flag to make the user an admin.")
    
    args = parser.parse_args()
    

    if not args.name:
        args.name = args.nickname
        

    if args.admin and args.role != 'staff':
        print("[INFO] Admins must have the 'staff' role. Overriding role to 'staff'.")
        args.role = 'staff'


    asyncio.run(create_user(args))