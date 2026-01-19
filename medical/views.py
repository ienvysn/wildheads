from rest_framework import generics, permissions
from .models import Vitals, MedicalHistory, Appointment
from .serializers import VitalsSerializer, MedicalHistorySerializer, AppointmentSerializer
from users.models import Patient

class VitalsCreateView(generics.ListCreateAPIView):
    queryset = Vitals.objects.all()
    serializer_class = VitalsSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'doctor', 'nurse']:
            return Vitals.objects.all()
        if hasattr(user, 'patient_profile'):
            return Vitals.objects.filter(patient=user.patient_profile)
        return Vitals.objects.none()

    def perform_create(self, serializer):
        # Notify WebSocket group here (TODO)
        serializer.save()

class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'nurse']:
            return Appointment.objects.all()
        if hasattr(user, 'doctor_profile'):
            return Appointment.objects.filter(doctor=user.doctor_profile)
        elif hasattr(user, 'patient_profile'):
            return Appointment.objects.filter(patient=user.patient_profile)
        return Appointment.objects.none()

    def perform_create(self, serializer):
        # Auto assign patient/doctor based on request could be handled here
        serializer.save()
