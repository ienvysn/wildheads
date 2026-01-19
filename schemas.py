from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Token ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Medical History ---
class MedicalHistoryBase(BaseModel):
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    past_surgeries: Optional[str] = None
    family_history: Optional[str] = None

class MedicalHistoryCreate(MedicalHistoryBase):
    pass

class MedicalHistoryResponse(MedicalHistoryBase):
    id: int
    patient_id: int

    class Config:
        from_attributes = True

# --- Patient ---
class PatientBase(BaseModel):
    dob: Optional[datetime] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: int
    user_id: int
    medical_history: Optional[MedicalHistoryResponse] = None

    class Config:
        from_attributes = True
        
# --- Department ---
class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int

    class Config:
        from_attributes = True

# --- Doctor ---
class DoctorBase(BaseModel):
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[int] = None
    is_available: bool = True

class DoctorCreate(DoctorBase):
    user_id: int
    department_id: int

class DoctorResponse(DoctorBase):
    id: int
    user_id: int
    department_id: int
    department: Optional[DepartmentResponse] = None

    class Config:
        from_attributes = True

# --- User ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "patient"

class UserCreate(UserBase):
    password: str

class UserRegister(UserCreate):
    # Combined registration model
    patient_profile: Optional[PatientCreate] = None
    medical_history: Optional[MedicalHistoryCreate] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    patient_profile: Optional[PatientResponse] = None
    doctor_profile: Optional[DoctorResponse] = None

    class Config:
        from_attributes = True
