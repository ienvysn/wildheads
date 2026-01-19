from django.db import models
from users.models import Patient

class AIAnalysis(models.Model):
    RISK_LEVELS = (
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
        ('Unknown', 'Unknown'),
    )
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='ai_analyses')
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS, default='Unknown')
    confidence_score = models.FloatField()
    
    # Storing JSON stringified data (or use JSONField if using Postgres, but assuming SQLite safely for now)
    possible_causes = models.JSONField(default=list) 
    risk_prediction = models.TextField()
    future_problems = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Analysis {self.id} for {self.patient} - {self.risk_level}"
