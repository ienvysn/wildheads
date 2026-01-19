from rest_framework import generics, permissions
from .models import LabTest, TestResult
from .serializers import LabTestSerializer, TestResultSerializer

class LabTestListView(generics.ListAPIView):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer
    permission_classes = (permissions.IsAuthenticated,)

class TestResultListView(generics.ListAPIView):
    serializer_class = TestResultSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'patient_profile'):
            return TestResult.objects.filter(patient=user.patient_profile)
        elif hasattr(user, 'doctor_profile'):
            return TestResult.objects.filter(doctor=user.doctor_profile)
        return TestResult.objects.none()
