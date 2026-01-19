from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Doctor, Department, Patient

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'first_name', 'last_name')

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    patient_key = serializers.CharField(read_only=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    blood_group = serializers.CharField(required=False, allow_blank=True)
    contact_number = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = (
            'username',
            'email',
            'password',
            'role',
            'first_name',
            'last_name',
            'date_of_birth',
            'gender',
            'blood_group',
            'contact_number',
            'phone',
            'address',
            'patient_key',
        )
        
    def create(self, validated_data):
        date_of_birth = validated_data.pop('date_of_birth', None)
        gender = validated_data.pop('gender', None) or 'Other'
        blood_group = validated_data.pop('blood_group', None)
        contact_number = validated_data.pop('contact_number', None) or validated_data.pop('phone', None)
        address = validated_data.pop('address', "")
        role = validated_data.get('role', 'patient')
        if role == 'patient' and not validated_data.get('username'):
            # Generate a unique patient key
            import random
            from datetime import date
            year = date.today().year
            while True:
                candidate = f"PID-{year}-{random.randint(100000, 999999)}"
                if not User.objects.filter(username=candidate).exists():
                    validated_data['username'] = candidate
                    break

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=role,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        if user.role == 'patient':
            Patient.objects.create(
                user=user,
                date_of_birth=date_of_birth,
                gender=gender,
                blood_group=blood_group,
                contact_number=contact_number or "",
                address=address or "",
            )
        return user

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    class Meta:
        model = Doctor
        fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Patient
        fields = '__all__'
