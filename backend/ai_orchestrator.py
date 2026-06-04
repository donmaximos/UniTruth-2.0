import os
import json
import asyncio
import logging
import re  # ΠΡΟΣΘΗΚΗ: Βιβλιοθήκη για Regular Expressions
from typing import Optional

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
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.groq_api_key = os.getenv("GROQ_API_KEY")

        self.gemini_client = genai.Client(api_key=self.gemini_api_key) if genai and self.gemini_api_key else None
        self.groq_client = AsyncGroq(api_key=self.groq_api_key) if AsyncGroq and self.groq_api_key else None
        
        self.primary_groq = 'llama-3.3-70b-versatile'
        self.primary_gemini = 'gemini-2.5-pro'
        self.judge_model = 'gemini-2.5-flash'

    def _clean_json_output(self, text: str) -> str:
        """Επιθετικός καθαρισμός με Regex. Βρίσκει αυστηρά το JSON object και αγνοεί τα υπόλοιπα."""
        if not text:
            return ""
        # Ψάχνει το πρώτο '{' και το τελευταίο '}'
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return match.group(0)
        return text.strip()

    async def _fetch_groq(self, system_prompt: str, user_prompt: str) -> Optional[str]:
        if not self.groq_client: return None
        try:
            response = await self.groq_client.chat.completions.create(
                model=self.primary_groq,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2, # Χαμηλότερη θερμοκρασία για λιγότερες "πρωτοβουλίες"
                response_format={"type": "json_object"} # ΚΛΕΙΔΩΜΑ ΣΕ JSON
            )
            return response.choices[0].message.content if response.choices else None
        except Exception as e:
            logger.error(f"Groq Generator failed: {e}")
            return None

    async def _fetch_gemini(self, system_prompt: str, user_prompt: str) -> Optional[str]:
        if not self.gemini_client: return None
        try:
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = await self.gemini_client.aio.models.generate_content(
                model=self.primary_gemini, 
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json", 
                    temperature=0.2
                )
            )
            return response.text if response else None
        except Exception as e:
            logger.error(f"Gemini Generator failed: {e}")
            return None

    async def run_fast_pipeline(self, student_context: str) -> Optional[str]:
        system_instructions = """Είσαι ένας κορυφαίος Σύμβουλος Επαγγελματικού Προσανατολισμού (AI).
ΑΥΣΤΗΡΟΙ ΚΑΝΟΝΕΣ:
1. Πρέπει να επιστρέψεις ΜΟΝΟ ένα έγκυρο αντικείμενο JSON. Απαγορεύεται οποιοδήποτε άλλο κείμενο.
2. ΟΛΕΣ οι τιμές κειμένου μέσα στο JSON ΠΡΕΠΕΙ ΝΑ ΕΙΝΑΙ ΑΥΣΤΗΡΑ ΣΤΑ ΕΛΛΗΝΙΚΑ.
3. ΑΠΑΓΟΡΕΥΟΝΤΑΙ ΤΑ ΑΓΓΛΙΚΑ στις απαντήσεις.

ΑΠΑΙΤΟΥΜΕΝΗ ΔΟΜΗ JSON:
{
  "psychometric_analysis": "Αναλυτικό κείμενο αυστηρά στα Ελληνικά",
  "top_matches": [
    { "title": "Τμήμα στα Ελληνικά", "reasoning": "Αιτιολογία στα Ελληνικά", "department_id": 1 }
  ],
  "actionable_next_step": "Πρόταση στα Ελληνικά"
}"""
        
        user_input = f"STUDENT CONTEXT:\n{student_context}"

        logger.info("Initiating Parallel Generation...")
        groq_task = asyncio.create_task(self._fetch_groq(system_instructions, user_input))
        gemini_task = asyncio.create_task(self._fetch_gemini(system_instructions, user_input))
        
        results = await asyncio.gather(groq_task, gemini_task, return_exceptions=True)
        
        groq_result = results[0] if not isinstance(results[0], Exception) else None
        gemini_result = results[1] if not isinstance(results[1], Exception) else None

        final_result = None
        if groq_result and gemini_result:
            final_result = await self._evaluate_results(student_context, groq_result, gemini_result)
        elif groq_result:
            final_result = groq_result
        elif gemini_result:
            final_result = gemini_result

        return self._clean_json_output(final_result) if final_result else None

    async def _evaluate_results(self, context: str, res_a: str, res_b: str) -> Optional[str]:
        if not self.gemini_client:
            return res_a 

        judge_prompt = f"""Είσαι ένας αυστηρός Κριτής Δεδομένων (Data Judge).
Επίλεξε το καλύτερο JSON με βάση το προφίλ του μαθητή.
ΚΡΙΣΙΜΟ: Το αποτέλεσμα ΠΡΕΠΕΙ να είναι έγκυρο JSON και ΟΛΟ το κείμενο να είναι στα ΕΛΛΗΝΙΚΑ. 
Απαγορεύεται η χρήση markdown (όπως ```json). Επίστρεψε μόνο το περιεχόμενο.

Προφίλ Μαθητή: {context}

Επιλογή Α: {res_a}
Επιλογή Β: {res_b}"""

        try:
            response = await self.gemini_client.aio.models.generate_content(
                model=self.judge_model, 
                contents=judge_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json", 
                    temperature=0.0 
                )
            )
            return response.text if response else res_a
        except Exception as e:
            logger.error(f"Judge failed: {e}")
            return res_a