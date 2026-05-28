from dotenv import load_dotenv
load_dotenv()

import os
import json
import asyncio
import logging
from typing import Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
    using a Mixture of Agents pattern with Aggressive Fallbacks.
    """
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.groq_api_key = os.getenv("GROQ_API_KEY")

        if not self.gemini_api_key:
            logger.warning("GEMINI_API_KEY is missing. Gemini generation will fail.")
        if not self.groq_api_key:
            logger.warning("GROQ_API_KEY is missing. Groq generation will fail.")

        self.gemini_client = genai.Client(api_key=self.gemini_api_key) if genai and self.gemini_api_key else None
        self.groq_client = AsyncGroq(api_key=self.groq_api_key) if AsyncGroq and self.groq_api_key else None
        
        # Λίστα επιβίωσης: Από τα πιο σύγχρονα & γρήγορα προς τα παλαιότερα
        self.gemini_models = [
            'gemini-3.5-flash',
            'gemini-3.1-pro-preview',
            'gemini-2.5-pro',
            'gemini-2.5-flash',
            'gemini-1.5-pro',
            'gemini-1.5-flash'
        ]
        
        # Λίστα επιβίωσης για το Groq
        self.groq_models = [
            'llama3-70b-8192',
            'llama3-8b-8192',
            'mixtral-8x7b-32768'
        ]

    async def _generate_with_gemini(self, prompt: str) -> Optional[str]:
        """Σαρώνει τα μοντέλα Gemini μέχρι να βρει διαθέσιμο."""
        if not self.gemini_client:
            return None
            
        for model_name in self.gemini_models:
            try:
                logger.info(f"Initiating Gemini ({model_name})...")
                response = await self.gemini_client.aio.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.7)
                )
                if response and response.text:
                    logger.info(f"SUCCESS: Gemini ({model_name}) responded.")
                    return response.text
            except Exception as e:
                logger.warning(f"FAILED: Gemini ({model_name}) error: {e}. Trying next...")
                continue
                
        logger.error("CRITICAL: All Gemini models failed.")
        return None

    async def _generate_with_groq(self, prompt: str) -> Optional[str]:
        """Σαρώνει τα μοντέλα Groq μέχρι να βρει διαθέσιμο."""
        if not self.groq_client:
            return None
            
        for model_name in self.groq_models:
            try:
                logger.info(f"Initiating Groq ({model_name})...")
                response = await self.groq_client.chat.completions.create(
                    model=model_name,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                )
                logger.info(f"SUCCESS: Groq ({model_name}) responded.")
                return response.choices[0].message.content
            except Exception as e:
                logger.warning(f"FAILED: Groq ({model_name}) error: {e}. Trying next...")
                continue
                
        logger.error("CRITICAL: All Groq models failed.")
        return None

    async def generate_candidates(self, prompt: str) -> Dict[str, str]:
        """Παράλληλη εκτέλεση (MoA)."""
        tasks = [
            self._generate_with_gemini(prompt),
            self._generate_with_groq(prompt)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        candidates = {}
        
        if not isinstance(results[0], Exception) and results[0]:
            candidates['gemini'] = results[0]
            
        if not isinstance(results[1], Exception) and results[1]:
            candidates['groq'] = results[1]
            
        return candidates

    async def evaluate_best_report(self, candidates: Dict[str, str], original_prompt: str) -> Optional[str]:
        """Ο Κριτής (Judge) δοκιμάζει δυναμικά τα διαθέσιμα μοντέλα Gemini για να βγάλει το τελικό JSON."""
        if not candidates:
            return None
            
        if len(candidates) == 1:
            logger.info("Only 1 candidate generated. Bypassing judge.")
            return list(candidates.values())[0]

        if not self.gemini_client:
            return list(candidates.values())[0]

        judge_prompt = f"""You are the master AI Adjudicator. 
We have generated {len(candidates)} candidate Career Orientation Reports for a student based on RIASEC & HAHE scraped data.

You must choose the BEST report or synthesize the best elements of both into a final output.

Evaluation Criteria:
1. Data Accuracy: Strict matching with the provided data.
2. Empathy: Tone should be encouraging and personalized.
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
            
        # Δυναμική επιλογή κριτή
        for model_name in self.gemini_models:
            try:
                logger.info(f"Initiating Judge using ({model_name})...")
                response = await self.gemini_client.aio.models.generate_content(
                    model=model_name,
                    contents=judge_prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.1,
                    )
                )
                if response and response.text:
                    logger.info(f"SUCCESS: Judge ({model_name}) finalized report.")
                    return response.text
            except Exception as e:
                logger.warning(f"FAILED: Judge ({model_name}) error: {e}. Trying next...")
                continue
                
        logger.error("CRITICAL: All Judge models failed. Bypassing evaluation.")
        return list(candidates.values())[0]

    async def run_pipeline(self, student_data_prompt: str) -> Optional[str]:
        logger.info("Starting Multi-Model Orchestration Pipeline")
        candidates = await self.generate_candidates(student_data_prompt)
        logger.info(f"Candidates successfully generated: {len(candidates)}")
        
        final_report = await self.evaluate_best_report(candidates, student_data_prompt)
        return final_report

# ==========================================
# FASTAPI SERVER SETUP
# ==========================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000"
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = ReportOrchestrator()

class ReportRequest(BaseModel):
    student_data: str

@app.post("/api/generate-report")
async def generate_report_endpoint(request: ReportRequest):
    logger.info("Received request from React frontend")
    try:
        final_output = await orchestrator.run_pipeline(request.student_data)
        if not final_output:
            raise HTTPException(status_code=500, detail="Failed to generate AI report from any model.")
        
        # Καθαρισμός JSON (Σε περίπτωση που το AI βάλει markdown blocks)
        try:
            clean_output = final_output.strip()
            if clean_output.startswith("```json"):
                clean_output = clean_output.replace("```json", "", 1)
                clean_output = clean_output.rstrip("```").strip()
                
            json_output = json.loads(clean_output)
            return json_output
        except json.JSONDecodeError:
            logger.warning("AI output was not strict JSON. Returning raw text.")
            return {"raw_text": final_output}

    except Exception as e:
        logger.error(f"Endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))