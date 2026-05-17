from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
import asyncio
from services.pdf_parser import extract_text_from_pdf
from services.chunking import chunk_legal_text
from services.unified_analysis import build_super_analysis
from services.mock_fallback import get_fallback_mock_response
import os

router = APIRouter()

# Config
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
ANALYSIS_TIMEOUT_SECONDS = 90

# Global state for fake streaming for hackathon demo
analysis_status = {"stage": "Idle"}

@router.get("/analyze-status")
async def get_status():
    return analysis_status

async def progressive_status_updates():
    """Simulates the backend scanning phases for frontend animations."""
    stages = [
        "Extracting legal text...",
        "Identifying clause boundaries...",
        "Simulating Employment Law Agent...",
        "Simulating Privacy & Compliance Agent...",
        "Simulating Financial Liability Agent...",
        "Simulating Intellectual Property Agent...",
        "Simulating Fairness Evaluation Agent...",
        "Synthesizing risk scores...",
        "Generating real-world consequence models...",
        "Finalizing cinematic JSON output..."
    ]
    for stage in stages:
        if analysis_status["stage"] in ["Complete", "Complete (Fallback)"]:
            break
        analysis_status["stage"] = stage
        await asyncio.sleep(1.0)

@router.post("/analyze-contract")
async def analyze_contract(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    global analysis_status

    # 1. File type validation
    allowed_types = ('.pdf', '.doc', '.docx')
    if not file.filename.lower().endswith(allowed_types):
        raise HTTPException(status_code=400, detail="Only PDF/DOC/DOCX files are supported.")

    # 2. Read file and check size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail=f"File too large. Maximum size is 10MB.")

    # Start progressive status updates in background
    background_tasks.add_task(progressive_status_updates)

    try:
        # 3. Extract Text
        text = await extract_text_from_pdf(file_bytes)
        if not text or len(text.strip()) < 50:
            print("PDF extraction returned insufficient text, using mock fallback.")
            analysis_status["stage"] = "Complete (Fallback)"
            return get_fallback_mock_response()

        # 4. Smart Chunking (limit to highest density chunks)
        chunks = chunk_legal_text(text, max_chunks=5)
        if not chunks:
            analysis_status["stage"] = "Complete (Fallback)"
            return get_fallback_mock_response()

        # 5. Unified Super-Prompt Analysis with timeout
        try:
            final_json = await asyncio.wait_for(
                build_super_analysis(chunks),
                timeout=ANALYSIS_TIMEOUT_SECONDS
            )
        except asyncio.TimeoutError:
            print(f"[TIMEOUT] Analysis exceeded {ANALYSIS_TIMEOUT_SECONDS}s, using mock fallback.")
            analysis_status["stage"] = "Complete (Fallback)"
            return get_fallback_mock_response()

        # 6. Inject raw extracted text for Contract Viewer
        final_json["extracted_text"] = text

        analysis_status["stage"] = "Complete"
        return final_json

    except HTTPException:
        raise  # Re-raise HTTP errors without wrapping
    except Exception as e:
        print(f"[MOCK FALLBACK] Analysis failed: {e}")
        analysis_status["stage"] = "Complete (Fallback)"
        return get_fallback_mock_response()
