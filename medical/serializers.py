from rest_framework import serializers
from .models import Vitals, MedicalHistory, Appointment
from users.serializers import DoctorSerializer, PatientSerializer

class VitalsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vitals
        fields = '__all__'

class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistory
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_detail = DoctorSerializer(source='doctor', read_only=True)
    patient_detail = PatientSerializer(source='patient', read_only=True)
    
    class Meta:
        model = Appointment
        fields = '__all__'
