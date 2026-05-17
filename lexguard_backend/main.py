import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables
load_dotenv(override=True)

# Import routers
from routes.analyze import router as analyze_router

app = FastAPI(
    title="LEXGUARD API",
    description="AI-powered contract risk intelligence system",
    version="1.0.0"
)

# Configure CORS for localhost and frontend deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify Vercel domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(analyze_router)

@app.get("/")
async def root():
    return {"status": "LEXGUARD backend running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
