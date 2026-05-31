import os
import json
import logging
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

# Κάνουμε import τον διαχωρισμένο Orchestrator
from ai_orchestrator import ReportOrchestrator

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
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

class ReportRequest(BaseModel):
    user_id: Optional[str] = None
    raw_scores: dict
    user_points: Optional[int] = None
    chat_history: str

@app.post("/api/generate-report")
async def generate_report_endpoint(request: ReportRequest):
    try:
        # Ανάκτηση τμημάτων (Scraped Data)
        deps_response = supabase.table("departments").select("id, name, university, base_points_last_year").execute()
        departments_context = json.dumps(deps_response.data, ensure_ascii=False)

        student_context = f"""
        RIASEC Scores: {request.raw_scores}
        User Points: {request.user_points if request.user_points else 'Not specified'}
        Chat Context: {request.chat_history}
        
        AVAILABLE DEPARTMENTS DATA (You MUST strictly use 'id' and 'name' from this list):
        {departments_context}
        """

        # Χρησιμοποιούμε τη γρήγορη μέθοδο
        final_output = await orchestrator.run_fast_pipeline(student_context)
        
        if not final_output:
            raise HTTPException(status_code=500, detail="AI generation failed.")
        
        # JSON Cleaning
        clean_output = final_output.strip()
        if clean_output.startswith("```json"):
            clean_output = clean_output.replace("```json", "", 1).rstrip("```").strip()
            
        try:
            ai_data = json.loads(clean_output)
        except json.JSONDecodeError:
            return {"raw_text": final_output}

        # Βάση Δεδομένων
        report_id = None
        if request.user_id:
            report_insert = supabase.table("riasec_reports").insert({
                "user_id": request.user_id,
                "raw_scores": request.raw_scores,
                "ai_psychometric_analysis": ai_data.get("psychometric_analysis", ""),
                "ai_actionable_step": ai_data.get("actionable_next_step", ""),
                "user_points_at_creation": request.user_points
            }).execute()
            
            report_id = report_insert.data[0]['id']

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