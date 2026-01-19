from django.db import models
from users.models import Doctor, Patient

class Medicine(models.Model):
    name = models.CharField(max_length=200)
    manufacturer = models.CharField(max_length=200, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    expiry_date = models.DateField()
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Prescription(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    date_issued = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"Prescription #{self.id} for {self.patient}"

class PrescriptionItem(models.Model):
    prescription = models.ForeignKey(Prescription, related_name='items', on_delete=models.CASCADE)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    dosage = models.CharField(max_length=100, help_text="e.g. 1-0-1 after food")
    quantity = models.IntegerField(default=1)
    
    def __str__(self):
        return f"{self.medicine.name} x {self.quantity}"
