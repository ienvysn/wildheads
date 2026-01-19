from rest_framework import generics, permissions
from .models import Invoice
from .serializers import InvoiceSerializer

class InvoiceListView(generics.ListAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'patient_profile'):
            return Invoice.objects.filter(patient=user.patient_profile)
        # Doctors might not see invoices usually, but Admins do. 
        # For now restrict to patient viewing their own.
        return Invoice.objects.none()
