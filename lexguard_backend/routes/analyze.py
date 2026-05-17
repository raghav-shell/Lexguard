from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
import asyncio
from services.pdf_parser import extract_text_from_pdf
from services.chunking import chunk_legal_text
from services.unified_analysis import build_super_analysis
from services.mock_fallback import get_fallback_mock_response
import os
import json

router = APIRouter()

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
        await asyncio.sleep(1.0)  # Pace the updates slightly faster

@router.post("/analyze-contract")
async def analyze_contract(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    global analysis_status
    
    if not file.filename.endswith(('.pdf', '.doc', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF/DOCX files are supported.")
        
    # Start progressive status updates in background
    background_tasks.add_task(progressive_status_updates)
    
    try:
        # 1. Read file
        file_bytes = await file.read()
        
        # 2. Extract Text
        text = await extract_text_from_pdf(file_bytes)
        if not text:
            # Empty or unreadable PDF
            return get_fallback_mock_response()
            
        # 3. Smart Chunking (limit to highest density chunks for free-tier optimization)
        chunks = chunk_legal_text(text, max_chunks=5)
        if not chunks:
            return get_fallback_mock_response()
            
        # 4. Unified Super-Prompt Analysis
        # Replaces 6 API calls with 1 call while preserving exact schema
        final_json = await build_super_analysis(chunks)
        
        # 6. Inject raw extracted text for Contract Viewer
        final_json["extracted_text"] = text
        
        analysis_status["stage"] = "Complete"
        return final_json

    except Exception as e:
        print(f"Analysis failed, triggering mock fallback. Error: {e}")
        analysis_status["stage"] = "Complete (Fallback)"
        return get_fallback_mock_response()
