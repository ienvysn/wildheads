from django.contrib import admin
from .models import Vitals, MedicalHistory, Appointment

@admin.register(Vitals)
class VitalsAdmin(admin.ModelAdmin):
    list_display = ('patient', 'bp_systolic', 'bp_diastolic', 'heart_rate', 'temperature', 'recorded_at')
    list_filter = ('recorded_at',)

@admin.register(MedicalHistory)
class MedicalHistoryAdmin(admin.ModelAdmin):
    list_display = ('patient', 'updated_at')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'patient', 'appointment_date', 'status')
    list_filter = ('status', 'appointment_date')
