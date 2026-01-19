from django.db import models
from users.models import Patient, Doctor

class MedicalHistory(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='medical_history')
    allergies = models.TextField(blank=True, default="[]") # JSON or list string
    chronic_conditions = models.TextField(blank=True, default="[]")
    past_surgeries = models.TextField(blank=True, default="[]")
    family_history = models.TextField(blank=True, default="[]")
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"History of {self.patient}"

class Vitals(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='vitals')
    bp_systolic = models.IntegerField()
    bp_diastolic = models.IntegerField()
    heart_rate = models.IntegerField()
    temperature = models.FloatField() # Celsius
    oxygen_level = models.IntegerField() # SpO2
    recorded_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-recorded_at']

    def __str__(self):
        return f"Vitals for {self.patient} at {self.recorded_at}"

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    reason = models.TextField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-appointment_date']

    def __str__(self):
        return f"Appt: {self.doctor} - {self.patient} on {self.appointment_date}"
