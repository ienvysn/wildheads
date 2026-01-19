from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.models import update_last_login
from rest_framework_simplejwt.settings import api_settings

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that accepts both username and email for login
    """
    username_field = 'username_or_email'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Replace username field with username_or_email
        if 'username' in self.fields:
            self.fields.pop('username')
        self.fields[self.username_field] = serializers.CharField()
        self.fields['password'] = serializers.CharField(write_only=True)
        
    def validate(self, attrs):
        username_or_email = (attrs.get('username_or_email') or attrs.get('username') or '').strip()
        password = attrs.get('password')
        if not username_or_email or not password:
            raise serializers.ValidationError('Username/email and password are required.')
        
        # Try to find user by email or username
        user = None
        if '@' in username_or_email:
            # Looks like an email
            user = User.objects.filter(email__iexact=username_or_email).first()
        
        if not user:
            # Try username
            user = User.objects.filter(username__iexact=username_or_email).first()
        
        if not user:
            raise serializers.ValidationError('No account found with this username or email.')
        
        # Authenticate with username (Django's authenticate requires username)
        request = self.context.get('request')
        user = authenticate(request=request, username=user.username, password=password)
        
        if not user:
            raise serializers.ValidationError('Incorrect password.')
        
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')
        
        # Generate tokens
        refresh = self.get_token(user)
        
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        
        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, user)
        
        return data
