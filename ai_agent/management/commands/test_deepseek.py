from django.core.management.base import BaseCommand
from ai_agent.services import DeepSeekClient
import asyncio
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test DeepSeek API connection and configuration'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Testing DeepSeek API connection...'))
        
        # Run async test
        asyncio.run(self.test_api())
    
    async def test_api(self):
        client = DeepSeekClient()
        
        # Check API key
        if not client.api_key:
            self.stdout.write(self.style.ERROR('❌ DEEPSEEK_API_KEY is not configured!'))
            self.stdout.write(self.style.WARNING('Please set DEEPSEEK_API_KEY in your .env file'))
            self.stdout.write(self.style.WARNING('The system will use fallback responses until configured.'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'✓ API key found: {client.api_key[:10]}...'))
        
        # Test simple chat completion
        self.stdout.write(self.style.WARNING('\nTesting chat completion...'))
        
        test_messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'Hello, Aarogya!' if you can hear me."}
        ]
        
        try:
            response = await client.chat_completion(test_messages, temperature=0.7, max_tokens=50)
            
            if response:
                self.stdout.write(self.style.SUCCESS('✓ DeepSeek API is working!'))
                self.stdout.write(self.style.SUCCESS(f'Response: {response}'))
                self.stdout.write(self.style.SUCCESS('\n✅ All systems operational!'))
            else:
                self.stdout.write(self.style.ERROR('❌ API call failed - check logs for details'))
                self.stdout.write(self.style.WARNING('The system will use fallback responses.'))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error: {e}'))
            self.stdout.write(self.style.WARNING('The system will use fallback responses.'))
