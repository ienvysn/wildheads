from django.urls import path
from .views import LabTestListView, TestResultListView, TestResultCreateView

urlpatterns = [
    path('tests/', LabTestListView.as_view(), name='lab-tests-list'),
    path('results/', TestResultListView.as_view(), name='test-results-list'),
    path('results/create/', TestResultCreateView.as_view(), name='test-results-create'),
]
