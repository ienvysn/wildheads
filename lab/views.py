from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import LabTest, TestResult
from .serializers import LabTestSerializer, TestResultSerializer
from users.models import Patient

class LabTestListView(generics.ListAPIView):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer
    permission_classes = (permissions.IsAuthenticated,)

class TestResultListView(generics.ListAPIView):
    serializer_class = TestResultSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'nurse']:
            return TestResult.objects.all()
        if hasattr(user, 'patient_profile'):
            return TestResult.objects.filter(patient=user.patient_profile)
        elif hasattr(user, 'doctor_profile'):
            return TestResult.objects.filter(doctor=user.doctor_profile)
        return TestResult.objects.none()

class TestResultCreateView(generics.CreateAPIView):
    serializer_class = TestResultSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        if request.user.role not in ['admin', 'nurse', 'doctor']:
            return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        # If doctor is creating, attach doctor profile automatically
        if hasattr(self.request.user, 'doctor_profile'):
            serializer.save(doctor=self.request.user.doctor_profile)
        else:
            serializer.save()
