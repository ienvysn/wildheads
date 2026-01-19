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
    vitals: List["VitalsResponse"] = []
    ai_analyses: List["AIAnalysisResponse"] = []

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

# --- Vitals ---
class VitalsBase(BaseModel):
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    oxygen_level: Optional[int] = None
    notes: Optional[str] = None

class VitalsCreate(VitalsBase):
    patient_id: int

class VitalsResponse(VitalsBase):
    id: int
    patient_id: int
    recorded_at: datetime
    
    class Config:
        from_attributes = True

# --- AI Analysis ---
class AIAnalysisBase(BaseModel):
    risk_level: Optional[str] = None
    confidence_score: Optional[float] = None
    possible_causes: Optional[str] = None # JSON string
    risk_prediction: Optional[str] = None
    future_problems: Optional[str] = None
    recommendations: Optional[str] = None

class AIAnalysisCreate(AIAnalysisBase):
    patient_id: int

class AIAnalysisResponse(AIAnalysisBase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Security Log ---
class SecurityLogBase(BaseModel):
    ip_address: Optional[str] = None
    action: str
    status: str
    details: Optional[str] = None

class SecurityLogCreate(SecurityLogBase):
    user_id: Optional[int] = None

class SecurityLogResponse(SecurityLogBase):
    id: int
    user_id: Optional[int] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Audit Log ---
class AuditLogBase(BaseModel):
    target_id: int
    target_table: str
    action: str

class AuditLogCreate(AuditLogBase):
    user_id: int

class AuditLogResponse(AuditLogBase):
    id: int
    user_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Update forward refs
PatientResponse.model_rebuild()
UserResponse.model_rebuild()

# --- Appointments ---
class AppointmentBase(BaseModel):
    doctor_id: int
    patient_id: int
    appointment_date: datetime
    reason: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "scheduled"

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentChangeStatus(BaseModel):
    status: str

class AppointmentResponse(AppointmentBase):
    id: int
    created_at: datetime
    doctor: Optional["DoctorResponse"] = None
    patient: Optional["PatientResponse"] = None

    class Config:
        from_attributes = True

AppointmentResponse.model_rebuild()

