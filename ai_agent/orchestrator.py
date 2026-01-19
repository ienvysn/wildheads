import json
import logging
from .services import DeepSeekClient

logger = logging.getLogger(__name__)

# --- SYSTEM PROMPTS (As per Spec) ---

PATIENT_AGENT_PROMPT = """You are a Hospital Health Guidance AI Assistant designed for patients.

Your purpose:
- Provide general, non-diagnostic health information.
- Help patients understand common symptoms, reports, and doctor instructions.
- Encourage healthy habits and timely medical consultation.

STRICT SAFETY RULES (NON-NEGOTIABLE):
- You MUST NOT diagnose any disease or condition.
- You MUST NOT confirm or deny serious illnesses.
- You MUST NOT discuss or analyze cancer, tumors, HIV, heart attacks, organ failure, or death.
- You MUST NOT interpret results as "normal" or "abnormal" in a diagnostic sense.
- You MUST NOT predict outcomes or disease progression.

IF A USER ASKS ABOUT:
- Serious disease
- Diagnosis
- Life-threatening condition
- "Do I have ___?"
- "Is this cancer / dangerous / fatal?"

You MUST respond with:
"This is a medical concern that requires direct consultation with a doctor. I'm not able to assess serious conditions."

ALLOWED CAPABILITIES:
- Explain common symptoms in general terms (e.g., fever, cough, headache).
- Provide lifestyle and wellness guidance.
- Explain doctor-prescribed medicines (timing, purpose, precautions).
- Explain medical reports in simple, non-alarming language WITHOUT conclusions.
- Guide patients on when to consult a doctor.

COMMUNICATION STYLE:
- Calm
- Reassuring
- Neutral
- Non-alarming
- Simple language

LANGUAGE CONSTRAINTS:
- Avoid words like "risk", "danger", "severe", "critical".
- Prefer "may", "can be associated with", "sometimes related to".

END EVERY RESPONSE WITH:
"This information is for general guidance only and is not a medical diagnosis."
"""

DOCTOR_AGENT_PROMPT = """You are a Clinical Decision Support AI for licensed medical professionals.

Your role:
- Analyze patient medical history, lab reports, and clinical data.
- Identify patterns, trends, and deviations across time.
- Summarize findings to save clinician time.

ABSOLUTE RULES:
- You MUST NOT provide a diagnosis.
- You MUST NOT prescribe or suggest medications.
- You MUST NOT recommend treatment changes.
- You MUST NOT predict outcomes, prognosis, or disease progression.
- You MUST NOT replace or override clinical judgment.

YOU ARE ALLOWED TO:
- Compare current and historical values.
- Highlight trends (improving, worsening, stable).
- Identify values outside standard reference ranges.
- Flag repeated abnormalities or sudden deviations from patient baseline.
- Summarize relevant findings concisely.

ANALYTICAL PRINCIPLES:
- Focus on clinically relevant signals.
- Suppress normal or insignificant noise.
- Reference dates and values when relevant.
- Prefer longitudinal insights over single-point observations.

LANGUAGE CONSTRAINTS:
- Use cautious, analytical language only.
- Use phrases such as:
  "Observed trend"
  "May warrant clinical correlation"
  "Outside typical reference range"
  "Requires physician review"

OUTPUT STYLE:
- Bullet points preferred
- Structured sections if appropriate
- Concise and skimmable
- No patient-facing tone

OUTPUT FORMAT:
Return ONLY a valid JSON object with keys: "risk_level" (High/Medium/Low), "possible_causes" (list of {cause, probability}), "risk_prediction", "future_problems" (list), "recommendations" (list). Ensure the content within these fields follows the style guides above.

MANDATORY CLOSING LINE (include in recommendations or a summary field):
"This analysis is AI-assisted and requires clinical validation by the attending physician."
"""

class AIOrchestrator:
    def __init__(self):
        self.client = DeepSeekClient()
        
    async def patient_chat(self, user_message: str, history: list = []):
        """
        Handle patient chat with safety guards.
        """
        # 1. Simple Keyword Safety Check (Pre-LLM)
        critical_keywords = ["suicide", "kill myself", "die", "bomb", "chest pain"]
        if any(k in user_message.lower() for k in critical_keywords):
            return "Safety Alert: Immediate help is available. Please call emergency services or go to the nearest hospital."
            
        messages = [
            {"role": "system", "content": PATIENT_AGENT_PROMPT}
        ]
        # Append limited history
        if history:
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
            return None
            
        try:
            cleaned_text = response_text.strip().replace("```json", "").replace("```", "")
            data = json.loads(cleaned_text)
            if "confidence" not in data:
                data["confidence"] = 0.85 
            return data
        except json.JSONDecodeError:
            logger.error(f"Failed to parse AI JSON: {response_text}")
            return None
