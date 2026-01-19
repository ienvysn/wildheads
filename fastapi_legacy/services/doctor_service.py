from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from ..models import Doctor, Department
from ..schemas import DoctorCreate

class DoctorService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_doctor_profile(self, doctor_data: DoctorCreate) -> Doctor:
        new_doctor = Doctor(
            user_id=doctor_data.user_id,
            department_id=doctor_data.department_id,
            specialization=doctor_data.specialization,
            qualification=doctor_data.qualification,
            experience_years=doctor_data.experience_years,
            consultation_fee=doctor_data.consultation_fee,
            is_available=doctor_data.is_available
        )
        self.db.add(new_doctor)
        await self.db.commit()
        await self.db.refresh(new_doctor)
        return new_doctor

    async def get_doctors(self, skip: int = 0, limit: int = 100):
        # Eager load department info
        statement = select(Doctor).options(selectinload(Doctor.department)).offset(skip).limit(limit)
        result = await self.db.execute(statement)
        return result.scalars().all()

    async def get_doctor_by_user_id(self, user_id: int) -> Doctor | None:
        statement = select(Doctor).options(selectinload(Doctor.department)).where(Doctor.user_id == user_id)
        result = await self.db.execute(statement)
        return result.scalars().first()
