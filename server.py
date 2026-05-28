import json
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.ai_orchestrator import ReportOrchestrator


class ReportRequest(BaseModel):
    student_data: Dict[str, Any]
    market_data: Dict[str, Any]


app = FastAPI(title="UniTruth Report API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)


def build_prompt(student_data: Dict[str, Any], market_data: Dict[str, Any]) -> str:
    return (
        "Generate a career orientation report for a student using the provided data. "
        "Only return valid JSON matching the expected schema.\n\n"
        "Student Data:\n"
        f"{json.dumps(student_data, indent=2)}\n\n"
        "Market Data:\n"
        f"{json.dumps(market_data, indent=2)}\n\n"
        "Expected JSON schema:\n"
        "{\n"
        "  \"psychometric_analysis\": \"string\",\n"
        "  \"top_matches\": [\n"
        "    { \"title\": \"string\", \"reasoning\": \"string\" }\n"
        "  ],\n"
        "  \"actionable_next_step\": \"string\"\n"
        "}\n"
    )


@app.post("/api/generate-report")
async def generate_report(request: ReportRequest):
    prompt = build_prompt(request.student_data, request.market_data)
    orchestrator = ReportOrchestrator()
    final_report_text = await orchestrator.run_pipeline(prompt)

    if not final_report_text:
        raise HTTPException(status_code=500, detail="Report generation failed.")

    try:
        final_report = json.loads(final_report_text)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Report generation returned invalid JSON. Check the model output.",
        )

    return final_report
