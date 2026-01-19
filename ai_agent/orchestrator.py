import json
import logging
import re
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

    def _strip_markdown(self, text: str) -> str:
        """
        Convert common markdown to plain text for UI safety.
        """
        if not text:
            return text
        cleaned = text
        # Remove code fences
        cleaned = re.sub(r"```[\s\S]*?```", "", cleaned)
        # Remove inline code backticks
        cleaned = cleaned.replace("`", "")
        # Replace markdown links [text](url) -> text
        cleaned = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", cleaned)
        # Remove emphasis markers
        cleaned = re.sub(r"(\*\*|__|\*|_)", "", cleaned)
        # Collapse multiple blank lines
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
        return cleaned.strip()
        
    async def patient_chat(self, user_message: str, history: list = []):
        """
        Handle patient chat with safety guards and fallback responses.
        """
        # 1. Critical Emergency Keywords (Immediate Alert)
        critical_emergency = ["suicide", "kill myself", "end my life", "want to die"]
        if any(k in user_message.lower() for k in critical_emergency):
            return ("🚨 IMMEDIATE HELP AVAILABLE\n\n"
                   "If you're experiencing a mental health crisis:\n"
                   "• National Suicide Prevention Lifeline: 988 (24/7)\n"
                   "• Crisis Text Line: Text HOME to 741741\n"
                   "• Emergency Services: 911\n\n"
                   "You don't have to face this alone. Please reach out for help right now.\n\n"
                   "This information is for general guidance only and is not a medical diagnosis.")
        
        # 2. Serious Medical Concerns (Diplomatic Response)
        serious_conditions = [
            "cancer", "tumor", "malignant", "metastasis", "chemotherapy",
            "hiv", "aids", "heart attack", "stroke", "organ failure",
            "terminal", "dying", "fatal", "life threatening"
        ]
        if any(condition in user_message.lower() for condition in serious_conditions):
            return ("I understand you have serious health concerns. These are important medical matters that require professional evaluation.\n\n"
                   "What I recommend:\n"
                   "• Speak with your doctor - They can provide proper assessment and guidance\n"
                   "• Schedule an appointment - Call us at +1 (555) 123-4567\n"
                   "• Emergency symptoms? Visit our ER or call 911\n\n"
                   "I'm not able to assess or diagnose serious medical conditions, but our medical team is here to help you. "
                   "Please don't hesitate to reach out to them directly.\n\n"
                   "This information is for general guidance only and is not a medical diagnosis.")
        
        # 3. Diagnostic Questions (Redirect to Doctor)
        diagnostic_phrases = [
            "do i have", "is this", "could this be", "am i", "is it",
            "diagnose", "what disease", "what's wrong with me"
        ]
        if any(phrase in user_message.lower() for phrase in diagnostic_phrases):
            # Check if asking about serious condition
            if any(word in user_message.lower() for word in ["cancer", "tumor", "disease", "condition", "illness"]):
                return ("I understand you're concerned about your symptoms. However, I'm not able to provide diagnoses or confirm/rule out medical conditions.\n\n"
                       "Here's what you should do:\n"
                       "• Consult your doctor - They can properly evaluate your symptoms\n"
                       "• Book an appointment - Call +1 (555) 123-4567 or use the Patient Portal\n"
                       "• Urgent symptoms? Visit our emergency department\n\n"
                       "Your health concerns deserve professional medical attention. Our doctors are here to help.\n\n"
                       "This information is for general guidance only and is not a medical diagnosis.")
        
        # 4. Chest Pain or Severe Symptoms (Emergency)
        emergency_symptoms = ["chest pain", "can't breathe", "difficulty breathing", "severe bleeding", "unconscious"]
        if any(symptom in user_message.lower() for symptom in emergency_symptoms):
            return ("🚨 THIS MAY BE A MEDICAL EMERGENCY!\n\n"
                   "Take immediate action:\n"
                   "• Call 911 or your local emergency number NOW\n"
                   "• Go to the nearest ER - Don't drive yourself\n"
                   "• Our Emergency Dept: +1 (555) 911-0000 (24/7)\n\n"
                   "Don't wait - seek emergency care immediately!\n\n"
                   "This information is for general guidance only and is not a medical diagnosis.")
        
        # 5. Check if API key is configured
        if not self.client.api_key:
            return self._get_fallback_patient_response(user_message)
            
        messages = [
            {"role": "system", "content": PATIENT_AGENT_PROMPT}
        ]
        # Append limited history
        if history:
             messages.extend(history[-6:]) 
        
        messages.append({"role": "user", "content": user_message})
        
        # Try to get AI response with retry
        for attempt in range(2):
            try:
                response = await self.client.chat_completion(messages, temperature=0.7)
                if response:
                    return self._strip_markdown(response)
            except Exception as e:
                logger.error(f"AI chat attempt {attempt + 1} failed: {e}")
                if attempt == 1:  # Last attempt
                    break
        
        # Fallback response if AI is unavailable
        return self._get_fallback_patient_response(user_message)
    
    def _get_fallback_patient_response(self, user_message: str):
        """
        Provide helpful fallback responses when AI is unavailable.
        """
        message_lower = user_message.lower()
        
        # Greetings
        if any(word in message_lower for word in ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]):
            return ("Hello! I'm your Aarogya Health Assistant. I'm here to help with general health information and guide you through our services. "
                   "How can I assist you today?\n\n"
                   "This information is for general guidance only and is not a medical diagnosis.")
        
        # Appointments
        if any(word in message_lower for word in ["appointment", "book", "schedule", "visit", "consultation"]):
            return ("I can help you with appointments! You have a few options:\n\n"
                   "📅 Online Booking: Log in to your Patient Portal and go to the Appointments section\n"
                   "📞 Call Us: +1 (555) 123-4567 (Mon-Sat, 8AM-8PM)\n"
                   "🏥 Walk-in: Visit our reception desk\n\n"
                   "Our doctors are available across multiple specialties. Would you like to know about our departments?\n\n"
                   "This information is for general guidance only and is not a medical diagnosis.")
        
        # Fever
        if any(word in message_lower for word in ["fever", "temperature", "hot", "burning"]):
            return ("Fever is your body's natural response to infection or illness. Here's what you can do:\n\n"
                   "🌡️ Monitor: Check temperature regularly (normal is 98.6°F / 37°C)\n"
                   "💧 Stay Hydrated: Drink plenty of water and fluids\n"
                   "😴 Rest: Get adequate sleep\n"
                   "💊 Medication: Over-the-counter fever reducers may help\n\n"
                   "⚠️ See a doctor if:\n"
                   "• Fever above 103°F (39.4°C)\n"
                   "• Lasts more than 3 days\n"
                   "• Accompanied by severe symptoms\n\n"
                   "This information is for general guidance only and is not a medical diagnosis.")
        
        # Cold/Cough
        if any(word in message_lower for word in ["cold", "cough", "sneeze", "runny nose", "congestion"]):
            return ("Common cold symptoms usually improve within 7-10 days. Here's how to feel better:\n\n"
                   "💧 Hydration: Drink warm fluids like tea, soup, or warm water\n"
                   "😴 Rest: Your body needs energy to fight the infection\n"
                   "🍯 Honey: Can help soothe throat irritation\n"
                   "🧴 Humidifier: Helps with congestion\n\n"
                   "⚠️ Consult a doctor if:\n"
                   "• Symptoms worsen after 7 days\n"
                   "• High fever develops\n"
                   "• Difficulty breathing\n\n"
                   "This information is for general guidance only and is not a medical diagnosis.")
        
        # Headache
        if any(word in message_lower for word in ["headache", "head pain", "migraine"]):
            return ("Headaches can have various causes. Here are some tips:\n\n"
                   "💧 Hydrate: Dehydration is a common cause\n"
                   "😴 Rest: In a quiet, dark room\n"
                   "🧊 Cold/Warm Compress: Apply to forehead or neck\n"
                   "💊 Pain Relief: Over-the-counter medications may help\n\n"
                   "⚠️ Seek immediate help if:\n"
                   "• Sudden, severe headache\n"
                   "• With fever, stiff neck, or confusion\n"
                   "• After head injury\n"
                   "• Vision changes or difficulty speaking\n\n"
                   "This information is for general guidance only and is not a medical diagnosis.")
        
        # Stomach/Digestive
        if any(word in message_lower for word in ["stomach", "pain", "nausea", "vomit", "diarrhea", "constipation"]):
            return ("Digestive issues are common. Here's general guidance:\n\n"
                   "💧 Stay Hydrated: Especially important with vomiting/diarrhea\n"
                   "🍚 Bland Diet: Rice, bananas, toast, applesauce\n"
                   "😴 Rest: Let your digestive system recover\n"
                   "🚫 Avoid: Spicy, fatty, or dairy foods temporarily\n\n"
                   "⚠️ See a doctor if:\n"
                   "• Severe or persistent pain\n"
                   "• Blood in stool or vomit\n"
                   "• Signs of dehydration\n"
                   "• Symptoms last more than 2 days\n\n"
                   "This information is for general guidance only and is not a medical diagnosis.")
        
        # Medicine/Medication
        if any(word in message_lower for word in ["medicine", "medication", "prescription", "drug", "pill"]):
            return ("For medication information:\n\n"
                   "💊 Your Prescriptions: Check the Patient Portal under 'Prescriptions'\n"
                   "👨‍⚕️ Doctor's Advice: Always follow your doctor's instructions\n"
                   "💬 Pharmacist: Our pharmacy team can answer questions\n"
                   "📞 Call: +1 (555) 123-4567 for medication queries\n\n"
                   "⚠️ Important:\n"
                   "• Never share medications\n"
                   "• Complete the full course as prescribed\n"
                   "• Report any side effects to your doctor\n\n"
                   "This information is for general guidance only and is not a medical diagnosis.")
        
        # Test Results
        if any(word in message_lower for word in ["test", "result", "lab", "report", "blood work"]):
            return ("Your test results:\n\n"
                   "📱 Patient Portal: Results are posted here when ready\n"
                   "👨‍⚕️ Doctor Review: Your doctor will discuss results with you\n"
                   "📞 Questions: Call +1 (555) 123-4567\n"
                   "⏰ Timing: Most results available within 24-48 hours\n\n"
                   "Your doctor will contact you if any urgent findings need discussion.\n\n"
                   "This information is for general guidance only and is not a medical diagnosis.")
        
        # Emergency
        if any(word in message_lower for word in ["emergency", "urgent", "serious", "911"]):
            return ("🚨 For Medical Emergencies:\n\n"
                   "📞 Call Emergency Services: 911 or your local emergency number\n"
                   "🏥 Our Emergency Dept: Open 24/7 at +1 (555) 911-0000\n\n"
                   "Go to ER immediately for:\n"
                   "• Chest pain or pressure\n"
                   "• Difficulty breathing\n"
                   "• Severe bleeding\n"
                   "• Loss of consciousness\n"
                   "• Severe allergic reaction\n\n"
                   "Don't wait - seek immediate help!\n\n"
                   "This information is for general guidance only and is not a medical diagnosis.")
        
        # Healthy Living
        if any(word in message_lower for word in ["healthy", "wellness", "fitness", "diet", "exercise"]):
            return ("Great that you're thinking about your health! Here are some tips:\n\n"
                   "🏃 Exercise: 30 minutes daily, 5 days a week\n"
                   "🥗 Nutrition: Balanced diet with fruits, vegetables, whole grains\n"
                   "💧 Hydration: 8 glasses of water daily\n"
                   "😴 Sleep: 7-9 hours per night\n"
                   "🧘 Stress Management: Meditation, yoga, or hobbies\n\n"
                   "Our wellness programs can help! Contact us to learn more.\n\n"
                   "This information is for general guidance only and is not a medical diagnosis.")
        
        # Doctors/Specialists
        if any(word in message_lower for word in ["doctor", "specialist", "physician", "cardiologist", "neurologist"]):
            return ("We have expert specialists across multiple departments:\n\n"
                   "❤️ Cardiology - Heart specialists\n"
                   "🧠 Neurology - Brain and nervous system\n"
                   "👶 Pediatrics - Children's health\n"
                   "🦴 Orthopedics - Bones and joints\n"
                   "👁️ Ophthalmology - Eye care\n"
                   "⚡ Emergency - 24/7 urgent care\n\n"
                   "To book with a specialist, call +1 (555) 123-4567 or use the Patient Portal.\n\n"
                   "This information is for general guidance only and is not a medical diagnosis.")
        
        # Default helpful response
        return ("I'm here to help with general health information! I can assist you with:\n\n"
               "📅 Appointments - Booking and scheduling\n"
               "💊 Medications - General information\n"
               "🏥 Services - Our departments and specialists\n"
               "📋 Test Results - How to access them\n"
               "🤒 Common Symptoms - General guidance\n\n"
               "What would you like to know more about?\n\n"
               "For specific medical advice, please consult with your doctor.\n\n"
               "This information is for general guidance only and is not a medical diagnosis.")

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
