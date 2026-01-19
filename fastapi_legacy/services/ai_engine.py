import json
import random

class AIEngine:
    @staticmethod
    def analyze_patient(age: int, symptoms: list[str], vitals: dict, history: dict):
        """
        Mock AI Engine to analyze patient data.
        """
        # Mock logic based on keywords
        risk_score = 0
        possible_causes = []
        future_problems = []
        recommendations = []
        
        symptoms_str = " ".join(symptoms).lower()
        
        # Simple rule-based mock AI
        if "chest pain" in symptoms_str or "shortness of breath" in symptoms_str:
            risk_score += 5
            possible_causes.append({"cause": "Myocardial Infarction", "probability": 0.85})
            possible_causes.append({"cause": "Angina", "probability": 0.60})
            future_problems.append("Heart Failure")
            recommendations.append("ECG")
            recommendations.append("Troponin Test")
            
        if vitals.get("bp_systolic", 120) > 140:
            risk_score += 3
            possible_causes.append({"cause": "Hypertension", "probability": 0.90})
            future_problems.append("Stroke")
            recommendations.append("Lifestyle changes")
            
        if vitals.get("temperature", 37.0) > 38.5:
            risk_score += 2
            possible_causes.append({"cause": "Infection", "probability": 0.70})
            recommendations.append("Blood Culture")

        if not possible_causes:
            possible_causes.append({"cause": "Viral Infection", "probability": 0.40})
            possible_causes.append({"cause": "Stress", "probability": 0.30})
            risk_score += 1

        # Determine risk level
        if risk_score >= 5:
            risk_level = "High"
        elif risk_score >= 3:
            risk_level = "Medium"
        else:
            risk_level = "Low"
            
        # Mock confidence
        confidence = round(random.uniform(0.75, 0.95), 2)
        
        return {
            "risk_level": risk_level,
            "confidence": confidence,
            "possible_causes": possible_causes,
            "risk_prediction": f"{risk_level} Risk of complications within 30 days",
            "future_problems": future_problems,
            "recommendations": recommendations,
            "analysis_metadata": {
                "model": "WildHeads-Health-v1.0",
                "timestamp": "now"
            }
        }
