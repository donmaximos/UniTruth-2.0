import os
import json
import asyncio
import logging
from typing import Dict, Optional

# Optional SDK imports (ensure these are installed via pip)
try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

try:
    from groq import AsyncGroq, APIError as GroqAPIError
except ImportError:
    AsyncGroq = None
    GroqAPIError = Exception

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class ReportOrchestrator:
    """
    Orchestrates multiple LLMs to generate a high-quality Career Orientation Report
    using a Mixture of Agents / LLM-as-a-Judge pattern.
    """
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.groq_api_key = os.getenv("GROQ_API_KEY")

        if not self.gemini_api_key:
            logger.warning("GEMINI_API_KEY is missing. Gemini generation will fail.")
        if not self.groq_api_key:
            logger.warning("GROQ_API_KEY is missing. Groq generation will fail.")

        # Initialize clients if libraries are available and keys provided
        self.gemini_client = genai.Client(api_key=self.gemini_api_key) if genai and self.gemini_api_key else None
        self.groq_client = AsyncGroq(api_key=self.groq_api_key) if AsyncGroq and self.groq_api_key else None

    async def _generate_with_gemini(self, prompt: str) -> Optional[str]:
        """Calls Google Gemini API asynchronously using the new google-genai SDK."""
        if not self.gemini_client:
            return None
        try:
            logger.info("Initiating Gemini 1.5 Pro candidate generation...")
            response = await self.gemini_client.aio.models.generate_content(
                model='gemini-1.5-pro',
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.7)
            )
            return response.text
        except Exception as e:
            # Fallback Mechanism: Catch HTTP 429 and other connection issues
            logger.error(f"Gemini API generation failed (Exception ignored): {e}")
            return None

    async def _generate_with_groq(self, prompt: str) -> Optional[str]:
        """Calls Groq API asynchronously (serving Llama 3 70B)."""
        if not self.groq_client:
            return None
        try:
            logger.info("Initiating Groq (Llama 3) candidate generation...")
            response = await self.groq_client.chat.completions.create(
                model="llama3-70b-8192",  # Llama 3 70B on Groq
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
            )
            return response.choices[0].message.content
        except GroqAPIError as e:
            # Fallback Mechanism: Catch 429 rate limits or 503 service unavailable
            logger.error(f"Groq API generation failed (Rate limit / API Error ignored): {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error calling Groq (Exception ignored): {e}")
            return None

    async def generate_candidates(self, prompt: str) -> Dict[str, str]:
        """
        Step 1: Parallel Generation.
        Sends the exact same prompt to both Gemini and Llama simultaneously.
        """
        tasks = [
            self._generate_with_gemini(prompt),
            self._generate_with_groq(prompt)
        ]
        
        # Using asyncio.gather to dispatch concurrent API calls to prevent blocking and massive latency.
        # return_exceptions=True ensures one failing request won't crash the entire Gathering task.
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        candidates = {}
        
        gemini_result = results[0]
        if not isinstance(gemini_result, Exception) and gemini_result:
            candidates['gemini'] = gemini_result
            
        groq_result = results[1]
        if not isinstance(groq_result, Exception) and groq_result:
            candidates['llama3'] = groq_result
            
        return candidates

    async def evaluate_best_report(self, candidates: Dict[str, str], original_prompt: str) -> Optional[str]:
        """
        Step 3: The Judge.
        Uses Gemini 1.5 Pro to evaluate candidate reports based on predefined criteria.
        """
        if not candidates:
            logger.error("No candidates generated successfully. Evaluation aborted.")
            return None
            
        # Step 2 logic continued: Proceed with whichever models succeeded
        if len(candidates) == 1:
            logger.info("Only 1 candidate successfully generated. Bypassing judge and returning.")
            return list(candidates.values())[0]

        if not self.gemini_client:
            logger.warning("Gemini Client not available for Judging phase. Returning first candidate.")
            return list(candidates.values())[0]

        # The strict system prompt for the Judge model
        judge_prompt = f"""You are the master AI Adjudicator. 
We have generated {len(candidates)} candidate Career Orientation Reports for a student based on RIASEC & HAHE scraped data.

You must choose the BEST report or synthesize the best elements of both into a final output.

Evaluation Criteria:
1. Data Accuracy: Strict matching with the provided data in the original prompt.
2. Empathy: Tone should be encouraging and personalized to the student.
3. Formatting: MUST output ONLY valid JSON matching this schema:
{{
  "psychometric_analysis": "string",
  "top_matches": [
    {{ "title": "string", "reasoning": "string" }}
  ],
  "actionable_next_step": "string"
}}

Original Input Data:
---
{original_prompt}
---

Candidate Reports:
"""
        for model_name, report_text in candidates.items():
            judge_prompt += f"\n\n--- CANDIDATE BY {model_name.upper()} ---\n{report_text}\n"
            
        try:
            logger.info("Initiating Judge evaluation (Gemini 1.5 Pro)...")
            # Step 4: Output Enforcement (requesting application/json mime type)
            response = await self.gemini_client.aio.models.generate_content(
                model='gemini-1.5-pro',
                contents=judge_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,  # Low temperature for analytical consistency as a Judge
                )
            )
            return response.text
        except Exception as e:
            logger.error(f"Judge evaluation failed: {e}. Falling back to first available candidate.")
            return list(candidates.values())[0]

    async def run_pipeline(self, student_data_prompt: str) -> Optional[str]:
        """Entry point that connects generation and evaluation phases."""
        logger.info("Starting Multi-Model Orchestration Pipeline")
        candidates = await self.generate_candidates(student_data_prompt)
        logger.info(f"Candidates generated: {len(candidates)}")
        
        final_report = await self.evaluate_best_report(candidates, student_data_prompt)
        return final_report

# Example Entry Point
async def main():
    # Setup your environment variables before running
    # os.environ["GEMINI_API_KEY"] = "your_key..."
    # os.environ["GROQ_API_KEY"] = "your_key..."
    
    orchestrator = ReportOrchestrator()
    dummy_input = "Profile: High investigative (I) and realistic (R) scores. HAHE Data shows high demand for Data Science and Robotics engineering."
    
    final_output = await orchestrator.run_pipeline(dummy_input)
    print("\n--- FINAL CHOSEN REPORT (JSON) ---")
    print(final_output)

if __name__ == "__main__":
    asyncio.run(main())
