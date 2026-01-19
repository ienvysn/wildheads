from django.db import models
from users.models import Doctor, Patient

class LabTest(models.Model):
    name = models.CharField(max_length=200, help_text="e.g. CBC, Lipid Profile")
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    reference_range = models.TextField(blank=True, help_text="Normal range for this test")
    
    def __str__(self):
        return self.name

class TestResult(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    )
    test = models.ForeignKey(LabTest, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True)
    date_requested = models.DateTimeField(auto_now_add=True)
    date_completed = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Simple result text or JSON for complex results
    result_data = models.TextField(blank=True)
    file_attachment = models.FileField(upload_to='lab_reports/', blank=True, null=True)
    
    def __str__(self):
        return f"{self.test.name} for {self.patient}"
