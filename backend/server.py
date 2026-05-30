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
from supabase import create_client, Client

# SDK Imports
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
    """Ο έξυπνος orchestrator με fallbacks για τα AI models."""
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.groq_api_key = os.getenv("GROQ_API_KEY")

        self.gemini_client = genai.Client(api_key=self.gemini_api_key) if genai and self.gemini_api_key else None
        self.groq_client = AsyncGroq(api_key=self.groq_api_key) if AsyncGroq and self.groq_api_key else None
        
        self.gemini_models = [
            'gemini-3.5-flash', 'gemini-3.1-pro-preview', 'gemini-2.5-pro', 
            'gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'
        ]
        self.groq_models = ['llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768']

    async def _generate_with_gemini(self, prompt: str) -> Optional[str]:
        if not self.gemini_client: return None
        for model_name in self.gemini_models:
            try:
                response = await self.gemini_client.aio.models.generate_content(
                    model=model_name, contents=prompt, config=types.GenerateContentConfig(temperature=0.7)
                )
                if response and response.text: return response.text
            except Exception:
                continue
        return None

    async def _generate_with_groq(self, prompt: str) -> Optional[str]:
        if not self.groq_client: return None
        for model_name in self.groq_models:
            try:
                response = await self.groq_client.chat.completions.create(
                    model=model_name, messages=[{"role": "user", "content": prompt}], temperature=0.7,
                )
                return response.choices[0].message.content
            except Exception:
                continue
        return None

    async def generate_candidates(self, prompt: str) -> Dict[str, str]:
        tasks = [self._generate_with_gemini(prompt), self._generate_with_groq(prompt)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        candidates = {}
        if not isinstance(results[0], Exception) and results[0]: candidates['gemini'] = results[0]
        if not isinstance(results[1], Exception) and results[1]: candidates['groq'] = results[1]
        return candidates

    async def evaluate_best_report(self, candidates: Dict[str, str], original_prompt: str) -> Optional[str]:
        if not candidates: return None
        if len(candidates) == 1: return list(candidates.values())[0]
        if not self.gemini_client: return list(candidates.values())[0]

        judge_prompt = f"""You are the master AI Adjudicator. 
Evaluate candidate Career Orientation Reports.
MUST output ONLY valid JSON matching this schema:
{{
  "psychometric_analysis": "string",
  "top_matches": [
    {{ "title": "string", "reasoning": "string", "department_id": integer }}
  ],
  "actionable_next_step": "string"
}}
Original Input Data: {original_prompt} \n\nCandidate Reports:\n"""
        for model_name, report_text in candidates.items():
            judge_prompt += f"--- CANDIDATE BY {model_name.upper()} ---\n{report_text}\n\n"
            
        for model_name in self.gemini_models:
            try:
                response = await self.gemini_client.aio.models.generate_content(
                    model=model_name, contents=judge_prompt,
                    config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.1)
                )
                if response and response.text: return response.text
            except Exception:
                continue
        return list(candidates.values())[0]

    async def run_pipeline(self, student_data_prompt: str) -> Optional[str]:
        candidates = await self.generate_candidates(student_data_prompt)
        final_report = await self.evaluate_best_report(candidates, student_data_prompt)
        return final_report

# ==========================================
# FASTAPI & SUPABASE SETUP
# ==========================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Αρχικοποίηση Supabase (Βεβαιώσου ότι το SUPABASE_KEY στο .env είναι το SERVICE_ROLE)
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    logger.error("MISSING SUPABASE CREDENTIALS IN BACKEND .ENV")
supabase: Client = create_client(supabase_url, supabase_key)

orchestrator = ReportOrchestrator()

# Σωστό Data Model
class ReportRequest(BaseModel):
    user_id: Optional[str] = None
    raw_scores: dict
    user_points: Optional[int] = None
    chat_history: str

@app.post("/api/generate-report")
async def generate_report_endpoint(request: ReportRequest):
    try:
        # Ανάκτηση τμημάτων
        deps_response = supabase.table("departments").select("id, name, university, base_points_last_year").execute()
        departments_context = json.dumps(deps_response.data, ensure_ascii=False)

        student_context = f"""
        RIASEC Scores: {request.raw_scores}
        User Points: {request.user_points if request.user_points else 'Not specified'}
        Chat Context: {request.chat_history}
        
        AVAILABLE DEPARTMENTS DATA (You MUST strictly use 'id' and 'name' from this list):
        {departments_context}
        """

        final_output = await orchestrator.run_pipeline(student_context)
        if not final_output:
            raise HTTPException(status_code=500, detail="AI generation failed.")
        
        clean_output = final_output.strip()
        if clean_output.startswith("```json"):
            clean_output = clean_output.replace("```json", "", 1).rstrip("```").strip()
            
        try:
            ai_data = json.loads(clean_output)
        except json.JSONDecodeError:
            return {"raw_text": final_output}

        report_id = None
        if request.user_id:
            # Αποθήκευση report
            report_insert = supabase.table("riasec_reports").insert({
                "user_id": request.user_id,
                "raw_scores": request.raw_scores,
                "ai_psychometric_analysis": ai_data.get("psychometric_analysis", ""),
                "ai_actionable_step": ai_data.get("actionable_next_step", ""),
                "user_points_at_creation": request.user_points
            }).execute()
            
            report_id = report_insert.data[0]['id']

            # Αποθήκευση top matches
            matches_to_insert = []
            for index, match in enumerate(ai_data.get("top_matches", [])):
                if "department_id" in match:
                    matches_to_insert.append({
                        "report_id": report_id,
                        "department_id": match["department_id"],
                        "match_rank": index + 1,
                        "ai_reasoning": match.get("reasoning", "")
                    })
            
            if matches_to_insert:
                supabase.table("report_department_matches").insert(matches_to_insert).execute()

        return {"status": "success", "report_id": report_id, "data": ai_data}

    except Exception as e:
        logger.error(f"Endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))