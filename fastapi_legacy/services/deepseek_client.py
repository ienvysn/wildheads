import httpx
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

class DeepSeekClient:
    BASE_URL = "https://api.deepseek.com/v1" # Assuming v1 based on typical APIs
    
    def __init__(self):
        self.api_key = settings.DEEPSEEK_API_KEY
        if not self.api_key:
            logger.warning("DeepSeek API Key is missing!")
            
    async def chat_completion(self, messages: list, temperature: float = 0.3, max_tokens: int = 1000):
        """
        Send a chat completion request to DeepSeek API.
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek-chat", # or deepseek-coder based on availability
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
