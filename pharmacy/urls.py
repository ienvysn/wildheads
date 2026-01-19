from django.urls import path
from .views import MedicineListView, PrescriptionListView

urlpatterns = [
    path('medicines/', MedicineListView.as_view(), name='medicine-list'),
    path('prescriptions/', PrescriptionListView.as_view(), name='prescription-list'),
]
