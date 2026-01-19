from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from ..models import Patient, MedicalHistory
from ..schemas import PatientCreate, MedicalHistoryCreate

class PatientService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_patient_profile(self, user_id: int, schema: PatientCreate) -> Patient:
        patient = Patient(
            user_id=user_id,
            dob=schema.dob,
            gender=schema.gender,
            phone=schema.phone,
            address=schema.address,
            emergency_contact_name=schema.emergency_contact_name,
            emergency_contact_phone=schema.emergency_contact_phone
        )
        self.db.add(patient)
        await self.db.commit()
        await self.db.refresh(patient)
        return patient

    async def create_medical_history(self, patient_id: int, schema: MedicalHistoryCreate) -> MedicalHistory:
        history = MedicalHistory(
            patient_id=patient_id,
            allergies=schema.allergies,
            chronic_conditions=schema.chronic_conditions,
            past_surgeries=schema.past_surgeries,
            family_history=schema.family_history
        )
        self.db.add(history)
        await self.db.commit()
        await self.db.refresh(history)
        return history

    async def get_patient_by_user_id(self, user_id: int) -> Patient:
        # Load relationships efficiently
        result = await self.db.execute(
            select(Patient)
            .options(selectinload(Patient.medical_history))
            .where(Patient.user_id == user_id)
        )
        return result.scalars().first()
