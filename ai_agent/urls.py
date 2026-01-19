from django.urls import path
from .views import PatientChatView, DoctorAnalyzeView

urlpatterns = [
    path('chat/', PatientChatView.as_view(), name='ai-chat'),
    path('analyze/<int:patient_id>/', DoctorAnalyzeView.as_view(), name='ai-analyze'),
]
