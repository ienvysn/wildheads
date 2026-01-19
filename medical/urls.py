from django.urls import path
from .views import VitalsCreateView, AppointmentListCreateView

urlpatterns = [
    path('vitals/', VitalsCreateView.as_view(), name='vitals-create'),
    path('appointments/', AppointmentListCreateView.as_view(), name='appointments-list-create'),
]
