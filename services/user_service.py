from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models import User
from ..schemas import UserCreate
from ..core.security import get_password_hash
from ..core.exceptions import EmailAlreadyRegisteredException

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str):
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_all_users(self, skip: int = 0, limit: int = 100):
        result = await self.db.execute(select(User).offset(skip).limit(limit))
        return result.scalars().all()

    async def create_user(self, user: UserCreate) -> User:
        existing_user = await self.get_user_by_email(user.email)
        if existing_user:
            raise EmailAlreadyRegisteredException()
        
        hashed_password = get_password_hash(user.password)
        new_user = User(
            email=user.email,
            hashed_password=hashed_password,
            full_name=user.full_name,
            role=user.role
        )
        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)
        return new_user

    async def delete_user(self, user_id: int):
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if user:
            # Note: Cascade delete should be handled by DB or manually here if not set on models
            await self.db.delete(user)
            await self.db.commit()
            return True
        return False
