from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
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
