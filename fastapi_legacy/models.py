from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="patient") # admin, doctor, nurse, patient
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False, lazy="selectin")
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False, lazy="selectin")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    dob = Column(DateTime)
    gender = Column(String)
    phone = Column(String)
    address = Column(String)
    emergency_contact_name = Column(String)
    emergency_contact_phone = Column(String)
    
    # Relationships
    user = relationship("User", back_populates="patient_profile")
    medical_history = relationship("MedicalHistory", back_populates="patient", uselist=False, lazy="selectin")
    vitals = relationship("Vitals", back_populates="patient", order_by="desc(Vitals.recorded_at)", lazy="selectin")
    ai_analyses = relationship("AIAnalysis", back_populates="patient", order_by="desc(AIAnalysis.created_at)", lazy="selectin")

class MedicalHistory(Base):
    __tablename__ = "medical_histories"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), unique=True, nullable=False)
    allergies = Column(String) # JSON or Comma Separated
    chronic_conditions = Column(String)
    past_surgeries = Column(String)
    family_history = Column(String)

    # Relationships
    patient = relationship("Patient", back_populates="medical_history")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    location = Column(String)

    # Relationships
    doctors = relationship("Doctor", back_populates="department")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    specialization = Column(String)
    qualification = Column(String)
    experience_years = Column(Integer)
    consultation_fee = Column(Integer) # In cents or smallest unit
    is_available = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    department = relationship("Department", back_populates="doctors", lazy="selectin")

class Vitals(Base):
    __tablename__ = "vitals"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    bp_systolic = Column(Integer)
    bp_diastolic = Column(Integer)
    heart_rate = Column(Integer)
    temperature = Column(Float) # Celsius
    oxygen_level = Column(Integer) # SpO2 %
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String)
    
    # Relationships
    patient = relationship("Patient", back_populates="vitals")

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    risk_level = Column(String) # High, Medium, Low
    confidence_score = Column(Float)
    # Storing complex data as JSON string for simplicity in this hackathon context
    # In a real app, might use JSONB or separate tables
    possible_causes = Column(String) 
    risk_prediction = Column(String)
    future_problems = Column(String)
    recommendations = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="ai_analyses")

class SecurityLog(Base):
    __tablename__ = "security_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Can be null for failed login from unknown user
    ip_address = Column(String)
    action = Column(String) # LOGIN_ATTEMPT, API_ACCESS, SQL_INJECTION_ATTEMPT
    status = Column(String) # SUCCESS, FAILED, BLOCKED
    details = Column(String) 
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_id = Column(Integer) # ID of the object being accessed
    target_table = Column(String) # "patients", "reports", etc.
    action = Column(String) # VIEW, UPDATE, DELETE
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    appointment_date = Column(DateTime)
    status = Column(String, default="scheduled") # scheduled, completed, cancelled
    reason = Column(String)
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    doctor = relationship("Doctor", backref="appointments", lazy="selectin")
    patient = relationship("Patient", backref="appointments", lazy="selectin")
