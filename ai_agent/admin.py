from django.contrib import admin
from .models import AIAnalysis

@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    list_display = ('patient', 'risk_level', 'confidence_score', 'created_at')
    list_filter = ('risk_level', 'created_at')
