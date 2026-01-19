from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..schemas import DoctorCreate, DoctorResponse
from ..models import User
from ..services.doctor_service import DoctorService
from ..services.auth_service import get_current_user

router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"]
)

@router.post("/", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
async def create_doctor(
    doctor_data: DoctorCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    service = DoctorService(db)
    # Check if user already has a doctor profile
    if await service.get_doctor_by_user_id(doctor_data.user_id):
        raise HTTPException(status_code=400, detail="User is already a doctor")
        
    return await service.create_doctor_profile(doctor_data)

@router.get("/", response_model=list[DoctorResponse])
async def list_doctors(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    service = DoctorService(db)
    return await service.get_doctors(skip, limit)
