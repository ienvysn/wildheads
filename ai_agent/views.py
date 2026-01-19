from rest_framework import views, permissions, status
from rest_framework.response import Response
from .serializers import ChatRequestSerializer, ChatResponseSerializer, AnalyzeRequestSerializer, AIAnalysisSerializer
from .orchestrator import AIOrchestrator
from .models import AIAnalysis
from users.models import Patient
import json
from asgiref.sync import async_to_sync

class PatientChatView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        if serializer.is_valid():
            orchestrator = AIOrchestrator()
            # Sync wrapper for async orchestration
            response_text = async_to_sync(orchestrator.patient_chat)(
                user_message=serializer.validated_data['message'],
                history=serializer.validated_data.get('history', [])
            )
            return Response({"reply": response_text})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DoctorAnalyzeView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request, patient_id):
        # Only doctors allowed
        if request.user.role != 'doctor':
             return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
             
        serializer = AnalyzeRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response({"detail": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Gather Data
        # Age
        import datetime
        today = datetime.date.today()
        dob = patient.date_of_birth
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day)) if dob else 0
        
        # Vitals (Latest)
        latest_vitals = patient.vitals.first() # Ordered by -recorded_at
        vitals_dict = {}
        if latest_vitals:
            vitals_dict = {
                "bp_systolic": latest_vitals.bp_systolic,
                "bp_diastolic": latest_vitals.bp_diastolic,
                "heart_rate": latest_vitals.heart_rate,
                "temperature": latest_vitals.temperature,
                "oxygen_level": latest_vitals.oxygen_level
            }
            
        # History
        history_dict = {}
        if hasattr(patient, 'medical_history'):
            history_dict = {
                "chronic_conditions": patient.medical_history.chronic_conditions,
                "past_surgeries": patient.medical_history.past_surgeries
            }

        orchestrator = AIOrchestrator()
        ai_result = async_to_sync(orchestrator.doctor_analysis)(
            age=age,
            gender=patient.gender,
            vitals=vitals_dict,
            history=history_dict,
            symptoms=serializer.validated_data['symptoms']
        )
        
        if not ai_result:
            return Response({"detail": "AI Analysis Failed"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        # Save
        analysis = AIAnalysis.objects.create(
            patient=patient,
            risk_level=ai_result.get("risk_level", "Unknown"),
            confidence_score=ai_result.get("confidence", 0.0),
            possible_causes=ai_result.get("possible_causes", []),
            risk_prediction=ai_result.get("risk_prediction", ""),
            future_problems=ai_result.get("future_problems", []),
            recommendations=ai_result.get("recommendations", [])
        )
        
        return Response(AIAnalysisSerializer(analysis).data)
