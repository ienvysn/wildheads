# Database Seeding Guide

## Overview
This guide explains how to seed the Aarogya HMS database with sample users for testing and development.

## Seeder Command

### Run the Seeder
```bash
python3 manage.py seed_users
```

## What Gets Created

### 👨‍💼 Admin Users (2)
- **admin** - System Administrator
- **john.admin** - John Smith

### 👨‍⚕️ Doctor Users (5)
- **dr.sarah** - Sarah Johnson (Cardiology)
- **dr.michael** - Michael Chen (Neurology)
- **dr.emily** - Emily Davis (Pediatrics)
- **dr.james** - James Wilson (Orthopedics)
- **dr.lisa** - Lisa Martinez (Ophthalmology)

### 👩‍⚕️ Nurse Users (5)
- **nurse.anna** - Anna Brown (Emergency)
- **nurse.robert** - Robert Taylor (ICU)
- **nurse.maria** - Maria Garcia (Pediatrics)
- **nurse.david** - David Lee (Surgery)
- **nurse.jennifer** - Jennifer White (Cardiology)

### 🧑‍🦱 Patient Users (8)
- **patient.alice** - Alice Cooper
- **patient.bob** - Bob Miller
- **patient.carol** - Carol Anderson
- **patient.daniel** - Daniel Thomas
- **patient.emma** - Emma Jackson
- **patient.frank** - Frank Harris
- **patient.grace** - Grace Martin
- **patient.henry** - Henry Thompson

## Default Passwords

All users have role-based passwords:
- **Admins**: `admin123`
- **Doctors**: `doctor123`
- **Nurses**: `nurse123`
- **Patients**: `patient123`

## Quick Login Credentials

### Admin Login
```
Username: admin
Password: admin123
```

### Doctor Login
```
Username: dr.sarah
Password: doctor123
```

### Nurse Login
```
Username: nurse.anna
Password: nurse123
```

### Patient Login
```
Username: patient.alice
Password: patient123
```

## Features

### Realistic Data
- ✅ Proper names and emails
- ✅ Doctor specializations
- ✅ Nurse departments
- ✅ Patient IDs (PID-YYYY-XXXXXX format)
- ✅ Phone numbers and dates of birth

### Safe Seeding
- ✅ Uses database transactions
- ✅ Clears existing non-superuser accounts
- ✅ Preserves superuser accounts
- ✅ Creates user profiles automatically

### Detailed Output
- ✅ Progress indicators
- ✅ Success confirmations
- ✅ Summary statistics
- ✅ Login credentials reference

## Usage Examples

### Initial Setup
```bash
# Run migrations first
python3 manage.py migrate

# Seed the database
python3 manage.py seed_users
```

### Re-seeding
```bash
# This will clear existing users and create fresh ones
python3 manage.py seed_users
```

### After Seeding
1. Start the server: `python3 manage.py runserver`
2. Go to: `http://localhost:8000/admin`
3. Login with any of the credentials above
4. Test the frontend at: `http://localhost:5173`

## Notes

⚠️ **Warning**: This command will delete all existing non-superuser accounts!

✅ **Safe for Development**: Superuser accounts are preserved

🔄 **Idempotent**: Can be run multiple times safely

📊 **Complete**: Creates users with full profiles and metadata

## Customization

To modify the seeder:
1. Edit: `users/management/commands/seed_users.py`
2. Add/remove users from the lists
3. Modify user attributes as needed
4. Run the command again

## Troubleshooting

### Command not found
```bash
# Make sure you're in the project directory
cd /path/to/wildheads
python3 manage.py seed_users
```

### Permission errors
```bash
# Ensure database is writable
chmod 664 db.sqlite3
```

### Import errors
```bash
# Run migrations first
python3 manage.py migrate
```

---

**Last Updated:** 2026-01-19
**Total Users Created:** 20 (2 admins + 5 doctors + 5 nurses + 8 patients)
