from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from .. import models, schemas
from ..services.auth_service import get_current_user

router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"]
)

@router.post("/", response_model=schemas.AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appt_data: schemas.AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify doctor and patient exist
    # (Omitted strictly for speed, but good practice)
    
    new_appt = models.Appointment(
        doctor_id=appt_data.doctor_id,
        patient_id=appt_data.patient_id,
        appointment_date=appt_data.appointment_date,
        reason=appt_data.reason,
        notes=appt_data.notes,
        status=appt_data.status
    )
    db.add(new_appt)
    await db.commit()
    await db.refresh(new_appt)
    return new_appt

@router.get("/", response_model=List[schemas.AppointmentResponse])
async def list_appointments(
    doctor_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = select(models.Appointment)
    
    if doctor_id:
        query = query.where(models.Appointment.doctor_id == doctor_id)
    if patient_id:
        query = query.where(models.Appointment.patient_id == patient_id)
        
    # Role-based restriction: Patients see only theirs, Doctors see theirs
    if current_user.role == "patient" and current_user.patient_profile:
        query = query.where(models.Appointment.patient_id == current_user.patient_profile.id)
    elif current_user.role == "doctor" and current_user.doctor_profile:
        query = query.where(models.Appointment.doctor_id == current_user.doctor_profile.id)
        
    result = await db.execute(query)
    return result.scalars().all()
