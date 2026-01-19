from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..schemas import UserCreate, UserResponse, UserBase
from ..models import User
from ..services.user_service import UserService
from ..services.auth_service import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    user_service = UserService(db)
    return await user_service.create_user(user)

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Admin Endpoints
@router.get("/", response_model=list[UserResponse])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "admin": # Simple RBAC
        # In real app use a permission dependency
        pass # For now allow all for testing or implement check
        # raise HTTPException(status_code=403, detail="Not authorized")
    
    user_service = UserService(db)
    return await user_service.get_all_users(skip, limit)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "admin":
        pass # Implement check
    
    user_service = UserService(db)
    success = await user_service.delete_user(user_id)
    if not success:
         raise HTTPException(status_code=404, detail="User not found")

