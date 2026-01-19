"""
Quick test script to verify AI chat responses
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from ai_agent.orchestrator import AIOrchestrator

async def test_responses():
    orchestrator = AIOrchestrator()
    
    test_queries = [
        "Hello!",
        "I have a headache",
        "Do I have cancer? I'm worried",
        "How do I book an appointment?",
        "I have chest pain",
    ]
    
    print("=" * 80)
    print("TESTING AI CHAT RESPONSES")
    print("=" * 80)
    
    for query in test_queries:
        print(f"\n📝 Query: {query}")
        print("-" * 80)
        response = await orchestrator.patient_chat(query)
        print(f"🤖 Response:\n{response}")
        print("=" * 80)

if __name__ == "__main__":
    asyncio.run(test_responses())
