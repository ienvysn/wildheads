from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from users.models import UserProfile
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with sample users for all roles'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Starting database seeding...'))
        
        with transaction.atomic():
            # Clear existing users (except superusers)
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.SUCCESS('✓ Cleared existing users'))
            
            # Create Admin Users
            self.stdout.write(self.style.WARNING('\nCreating Admin users...'))
            admins = [
                {
                    'username': 'admin',
                    'email': 'admin@aarogya.health',
                    'first_name': 'System',
                    'last_name': 'Administrator',
                    'password': 'admin123',
                },
                {
                    'username': 'john.admin',
                    'email': 'john.admin@aarogya.health',
                    'first_name': 'John',
                    'last_name': 'Smith',
                    'password': 'admin123',
                },
            ]
            
            for admin_data in admins:
                user = User.objects.create_user(
                    username=admin_data['username'],
                    email=admin_data['email'],
                    first_name=admin_data['first_name'],
                    last_name=admin_data['last_name'],
                    password=admin_data['password'],
                    role='admin'
                )
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created admin: {user.username} ({user.email})'))
            
            # Create Doctor Users
            self.stdout.write(self.style.WARNING('\nCreating Doctor users...'))
            doctors = [
                {
                    'username': 'dr.sarah',
                    'email': 'sarah.johnson@aarogya.health',
                    'first_name': 'Sarah',
                    'last_name': 'Johnson',
                    'password': 'doctor123',
                    'specialization': 'Cardiology',
                },
                {
                    'username': 'dr.michael',
                    'email': 'michael.chen@aarogya.health',
                    'first_name': 'Michael',
                    'last_name': 'Chen',
                    'password': 'doctor123',
                    'specialization': 'Neurology',
                },
                {
                    'username': 'dr.emily',
                    'email': 'emily.davis@aarogya.health',
                    'first_name': 'Emily',
                    'last_name': 'Davis',
                    'password': 'doctor123',
                    'specialization': 'Pediatrics',
                },
                {
                    'username': 'dr.james',
                    'email': 'james.wilson@aarogya.health',
                    'first_name': 'James',
                    'last_name': 'Wilson',
                    'password': 'doctor123',
                    'specialization': 'Orthopedics',
                },
                {
                    'username': 'dr.lisa',
                    'email': 'lisa.martinez@aarogya.health',
                    'first_name': 'Lisa',
                    'last_name': 'Martinez',
                    'password': 'doctor123',
                    'specialization': 'Ophthalmology',
                },
            ]
            
            for doctor_data in doctors:
                user = User.objects.create_user(
                    username=doctor_data['username'],
                    email=doctor_data['email'],
                    first_name=doctor_data['first_name'],
                    last_name=doctor_data['last_name'],
                    password=doctor_data['password'],
                    role='doctor'
                )
                # Create or update profile with specialization
                profile, created = UserProfile.objects.get_or_create(user=user)
                profile.specialization = doctor_data['specialization']
                profile.save()
                self.stdout.write(self.style.SUCCESS(
                    f'  ✓ Created doctor: {user.username} - {doctor_data["specialization"]} ({user.email})'
                ))
            
            # Create Nurse Users
            self.stdout.write(self.style.WARNING('\nCreating Nurse users...'))
            nurses = [
                {
                    'username': 'nurse.anna',
                    'email': 'anna.brown@aarogya.health',
                    'first_name': 'Anna',
                    'last_name': 'Brown',
                    'password': 'nurse123',
                    'department': 'Emergency',
                },
                {
                    'username': 'nurse.robert',
                    'email': 'robert.taylor@aarogya.health',
                    'first_name': 'Robert',
                    'last_name': 'Taylor',
                    'password': 'nurse123',
                    'department': 'ICU',
                },
                {
                    'username': 'nurse.maria',
                    'email': 'maria.garcia@aarogya.health',
                    'first_name': 'Maria',
                    'last_name': 'Garcia',
                    'password': 'nurse123',
                    'department': 'Pediatrics',
                },
                {
                    'username': 'nurse.david',
                    'email': 'david.lee@aarogya.health',
                    'first_name': 'David',
                    'last_name': 'Lee',
                    'password': 'nurse123',
                    'department': 'Surgery',
                },
                {
                    'username': 'nurse.jennifer',
                    'email': 'jennifer.white@aarogya.health',
                    'first_name': 'Jennifer',
                    'last_name': 'White',
                    'password': 'nurse123',
                    'department': 'Cardiology',
                },
            ]
            
            for nurse_data in nurses:
                user = User.objects.create_user(
                    username=nurse_data['username'],
                    email=nurse_data['email'],
                    first_name=nurse_data['first_name'],
                    last_name=nurse_data['last_name'],
                    password=nurse_data['password'],
                    role='nurse'
                )
                # Create or update profile with department
                profile, created = UserProfile.objects.get_or_create(user=user)
                profile.department = nurse_data['department']
                profile.save()
                self.stdout.write(self.style.SUCCESS(
                    f'  ✓ Created nurse: {user.username} - {nurse_data["department"]} ({user.email})'
                ))
            
            # Create Patient Users
            self.stdout.write(self.style.WARNING('\nCreating Patient users...'))
            patients = [
                {
                    'username': 'patient.alice',
                    'email': 'alice.cooper@email.com',
                    'first_name': 'Alice',
                    'last_name': 'Cooper',
                    'password': 'patient123',
                    'phone': '+1-555-0101',
                    'date_of_birth': '1985-03-15',
                },
                {
                    'username': 'patient.bob',
                    'email': 'bob.miller@email.com',
                    'first_name': 'Bob',
                    'last_name': 'Miller',
                    'password': 'patient123',
                    'phone': '+1-555-0102',
                    'date_of_birth': '1990-07-22',
                },
                {
                    'username': 'patient.carol',
                    'email': 'carol.anderson@email.com',
                    'first_name': 'Carol',
                    'last_name': 'Anderson',
                    'password': 'patient123',
                    'phone': '+1-555-0103',
                    'date_of_birth': '1978-11-30',
                },
                {
                    'username': 'patient.daniel',
                    'email': 'daniel.thomas@email.com',
                    'first_name': 'Daniel',
                    'last_name': 'Thomas',
                    'password': 'patient123',
                    'phone': '+1-555-0104',
                    'date_of_birth': '1995-05-18',
                },
                {
                    'username': 'patient.emma',
                    'email': 'emma.jackson@email.com',
                    'first_name': 'Emma',
                    'last_name': 'Jackson',
                    'password': 'patient123',
                    'phone': '+1-555-0105',
                    'date_of_birth': '1988-09-25',
                },
                {
                    'username': 'patient.frank',
                    'email': 'frank.harris@email.com',
                    'first_name': 'Frank',
                    'last_name': 'Harris',
                    'password': 'patient123',
                    'phone': '+1-555-0106',
                    'date_of_birth': '1972-12-08',
                },
                {
                    'username': 'patient.grace',
                    'email': 'grace.martin@email.com',
                    'first_name': 'Grace',
                    'last_name': 'Martin',
                    'password': 'patient123',
                    'phone': '+1-555-0107',
                    'date_of_birth': '2000-02-14',
                },
                {
                    'username': 'patient.henry',
                    'email': 'henry.thompson@email.com',
                    'first_name': 'Henry',
                    'last_name': 'Thompson',
                    'password': 'patient123',
                    'phone': '+1-555-0108',
                    'date_of_birth': '1965-06-20',
                },
            ]
            
            for patient_data in patients:
                # Generate patient ID
                year = 2026
                random_num = random.randint(100000, 999999)
                patient_id = f"PID-{year}-{random_num}"
                
                user = User.objects.create_user(
                    username=patient_data['username'],
                    email=patient_data['email'],
                    first_name=patient_data['first_name'],
                    last_name=patient_data['last_name'],
                    password=patient_data['password'],
                    role='patient'
                )
                # Create or update profile with patient details
                profile, created = UserProfile.objects.get_or_create(user=user)
                profile.patient_id = patient_id
                profile.phone = patient_data['phone']
                profile.date_of_birth = patient_data['date_of_birth']
                profile.save()
                self.stdout.write(self.style.SUCCESS(
                    f'  ✓ Created patient: {user.username} - {patient_id} ({user.email})'
                ))
        
        # Print summary
        self.stdout.write(self.style.SUCCESS('\n' + '='*80))
        self.stdout.write(self.style.SUCCESS('DATABASE SEEDING COMPLETED!'))
        self.stdout.write(self.style.SUCCESS('='*80))
        
        self.stdout.write(self.style.WARNING('\n📊 SUMMARY:'))
        self.stdout.write(f'  • Admins: {User.objects.filter(role="admin").count()}')
        self.stdout.write(f'  • Doctors: {User.objects.filter(role="doctor").count()}')
        self.stdout.write(f'  • Nurses: {User.objects.filter(role="nurse").count()}')
        self.stdout.write(f'  • Patients: {User.objects.filter(role="patient").count()}')
        self.stdout.write(f'  • Total Users: {User.objects.count()}')
        
        self.stdout.write(self.style.WARNING('\n🔑 LOGIN CREDENTIALS:'))
        self.stdout.write(self.style.SUCCESS('\nAdmin:'))
        self.stdout.write('  Username: admin | Password: admin123')
        self.stdout.write(self.style.SUCCESS('\nDoctor:'))
        self.stdout.write('  Username: dr.sarah | Password: doctor123')
        self.stdout.write(self.style.SUCCESS('\nNurse:'))
        self.stdout.write('  Username: nurse.anna | Password: nurse123')
        self.stdout.write(self.style.SUCCESS('\nPatient:'))
        self.stdout.write('  Username: patient.alice | Password: patient123')
        
        self.stdout.write(self.style.SUCCESS('\n✅ All users created successfully!'))
