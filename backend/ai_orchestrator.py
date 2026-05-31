import os
import json
import asyncio
import logging
from typing import Optional

# SDK Imports
try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

try:
    from groq import AsyncGroq
except ImportError:
    AsyncGroq = None

logger = logging.getLogger(__name__)

class ReportOrchestrator:
    """Ο έξυπνος orchestrator με έμφαση στην ΑΚΑΡΙΑΙΑ ταχύτητα (Fast Path)."""
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.groq_api_key = os.getenv("GROQ_API_KEY")

        self.gemini_client = genai.Client(api_key=self.gemini_api_key) if genai and self.gemini_api_key else None
        self.groq_client = AsyncGroq(api_key=self.groq_api_key) if AsyncGroq and self.groq_api_key else None
        
        # Μοντέλα βελτιστοποιημένα για ταχύτητα
        self.groq_models = ['llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768']
        self.gemini_models = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-1.5-flash']

    async def run_fast_pipeline(self, prompt: str) -> Optional[str]:
        """
        Εκτελεί ένα γρήγορο πέρασμα (Fast Path) χωρίς τον Κριτή.
        1. Προσπαθεί πρώτα με Groq (LPUs) για ακαριαία ταχύτητα.
        2. Αν αποτύχει, κάνει fallback σε Gemini Flash.
        """
        system_instructions = """You are a highly efficient Career Orientation AI.
MUST output ONLY valid JSON matching this schema:
{
  "psychometric_analysis": "string",
  "top_matches": [
    { "title": "string", "reasoning": "string", "department_id": integer }
  ],
  "actionable_next_step": "string"
}
"""
        full_prompt = f"{system_instructions}\n\nINPUT DATA:\n{prompt}"

        # ΠΡΟΣΠΑΘΕΙΑ 1: GROQ (Για μέγιστη ταχύτητα)
        if self.groq_client:
            for model_name in self.groq_models:
                try:
                    logger.info(f"Initiating Fast Path via Groq ({model_name})...")
                    response = await self.groq_client.chat.completions.create(
                        model=model_name,
                        messages=[{"role": "user", "content": full_prompt}],
                        temperature=0.7,
                    )
                    if response and response.choices:
                        return response.choices[0].message.content
                except Exception as e:
                    logger.warning(f"Groq {model_name} failed: {e}. Trying next...")
                    continue

        # ΠΡΟΣΠΑΘΕΙΑ 2: GEMINI FLASH (Fallback)
        if self.gemini_client:
            for model_name in self.gemini_models:
                try:
                    logger.info(f"Initiating Fast Path via Gemini ({model_name})...")
                    response = await self.gemini_client.aio.models.generate_content(
                        model=model_name, 
                        contents=full_prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json", 
                            temperature=0.7
                        )
                    )
                    if response and response.text:
                        return response.text
                except Exception as e:
                    logger.warning(f"Gemini {model_name} failed: {e}. Trying next...")
                    continue

        logger.error("CRITICAL: All models failed in Fast Pipeline.")
        return None