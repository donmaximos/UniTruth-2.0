from supabase import create_client, Client

# Αρχικοποίηση Supabase Client (πρόσθεσέ το κάτω από τα άλλα imports)
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# Ενημερωμένο Μοντέλο Εισόδου από το React
class ReportRequest(BaseModel):
    user_id: str
    raw_scores: dict
    user_points: Optional[int] = None
    chat_history: str

@app.post("/api/generate-report")
async def generate_report_endpoint(request: ReportRequest):
    try:
        # 1. Ανάκτηση Σκληρών Δεδομένων (Αποφυγή Data Drift)
        # Τραβάμε τα τμήματα από τη βάση για να τα δώσουμε στο AI ως context
        deps_response = supabase.table("departments").select("id, name, university, base_points_last_year").execute()
        departments_context = json.dumps(deps_response.data, ensure_ascii=False)

        # 2. Κατασκευή Δυναμικού Prompt
        student_context = f"""
        RIASEC Scores: {request.raw_scores}
        User Points: {request.user_points if request.user_points else 'Not specified'}
        Chat Context: {request.chat_history}
        
        AVAILABLE DEPARTMENTS DATA (You MUST strictly use 'id' and 'name' from this list):
        {departments_context}
        """

        # 3. Εκτέλεση MoA Pipeline (Ο υπάρχων κώδικάς σου)
        final_output = await orchestrator.run_pipeline(student_context)
        
        if not final_output:
            raise HTTPException(status_code=500, detail="AI generation failed.")
        
        # Καθαρισμός και Parse του JSON
        clean_output = final_output.strip()
        if clean_output.startswith("```json"):
            clean_output = clean_output.replace("```json", "", 1).rstrip("```").strip()
        
        ai_data = json.loads(clean_output)

        # 4. Αποθήκευση στη Βάση Δεδομένων (Transactions Logic)
        # Α. Δημιουργία του Report
        report_insert = supabase.table("riasec_reports").insert({
            "user_id": request.user_id,
            "raw_scores": request.raw_scores,
            "ai_psychometric_analysis": ai_data.get("psychometric_analysis", ""),
            "ai_actionable_step": ai_data.get("actionable_next_step", ""),
            "user_points_at_creation": request.user_points
        }).execute()
        
        new_report_id = report_insert.data[0]['id']

        # Β. Αποθήκευση των Matches στον Junction Table
        matches_to_insert = []
        for index, match in enumerate(ai_data.get("top_matches", [])):
            # Απαιτούμε από το AI να επιστρέφει το department_id βάσει του context που του δώσαμε
            if "department_id" in match:
                matches_to_insert.append({
                    "report_id": new_report_id,
                    "department_id": match["department_id"],
                    "match_rank": index + 1,
                    "ai_reasoning": match.get("reasoning", "")
                })
        
        if matches_to_insert:
            supabase.table("report_department_matches").insert(matches_to_insert).execute()

        # 5. Επιστροφή δεδομένων στο React
        return {
            "status": "success",
            "report_id": new_report_id,
            "data": ai_data
        }

    except Exception as e:
        logger.error(f"Endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))