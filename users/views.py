from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, UserSerializer, DoctorSerializer, PatientSerializer
from .auth_serializers import CustomTokenObtainPairSerializer
from .models import Doctor, Patient
from django.contrib.auth import get_user_model
from medical.models import Appointment, Vitals
from pharmacy.models import Prescription
from lab.models import TestResult
from billing.models import Invoice
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomLoginView(TokenObtainPairView):
    """
    Custom login view that accepts both username and email
    """
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        # Only admin or nurse can register patients
        if request.user.role not in ['admin', 'nurse']:
            return Response({"detail": "Only staff can register patients."}, status=status.HTTP_403_FORBIDDEN)

        role = request.data.get('role', 'patient')
        if role != 'patient':
            return Response({"detail": "Only patient registration is allowed here."}, status=status.HTTP_400_BAD_REQUEST)

        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            # Provide patient key for login
            response.data['patient_key'] = response.data.get('username')
        return response

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class DoctorListView(generics.ListAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = (permissions.IsAuthenticated,)

class PatientListView(generics.ListAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['doctor', 'admin', 'nurse']:
             return Patient.objects.all() # Staff see all
        return Patient.objects.filter(user=user) # Patients see themselves

class PatientDetailView(generics.RetrieveAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.role in ['doctor', 'admin', 'nurse']:
            return Patient.objects.all()
        return Patient.objects.filter(user=user)

class SummaryView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        data = {
            "patients": Patient.objects.count(),
            "doctors": Doctor.objects.count(),
            "nurses": User.objects.filter(role='nurse').count(),
            "admins": User.objects.filter(role='admin').count(),
            "appointments": Appointment.objects.count(),
            "vitals": Vitals.objects.count(),
            "prescriptions": Prescription.objects.count(),
            "lab_results": TestResult.objects.count(),
            "invoices": Invoice.objects.count(),
        }
        return Response(data)
