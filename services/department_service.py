from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models import Department
from ..schemas import DepartmentCreate

class DepartmentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_department(self, department: DepartmentCreate) -> Department:
        new_dept = Department(
            name=department.name,
            description=department.description,
            location=department.location
        )
        self.db.add(new_dept)
        await self.db.commit()
        await self.db.refresh(new_dept)
        return new_dept

    async def get_departments(self, skip: int = 0, limit: int = 100):
        result = await self.db.execute(select(Department).offset(skip).limit(limit))
        return result.scalars().all()

    async def get_department_by_id(self, dept_id: int) -> Department | None:
        result = await self.db.execute(select(Department).where(Department.id == dept_id))
        return result.scalars().first()
    
    async def get_department_by_name(self, name: str) -> Department | None:
        result = await self.db.execute(select(Department).where(Department.name == name))
        return result.scalars().first()
