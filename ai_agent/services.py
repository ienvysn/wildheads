import httpx
import logging
from django.conf import settings
import json

logger = logging.getLogger(__name__)

class DeepSeekClient:
    BASE_URL = "https://api.deepseek.com/v1"
    
    def __init__(self):
        # We need to add DEEPSEEK_API_KEY to Django settings
        self.api_key = getattr(settings, 'DEEPSEEK_API_KEY', None)
        if not self.api_key:
            logger.warning("DeepSeek API Key is missing!")
            
    async def chat_completion(self, messages: list, temperature: float = 0.3, max_tokens: int = 1000):
        if not self.api_key:
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek-chat",
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code != 200:
                    logger.error(f"DeepSeek API Error: {response.text}")
                    return None
                    
                data = response.json()
                return data["choices"][0]["message"]["content"]
                
        except Exception as e:
            logger.error(f"Failed to connect to DeepSeek: {e}")
            return None
