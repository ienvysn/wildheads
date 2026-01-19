from django.db import models
from users.models import Patient
from pharmacy.models import Prescription
from lab.models import TestResult

class Invoice(models.Model):
    STATUS_CHOICES = (
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    )
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    date_issued = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')
    
    # Links to other items (Optional, can be generic relations too)
    prescription = models.OneToOneField(Prescription, on_delete=models.SET_NULL, null=True, blank=True)
    # Could link multiple tests, keeping simple for now
    
    def __str__(self):
        return f"Invoice #{self.id} - {self.status}"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.description} : {self.amount}"
