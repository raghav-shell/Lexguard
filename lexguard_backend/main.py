import asyncio
import logging
import os
import time
from contextlib import asynccontextmanager
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException
from config import Settings, configured
from errors import AppError
from routes.analyze import router
from security import AdmissionControl, RequestGuard

load_dotenv(override=False)
logger = logging.getLogger("lexguard")


def create_app(settings: Settings | None = None):
    settings = settings or Settings.from_env()
    if settings.production and (len(settings.api_key) < 32 or settings.api_key.startswith("replace-")):
        raise ValueError("Production requires a random ANALYSIS_API_KEY of at least 32 characters")

    @asynccontextmanager
    async def lifespan(app):
        async with httpx.AsyncClient(timeout=httpx.Timeout(35, connect=5), limits=httpx.Limits(max_connections=12)) as client:
            app.state.http = client
            yield

    app = FastAPI(title="LEXGUARD API", version="3.0.0", lifespan=lifespan)
    app.state.settings = settings
    app.state.parser_lock = asyncio.Semaphore(1)
    app.state.admission = AdmissionControl(settings)
    origins = [url.strip().rstrip("/") for url in os.getenv("FRONTEND_URL", "").split(",") if url.strip()]
    if not settings.production:
        origins += ["http://localhost:3000", "http://127.0.0.1:3000"]
    app.add_middleware(RequestGuard, settings=settings, admission=app.state.admission)
    app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False,
                       allow_methods=["POST", "GET"], allow_headers=["Content-Type"],
                       expose_headers=["X-Request-ID", "Retry-After"])

    def error_response(request, status, code, message):
        return JSONResponse({"error": {"code": code, "message": message,
            "request_id": getattr(request.state, "request_id", "unavailable")}},
            status_code=status, headers={"Cache-Control": "no-store"})

    @app.exception_handler(AppError)
    async def app_error(request: Request, error: AppError):
        return error_response(request, error.status, error.code, error.message)

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, error: RequestValidationError):
        return error_response(request, 422, "invalid_request", "Provide one PDF or DOCX and valid review context within the displayed limits.")

    @app.exception_handler(HTTPException)
    async def http_error(request: Request, error: HTTPException):
        return error_response(request, error.status_code, "invalid_request", "This request could not be processed.")

    @app.exception_handler(Exception)
    async def unexpected_error(request: Request, error: Exception):
        logger.error("request_failed request_id=%s type=%s", getattr(request.state, "request_id", "unknown"), type(error).__name__)
        return error_response(request, 500, "internal_error", "An internal error occurred. Please retry or contact the operator with the request ID.")

    app.include_router(router)

    @app.get("/")
    async def root():
        return {"service": "LEXGUARD", "version": "3.0.0"}

    @app.get("/health")
    async def health():
        return {"status": "alive", "version": "3.0.0"}

    @app.get("/ready")
    async def ready():
        available = any(configured(key) for key in ("GEMINI_API_KEY", "OPENROUTER_API_KEY"))
        return JSONResponse({"status": "configured" if available else "not_configured",
                             "provider_connectivity": "not_probed"}, status_code=200 if available else 503)

    @app.middleware("http")
    async def request_metrics(request, call_next):
        started = time.monotonic()
        response = await call_next(request)
        logger.info("request_complete request_id=%s method=%s path=%s status=%s duration_ms=%d",
                    getattr(request.state, "request_id", "unknown"), request.method,
                    request.url.path, response.status_code, (time.monotonic() - started) * 1000)
        return response

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=os.getenv("HOST", "127.0.0.1"), port=int(os.getenv("PORT", "8000")), reload=True)
