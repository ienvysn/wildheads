from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from .. import models, schemas
from ..services.auth_service import get_current_user

router = APIRouter(
    prefix="/vitals",
    tags=["Vitals"]
)

def check_medical_role(user: models.User = Depends(get_current_user)):
    if user.role not in ["doctor", "nurse", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authorized personnel only"
        )
    return user

from ..services.websocket_manager import manager

# ... check_medical_role ...

@router.post("/", response_model=schemas.VitalsResponse)
async def create_vitals(
    vitals_data: schemas.VitalsCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(check_medical_role)
):
    new_vitals = models.Vitals(
        patient_id=vitals_data.patient_id,
        bp_systolic=vitals_data.bp_systolic,
        bp_diastolic=vitals_data.bp_diastolic,
        heart_rate=vitals_data.heart_rate,
        temperature=vitals_data.temperature,
        oxygen_level=vitals_data.oxygen_level,
        notes=vitals_data.notes
    )
    db.add(new_vitals)
    await db.commit()
    await db.refresh(new_vitals)
    
    # Broadcast alert if critical (Mock logic)
    message = ""
    if (new_vitals.bp_systolic and new_vitals.bp_systolic > 140) or (new_vitals.heart_rate and new_vitals.heart_rate > 100):
        message = f"ALERT: Abnormal vitals for Patient {vitals_data.patient_id}"
    else:
        message = f"Update: New vitals for Patient {vitals_data.patient_id}"
        
    await manager.broadcast_to_role(message, "doctor")
    await manager.broadcast_to_role(message, "nurse")
    
    return new_vitals
