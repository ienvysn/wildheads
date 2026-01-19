from sqladmin import ModelView
from .models import User, Patient, Doctor, Department, MedicalHistory, Vitals, AIAnalysis, Appointment, SecurityLog, AuditLog

class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.email, User.role, User.is_active, User.created_at]
    column_searchable_list = [User.email, User.full_name]
    column_sortable_list = [User.id, User.created_at]
    icon = "fa-solid fa-user"

class PatientAdmin(ModelView, model=Patient):
    column_list = [Patient.id, Patient.user_id, Patient.gender, Patient.dob]
    column_sortable_list = [Patient.id]
    icon = "fa-solid fa-bed-pulse"

class DoctorAdmin(ModelView, model=Doctor):
    column_list = [Doctor.id, Doctor.specialization, Doctor.department_id, Doctor.is_available]
    icon = "fa-solid fa-user-doctor"

class DepartmentAdmin(ModelView, model=Department):
    column_list = [Department.id, Department.name, Department.location]
    icon = "fa-solid fa-hospital"

class MedicalHistoryAdmin(ModelView, model=MedicalHistory):
    column_list = [MedicalHistory.id, MedicalHistory.patient_id, MedicalHistory.chronic_conditions]
    icon = "fa-solid fa-file-medical"

class VitalsAdmin(ModelView, model=Vitals):
    column_list = [Vitals.id, Vitals.patient_id, Vitals.bp_systolic, Vitals.heart_rate, Vitals.recorded_at]
    column_default_sort = ("recorded_at", True)
    icon = "fa-solid fa-heart-pulse"

class AIAnalysisAdmin(ModelView, model=AIAnalysis):
    column_list = [AIAnalysis.id, AIAnalysis.patient_id, AIAnalysis.risk_level, AIAnalysis.created_at]
    column_default_sort = ("created_at", True)
    icon = "fa-solid fa-brain"

class AppointmentAdmin(ModelView, model=Appointment):
    column_list = [Appointment.id, Appointment.doctor_id, Appointment.patient_id, Appointment.appointment_date, Appointment.status]
    column_default_sort = ("appointment_date", True)
    icon = "fa-solid fa-calendar-check"

class SecurityLogAdmin(ModelView, model=SecurityLog):
    column_list = [SecurityLog.id, SecurityLog.action, SecurityLog.status, SecurityLog.ip_address, SecurityLog.timestamp]
    column_default_sort = ("timestamp", True)
    icon = "fa-solid fa-shield-halved"
    can_create = False
    can_edit = False
    can_delete = False # Logs should be immutable ideally

class AuditLogAdmin(ModelView, model=AuditLog):
    column_list = [AuditLog.id, AuditLog.user_id, AuditLog.action, AuditLog.target_table, AuditLog.timestamp]
    column_default_sort = ("timestamp", True)
    icon = "fa-solid fa-list"
    can_create = False
    can_edit = False
    can_delete = False

def setup_admin(admin):
    admin.add_view(UserAdmin)
    admin.add_view(DepartmentAdmin)
    admin.add_view(DoctorAdmin)
    admin.add_view(PatientAdmin)
    admin.add_view(MedicalHistoryAdmin)
    admin.add_view(VitalsAdmin)
    admin.add_view(AIAnalysisAdmin)
    admin.add_view(AppointmentAdmin)
    admin.add_view(SecurityLogAdmin)
    admin.add_view(AuditLogAdmin)
