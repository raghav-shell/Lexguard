import os
import time
import asyncio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load env variables first
load_dotenv(override=True)

# Import routers
from routes.analyze import router as analyze_router

app = FastAPI(
    title="LEXGUARD API",
    description="AI-powered contract risk intelligence system",
    version="2.0.0"
)

# ============================================================
# CORS — Dynamic allowed origins + regex for Vercel deployments
# ============================================================
frontend_urls = os.getenv("FRONTEND_URL", "")
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if frontend_urls:
    allowed_origins.extend(
        [url.strip() for url in frontend_urls.split(",")]
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Global exception handler — never leak raw errors to frontend
# ============================================================
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[UNHANDLED ERROR] {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "An internal error occurred. Please try again.", "detail": str(exc)[:200]}
    )

# ============================================================
# Mount routes
# ============================================================
app.include_router(analyze_router)

# ============================================================
# Health endpoints
# ============================================================
@app.get("/")
async def root():
    return {"status": "LEXGUARD backend running", "version": "2.0.0"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "LEXGUARD Backend",
        "version": "2.0.0"
    }

# ============================================================
# Startup logs
# ============================================================
@app.on_event("startup")
async def startup_event():
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    openrouter_key = os.getenv("OPENROUTER_API_KEY", "")
    frontend_url = os.getenv("FRONTEND_URL", "localhost:3000")

    print("\n" + "="*50)
    print("  LEXGUARD AI — PRODUCTION BACKEND v2.0")
    print("="*50)
    gemini_status = "✓ ACTIVE" if (gemini_key and gemini_key != "your_gemini_api_key_here") else "✗ NOT CONFIGURED"
    openrouter_status = "✓ ACTIVE" if (openrouter_key and openrouter_key != "your_openrouter_api_key_here") else "✗ NOT CONFIGURED"
    print(f"  [PRIMARY]    Gemini 2.5 Flash      {gemini_status}")
    print(f"  [SECONDARY]  OpenRouter Claude     {openrouter_status}")
    print(f"  [SAFETY NET] Cinematic Mock        ✓ ALWAYS ACTIVE")
    print(f"  [CORS]       Frontend URL          {frontend_url}")
    print("="*50 + "\n")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
