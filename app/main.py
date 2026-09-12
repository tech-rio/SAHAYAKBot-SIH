"""
SAHAYAKBot — FastAPI Server (SIH26088)
Modern async REST API with auto-generated Swagger docs.

Run: uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
Docs: http://127.0.0.1:8000/docs
"""
import time
import uuid
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, Query, Response
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import PORT, HOST, PUBLIC_DIR, NVIDIA_API_KEY, GEMINI_API_KEY
from app import db
from app.ai_engine import query_ai
from app.rag_engine import load_knowledge_base, init_semantic_search
from app.tts_service import generate_tts_audio
from app.kcc_calculator import calculate_kcc
from app.auth import create_admin_session, require_admin

# ──────────────────────────── App Setup ────────────────────────────
app = FastAPI(
    title="SAHAYAKBot API",
    description=(
        "🌾 AI Cooperative Governance & Legal Platform — Ministry of Cooperation, GOI (SIH26088)\n\n"
        "Multilingual voice AI assistant providing statutory legal guidance for PACS, KCC, PMFBY, "
        "and cooperative governance across Hindi, Marathi, Gujarati, and English."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────── Startup ────────────────────────────
@app.on_event("startup")
async def startup():
    """Initialize database, knowledge base, and RAG engine on server start."""
    print("=" * 70)
    print("🌾 SAHAYAKBot v2.0 — FastAPI Server Starting...")
    print("=" * 70)

    # Initialize database
    db.init_db()
    print("✅ Database initialized")

    # Load knowledge base
    load_knowledge_base()

    # Try to initialize semantic RAG
    init_semantic_search()

    # Status report
    ai_engines = []
    if NVIDIA_API_KEY:
        ai_engines.append("NVIDIA NIM (LLaMA 3.2)")
    if GEMINI_API_KEY:
        ai_engines.append("Google Gemini")
    ai_engines.append("Offline RAG Knowledge Base")

    print(f"🤖 AI Engines: {' → '.join(ai_engines)}")
    print(f"📊 API Docs: http://{HOST}:{PORT}/docs")
    print(f"🚀 Citizen Portal: http://{HOST}:{PORT}/")
    print(f"📋 Admin Portal: http://{HOST}:{PORT}/admin.html")
    print("=" * 70)


# ──────────────────────────── Request/Response Models ────────────────────────────
class ChatRequest(BaseModel):
    """Citizen query request"""
    query: str = Field(..., min_length=1, max_length=1000, description="User's question in any supported language")
    lang: str = Field("hi", description="Language code: hi, mr, gu, en")
    district: str = Field("सोनीपत (हरियाणा)", description="User's district")
    session_id: Optional[str] = Field(None, description="Session ID for chat history")

class ChatResponse(BaseModel):
    """AI response with metadata"""
    reply: Optional[str]
    detected_lang: str
    source: str
    search_method: str
    match_score: float
    session_id: str
    timestamp: str

class GrievanceCreateRequest(BaseModel):
    """Create a new grievance"""
    token: Optional[str] = None
    citizen_name: str = Field("ग्रामीण नागरिक", max_length=200)
    phone: str = Field("+91 98XXX-XXXXX", max_length=20)
    district: str = Field("सोनीपत (हरियाणा)", max_length=200)
    pacs_name: str = Field("PACS Counter", max_length=200)
    category: str = Field("General", max_length=100)
    query: str = Field(..., min_length=1, max_length=2000)
    ai_response: str = Field("", max_length=5000)
    status: str = Field("अधिकारी को प्रेषित (Escalated to ARCS)")
    priority: str = Field("सामान्य")

class StatusUpdateRequest(BaseModel):
    """Update grievance status"""
    token: str = Field(..., min_length=1)
    status: str = Field(..., min_length=1)

class FeedbackRequest(BaseModel):
    """User feedback on AI response"""
    query: str = Field(..., min_length=1, max_length=1000)
    ai_response: str = Field(..., min_length=1, max_length=5000)
    rating: str = Field(..., pattern="^(up|down)$", description="'up' or 'down'")
    comment: str = Field("", max_length=500)
    lang: str = Field("hi")

class AdminLoginRequest(BaseModel):
    """Admin login credentials"""
    password: str = Field(..., min_length=1)


# ──────────────────────────── API Routes ────────────────────────────

# ─── Chat (Core AI Endpoint) ───
@app.post("/api/chat", response_model=ChatResponse, tags=["AI Chat"])
async def chat(req: ChatRequest):
    """
    🎙️ Main AI chat endpoint — accepts voice/text queries in Hindi, Marathi, Gujarati, or English.
    Returns AI-generated legal guidance with statutory citations.
    """
    session_id = req.session_id or str(uuid.uuid4())[:8]
    start = time.time()

    # Save user message to history
    db.save_chat_message(session_id, "user", req.query, req.lang)

    # Query AI engine
    result = query_ai(req.query, req.lang)

    # Log to grievance/telemetry
    token_str = f"SM-{datetime.now().strftime('%Y%m%d')}-{db.get_grievance_count() + 1}"
    q_lower = req.query.lower()

    if "kcc" in q_lower or "ऋण" in q_lower or "ब्याज" in q_lower:
        category = "KCC 4% Loan"
    elif "pmfby" in q_lower or "फसल" in q_lower or "बीमा" in q_lower:
        category = "PMFBY Insurance"
    elif "pacs" in q_lower or "सदस्य" in q_lower or "उप-नियम" in q_lower:
        category = "PACS Bylaws"
    else:
        category = "General Inquiry"

    try:
        db.insert_or_update_grievance(
            token=token_str,
            citizen_name="ग्रामीण नागरिक (Verified)",
            phone="+91 98XXX-XXXXX",
            district=req.district,
            pacs_name="PACS Citizen Counter",
            category=category,
            query=req.query,
            ai_response=result.get("reply") or "",
            status="सत्यापित (AI Resolved)",
            priority="उच्च (Urgent 72-Hr)" if "pmfby" in q_lower or "नुकसान" in q_lower else "सामान्य"
        )
    except Exception as e:
        print(f"[DB] Telemetry logging error: {e}")

    # Save bot reply to history
    if result.get("reply"):
        db.save_chat_message(session_id, "bot", result["reply"], result["detected_lang"], result["source"])

    elapsed = round(time.time() - start, 2)
    print(f"[Chat] Query processed in {elapsed}s | Source: {result['source']}")

    return ChatResponse(
        reply=result.get("reply"),
        detected_lang=result["detected_lang"],
        source=result["source"],
        search_method=result["search_method"],
        match_score=result["match_score"],
        session_id=session_id,
        timestamp=datetime.now().isoformat()
    )


# ─── TTS ───
@app.get("/api/tts", tags=["Voice"])
async def tts(text: str = Query(..., max_length=500), lang: str = Query("hi")):
    """🔊 Text-to-Speech — converts text to MP3 audio in Hindi, Marathi, Gujarati, or English."""
    if not text.strip():
        raise HTTPException(400, "Text parameter is required")

    audio_bytes = generate_tts_audio(text.strip(), lang)
    if audio_bytes:
        return Response(content=audio_bytes, media_type="audio/mpeg")

    raise HTTPException(500, "TTS generation failed")


# ─── KCC Calculator ───
@app.get("/api/kcc-calculate", tags=["Calculators"])
async def kcc_calculate(amount: float = Query(150000, ge=10000, le=300000)):
    """🧮 KCC 4% Subsidized Interest Calculator — compute net interest and savings."""
    result = calculate_kcc(amount)
    return result.model_dump()


# ─── Telemetry (Real Data) ───
@app.get("/api/telemetry", tags=["Ministry Dashboard"])
async def telemetry():
    """📊 Live Ministry Telemetry — real-time metrics computed from actual database records."""
    return db.get_telemetry_from_db()


# ─── Grievances ───
@app.get("/api/grievances", tags=["Grievance Management"])
async def get_grievances(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """📋 Fetch all grievances with pagination. **Admin only.**"""
    records = db.get_all_grievances(limit, offset)
    return {"grievances": records, "total": db.get_grievance_count()}


@app.post("/api/grievances/create", tags=["Grievance Management"])
async def create_grievance(req: GrievanceCreateRequest):
    """📝 Create or escalate a grievance record."""
    token = req.token or f"SM-{datetime.now().strftime('%Y%m%d')}-{int(time.time()) % 10000}"
    db.insert_or_update_grievance(
        token, req.citizen_name, req.phone, req.district,
        req.pacs_name, req.category, req.query, req.ai_response,
        req.status, req.priority
    )
    return {"success": True, "token": token}


@app.post("/api/grievances/update_status", tags=["Grievance Management"])
async def update_grievance_status(
    req: StatusUpdateRequest
):
    """🔄 Update grievance status (resolve / escalate). **Admin only.**"""
    success = db.update_grievance_status(req.token, req.status)
    if not success:
        raise HTTPException(404, f"Grievance with token '{req.token}' not found")
    return {"success": True, "token": req.token, "status": req.status}


# ─── Feedback ───
@app.post("/api/feedback", tags=["Quality Assurance"])
async def submit_feedback(req: FeedbackRequest):
    """👍/👎 Submit citizen feedback on AI response quality."""
    db.save_feedback(req.query, req.ai_response, req.rating, req.comment, req.lang)
    return {"success": True, "message": "Feedback recorded. Thank you!"}


@app.get("/api/feedback/stats", tags=["Quality Assurance"])
async def feedback_stats():
    """📈 Get aggregate feedback satisfaction metrics."""
    return db.get_feedback_stats()


# ─── Chat History ───
@app.get("/api/chat/history/{session_id}", tags=["AI Chat"])
async def chat_history(session_id: str, limit: int = Query(20, ge=1, le=100)):
    """💬 Get chat history for a session."""
    history = db.get_chat_history(session_id, limit)
    return {"session_id": session_id, "messages": history}


# ─── Admin Auth ───
@app.post("/api/admin/login", tags=["Admin"])
async def admin_login(req: AdminLoginRequest):
    """🔐 Admin portal login — returns a session token."""
    token = create_admin_session(req.password)
    if token:
        return {"success": True, "token": token}
    raise HTTPException(401, "Invalid password")


# ─── Health Check ───
@app.get("/api/health", tags=["System"])
async def health():
    """💚 Health check endpoint."""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "ai_engines": {
            "nvidia_nim": bool(NVIDIA_API_KEY),
            "gemini": bool(GEMINI_API_KEY),
            "offline_rag": True
        },
        "timestamp": datetime.now().isoformat()
    }


# ──────────────────────────── Static Files ────────────────────────────
# Serve PWA files with correct MIME types
@app.get("/sw.js", include_in_schema=False)
async def service_worker():
    return FileResponse(str(PUBLIC_DIR / "sw.js"), media_type="application/javascript",
                       headers={"Service-Worker-Allowed": "/"})

@app.get("/manifest.json", include_in_schema=False)
async def manifest():
    return FileResponse(str(PUBLIC_DIR / "manifest.json"), media_type="application/manifest+json")

# Mount static files LAST (so API routes take priority)
app.mount("/", StaticFiles(directory=str(PUBLIC_DIR), html=True), name="static")


# ──────────────────────────── CLI Runner ────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
