from django.contrib import admin
from .models import LabTest, TestResult

@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = ('name', 'cost')

@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('test', 'patient', 'status', 'date_requested')
    list_filter = ('status',)
