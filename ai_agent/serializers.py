from rest_framework import serializers
from .models import AIAnalysis

class AIAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAnalysis
        fields = '__all__'

class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField()
    history = serializers.ListField(child=serializers.DictField(), required=False, default=[])

class ChatResponseSerializer(serializers.Serializer):
    reply = serializers.CharField()

class AnalyzeRequestSerializer(serializers.Serializer):
    symptoms = serializers.ListField(child=serializers.CharField())
