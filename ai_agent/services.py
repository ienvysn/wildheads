import httpx
import logging
from django.conf import settings
import json
import asyncio

logger = logging.getLogger(__name__)

class DeepSeekClient:
    BASE_URL = "https://api.deepseek.com/v1"
    
    def __init__(self):
        # We need to add DEEPSEEK_API_KEY to Django settings
        self.api_key = getattr(settings, 'DEEPSEEK_API_KEY', None)
        if not self.api_key:
            logger.warning("DeepSeek API Key is missing! AI features will use fallback responses.")
        else:
            logger.info("DeepSeek API client initialized successfully")
            
    async def chat_completion(self, messages: list, temperature: float = 0.3, max_tokens: int = 1000, retry_count: int = 2):
        """
        Send chat completion request to DeepSeek API with retry logic.
        
        Args:
            messages: List of message dictionaries
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens in response
            retry_count: Number of retries on failure
            
        Returns:
            str: AI response text or None on failure
        """
        if not self.api_key:
            logger.error("Cannot make API call: API key not configured")
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
        
        for attempt in range(retry_count):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    logger.info(f"Sending request to DeepSeek API (attempt {attempt + 1}/{retry_count})")
                    response = await client.post(
                        f"{self.BASE_URL}/chat/completions",
                        headers=headers,
                        json=payload
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        content = data["choices"][0]["message"]["content"]
                        logger.info(f"Successfully received response from DeepSeek API ({len(content)} chars)")
                        return content
                    elif response.status_code == 401:
                        logger.error("DeepSeek API authentication failed: Invalid API key")
                        return None  # Don't retry on auth errors
                    elif response.status_code == 429:
                        logger.warning(f"DeepSeek API rate limit exceeded, retrying in {2 ** attempt}s...")
                        await asyncio.sleep(2 ** attempt)  # Exponential backoff
                    else:
                        logger.error(f"DeepSeek API Error {response.status_code}: {response.text}")
                        if attempt < retry_count - 1:
                            await asyncio.sleep(1)
                        
            except httpx.TimeoutException:
                logger.error(f"DeepSeek API timeout (attempt {attempt + 1}/{retry_count})")
                if attempt < retry_count - 1:
                    await asyncio.sleep(1)
            except httpx.ConnectError as e:
                logger.error(f"Failed to connect to DeepSeek API: {e}")
                if attempt < retry_count - 1:
                    await asyncio.sleep(2)
            except Exception as e:
                logger.error(f"Unexpected error calling DeepSeek API: {type(e).__name__}: {e}")
                if attempt < retry_count - 1:
                    await asyncio.sleep(1)
        
        logger.error("All DeepSeek API attempts failed")
        return None
