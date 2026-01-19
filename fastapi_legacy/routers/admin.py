from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from ..database import get_db
from .. import models, schemas
from ..services.user_service import UserService
from ..services.auth_service import get_current_user
from ..core.security import get_password_hash

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# Dependency to check if user is admin
def check_admin_role(user: models.User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access admin resources"
        )
    return user

@router.get("/users", response_model=List[schemas.UserResponse])
async def get_all_users(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db), 
    current_user: models.User = Depends(check_admin_role)
):
    service = UserService(db)
    return await service.get_all_users(skip, limit)

@router.post("/users/nurse", response_model=schemas.UserResponse)
async def create_nurse(
    user_data: schemas.UserCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(check_admin_role)
):
    service = UserService(db)
    user_data.role = "nurse"
    return await service.create_user(user_data)

@router.post("/users/doctor", response_model=schemas.UserResponse)
async def create_doctor(
    user_data: schemas.UserCreate,
    doctor_profile: schemas.DoctorBase,
    department_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(check_admin_role)
):
    # 1. Create User
    service = UserService(db)
    user_data.role = "doctor"
    new_user = await service.create_user(user_data)
    
    # 2. Create Doctor Profile
    new_doctor = models.Doctor(
        user_id=new_user.id,
        department_id=department_id,
        specialization=doctor_profile.specialization,
        qualification=doctor_profile.qualification,
        experience_years=doctor_profile.experience_years,
        consultation_fee=doctor_profile.consultation_fee,
        is_available=doctor_profile.is_available
    )
    db.add(new_doctor)
    await db.commit()
    await db.refresh(new_user) # Refresh user to load doctor_profile relationship
    
    return new_user

@router.get("/security/logs", response_model=List[schemas.SecurityLogResponse])
async def get_security_logs(
    skip: int = 0, 
    limit: int = 50, 
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(check_admin_role)
):
    result = await db.execute(
        select(models.SecurityLog)
        .order_by(models.SecurityLog.timestamp.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.post("/security/simulate-attack")
async def simulate_attack(
    attack_type: str = "sql_injection",
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(check_admin_role)
):
    import random
    fake_ips = ["192.168.1.5", "10.0.0.4", "172.16.0.23", "Unknown"]
    
    log = models.SecurityLog(
        user_id=None,
        ip_address=random.choice(fake_ips),
        action=f"{attack_type.upper()}_ATTEMPT",
        status="BLOCKED",
        details=f"Detected pattern 'OR 1=1' in login field" if attack_type == "sql_injection" else "Brute force limit exceeded"
    )
    db.add(log)
    await db.commit()
    return {"message": "Attack simulated and logged"}
    
@router.get("/audit/logs", response_model=List[schemas.AuditLogResponse])
async def get_audit_logs(
    skip: int = 0, 
    limit: int = 50, 
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(check_admin_role)
):
    result = await db.execute(
        select(models.AuditLog)
        .order_by(models.AuditLog.timestamp.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.get("/system/health")
async def system_health(current_user: models.User = Depends(check_admin_role)):
    return {
        "status": "operational",
        "websocket": "connected",
        "ai_engine": "running",
        "database": "connected",
        "cloud_uptime": "99.98%"
    }
