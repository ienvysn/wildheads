from rest_framework import generics, permissions
from .models import Medicine, Prescription
from .serializers import MedicineSerializer, PrescriptionSerializer

class MedicineListView(generics.ListAPIView):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = (permissions.IsAuthenticated,)

class PrescriptionListView(generics.ListCreateAPIView):
    serializer_class = PrescriptionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'patient_profile'):
            return Prescription.objects.filter(patient=user.patient_profile)
        elif hasattr(user, 'doctor_profile'):
            return Prescription.objects.filter(doctor=user.doctor_profile)
        return Prescription.objects.none()

    def perform_create(self, serializer):
        # Only doctors can create (enforce in permission or here)
        if hasattr(self.request.user, 'doctor_profile'):
             serializer.save(doctor=self.request.user.doctor_profile)
