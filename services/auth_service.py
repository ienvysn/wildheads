from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from ..core import security, config, exceptions
from ..services.user_service import UserService
from ..database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_service = UserService(db)

    async def authenticate_user(self, email: str, password: str):
        user = await self.user_service.get_user_by_email(email)
        if not user or not security.verify_password(password, user.hashed_password):
            return None
        return user

    def create_access_token(self, user_email: str, role: str):
        access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return security.create_access_token(
            data={"sub": user_email, "role": role},
            expires_delta=access_token_expires
        )

# Dependency for current user
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(token, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise exceptions.CredentialsException()
    except JWTError:
        raise exceptions.CredentialsException()
    
    user_service = UserService(db)
    user = await user_service.get_user_by_email(email)
    if user is None:
        raise exceptions.CredentialsException()
    return user
