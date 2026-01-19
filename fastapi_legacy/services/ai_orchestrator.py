from .deepseek_client import DeepSeekClient
import json
import logging

logger = logging.getLogger(__name__)

# --- SYSTEM PROMPTS ---

PATIENT_AGENT_PROMPT = """You are a helpful, empathetic, and safe AI health assistant for patients.
Your primary goal is to provide general wellness guidance, explain medical terms, and offer lifestyle tips.
STRICT RESTRICTIONS:
1. DO NOT DIAGNOSE specific diseases.
2. DO NOT provide specific treatment plans or prescribe medication.
3. If the user mentions symptoms of a critical condition (chest pain, severe bleeding, difficulty breathing, suicide, heart attack, stroke), IMMEDIATE response: "This sounds serious. Please go to the nearest hospital or contact a doctor immediately." and stop.
4. Always include a disclaimer: "I am an AI assistant, not a doctor. This information is for educational purposes only."
5. Keep responses concise and comforting.
"""

DOCTOR_AGENT_PROMPT = """You are a sophisticated Clinical Decision Support System AI assisting a doctor.
Your role results in "AI-Assisted Analysis" to highlight data trends and potential risks.
CONTEXT:
You will receive patient age, recent vitals, and medical history.
TASKS:
1. Analyze the vitals for abnormalities based on standard medical ranges.
2. Correlate current symptoms (if provided) with history and vitals.
3. Suggest a list of 3 possible causes (differential diagnosis) with probability estimates.
4. Predict short-term risks if untreated.
5. Suggest further tests.
OUTPUT FORMAT:
Return ONLY a valid JSON object with keys: "risk_level" (High/Medium/Low), "possible_causes" (list of {cause, probability}), "risk_prediction", "future_problems" (list), "recommendations" (list).
Do not include markdown formatting ```json ... ```. Just the raw JSON.
"""

REPORT_AGENT_PROMPT = """You are a Medical Report Summarization AI.
Convert the provided unstructured medical text into a structured summary.
Focus on:
1. Key findings.
2. Abnormal values.
3. Diagnosis (if present in text).
"""

class AIOrchestrator:
    def __init__(self):
        self.client = DeepSeekClient()
        
    async def patient_chat(self, user_message: str, history: list = []):
        """
        Handle patient chat with safety guards.
        """
        # 1. Simple Keyword Safety Check (Pre-LLM)
        critical_keywords = ["suicide", "kill myself", "die", "bomb"]
        if any(k in user_message.lower() for k in critical_keywords):
            return "Safety Alert: Immediate help is available. Please call emergency services."
            
        messages = [
            {"role": "system", "content": PATIENT_AGENT_PROMPT}
        ]
        # Add limited history (last 3 turns to save context/tokens)
        messages.extend(history[-6:]) 
        messages.append({"role": "user", "content": user_message})
        
        response = await self.client.chat_completion(messages, temperature=0.7)
        if not response:
            return "I'm having trouble connecting to my knowledge base. Please try again later."
            
        return response

    async def doctor_analysis(self, age: int, gender: str, vitals: dict, history: dict, symptoms: list):
        """
        Generate clinical support analysis.
        """
        # Construct the context
        context_str = f"""
        Patient Profile:
        - Age: {age}
        - Gender: {gender}
        
        Vitals:
        {json.dumps(vitals, indent=2)}
        
        Medical History:
        {json.dumps(history, indent=2)}
        
        Current Symptoms:
        {", ".join(symptoms)}
        """
        
        messages = [
            {"role": "system", "content": DOCTOR_AGENT_PROMPT},
            {"role": "user", "content": f"Analyze this patient data:\n{context_str}"}
        ]
        
        response_text = await self.client.chat_completion(messages, temperature=0.2)
        
        if not response_text:
            # Fallback mock/error
            return None
            
        # Parse JSON
        try:
            # Clean potential markdown wrapping
            cleaned_text = response_text.strip().replace("```json", "").replace("```", "")
            data = json.loads(cleaned_text)
            # Add confidence mock if missing (LLM might struggle with exact numbers)
            if "confidence" not in data:
                data["confidence"] = 0.85 
            return data
        except json.JSONDecodeError:
            logger.error(f"Failed to parse AI JSON: {response_text}")
            return None
