from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..schemas import DepartmentCreate, DepartmentResponse
from ..models import User
from ..services.department_service import DepartmentService
from ..services.auth_service import get_current_user

router = APIRouter(
    prefix="/departments",
    tags=["Departments"]
)

@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(
    dept_data: DepartmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    service = DepartmentService(db)
    # Check if exists
    if await service.get_department_by_name(dept_data.name):
        raise HTTPException(status_code=400, detail="Department already exists")
        
    return await service.create_department(dept_data)

@router.get("/", response_model=list[DepartmentResponse])
async def list_departments(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    service = DepartmentService(db)
    return await service.get_departments(skip, limit)
