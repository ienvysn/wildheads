import json
from fastapi import APIRouter, Depends, status, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from ..database import get_db
from .. import models, schemas
from ..services.ai_engine import AIEngine
from ..services.auth_service import get_current_user

router = APIRouter(
    prefix="/ai",
    tags=["AI Engine"]
)

def check_doctor_role(user: models.User = Depends(get_current_user)):
    if user.role != "doctor" and user.role != "admin": # Allow admin too ?
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can perform AI analysis"
        )
    return user

from ..services.ai_orchestrator import AIOrchestrator

# ... imports ...

@router.post("/analyze/{patient_id}", response_model=schemas.AIAnalysisResponse)
async def analyze_patient(
    patient_id: int, 
    symptoms: list[str] = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(check_doctor_role)
):
    # Fetch patient with history and vitals
    # ... (same fetching logic) ...
    result = await db.execute(
        select(models.Patient)
        .where(models.Patient.id == patient_id)
        .options(
            selectinload(models.Patient.medical_history),
            selectinload(models.Patient.vitals),
            selectinload(models.Patient.user) # To get age? Patient has dob.
        )
    )
    patient = result.scalars().first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    # Prepare data for AI
    from datetime import date
    age = 0
    if patient.dob:
        today = date.today()
        age = today.year - patient.dob.year - ((today.month, today.day) < (patient.dob.month, patient.dob.day))
    
    # Get latest vitals
    latest_vitals = {}
    if patient.vitals:
        v = patient.vitals[0] # Ordered desc
        latest_vitals = {
            "bp_systolic": v.bp_systolic,
            "bp_diastolic": v.bp_diastolic,
            "heart_rate": v.heart_rate,
            "temperature": v.temperature,
            "oxygen_level": v.oxygen_level
        }
    
    # Get History
    history_data = {}
    if patient.medical_history:
        history_data = {
            "chronic_conditions": patient.medical_history.chronic_conditions,
            "allergies": patient.medical_history.allergies,
            "past_surgeries": patient.medical_history.past_surgeries
        }
        
    # Call AI Orchestrator (Doctor Agent)
    orchestrator = AIOrchestrator()
    ai_result = await orchestrator.doctor_analysis(
        age=age,
        gender=patient.gender or "Unknown",
        vitals=latest_vitals,
        history=history_data,
        symptoms=symptoms
    )
    
    if not ai_result:
        raise HTTPException(status_code=503, detail="AI Service unavailable or failed to generate analysis")

    # Save Analysis to DB
    new_analysis = models.AIAnalysis(
        patient_id=patient.id,
        risk_level=ai_result.get("risk_level", "Unknown"),
        confidence_score=ai_result.get("confidence", 0.0),
        possible_causes=json.dumps(ai_result.get("possible_causes", [])),
        risk_prediction=ai_result.get("risk_prediction", "No prediction"),
        future_problems=json.dumps(ai_result.get("future_problems", [])),
        recommendations=json.dumps(ai_result.get("recommendations", []))
    )
    
    db.add(new_analysis)
    await db.commit()
    await db.refresh(new_analysis)
    
    # Broadcast
    from ..services.websocket_manager import manager
    await manager.broadcast_to_role(f"AI_REPORT_READY: Patient {patient.id} - Risk: {new_analysis.risk_level}", "doctor")
    
    return new_analysis

# --- Patient Chat Agent ---

@router.post("/chat", response_model=dict)
async def patient_chat(
    message: dict = Body(..., example={"message": "I have a headache", "history": []}),
    db: AsyncSession = Depends(get_db),
    # Allow any authenticated user (Patient)
    current_user: models.User = Depends(get_current_user)  
):
    orchestrator = AIOrchestrator()
    response_text = await orchestrator.patient_chat(
        user_message=message["message"],
        history=message.get("history", [])
    )
    
    # In a real app, log chat interaction to DB here (Audit)
    
    return {"reply": response_text}
