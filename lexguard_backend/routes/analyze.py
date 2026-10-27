import asyncio
from pathlib import Path
from fastapi import APIRouter, File, Form, Request, UploadFile
from config import Settings
from errors import AppError
from models.schemas import AnalysisResponse, ErrorResponse, ReviewContext
from services.pdf_parser import parse_document
from services.unified_analysis import build_super_analysis

router = APIRouter()


@router.post("/analyze-contract", response_model=AnalysisResponse, responses={code: {"model": ErrorResponse} for code in (400, 401, 408, 413, 415, 422, 429, 502, 503, 504)})
async def analyze_contract(request: Request, file: UploadFile = File(...),
                           reviewing_party: str = Form("Not specified", max_length=120),
                           jurisdiction: str = Form("Not specified", max_length=120),
                           contract_type: str = Form("General agreement", max_length=80)):
    settings: Settings = request.app.state.settings
    try:
        extension = Path(file.filename or "").suffix.lower()
        if extension not in (".pdf", ".docx"):
            raise AppError(415, "unsupported_format", "Only PDF and DOCX are supported. Convert legacy .doc files to DOCX or PDF first.")
        content = bytearray()
        while part := await file.read(64 * 1024):
            content.extend(part)
            if len(content) > settings.max_file_bytes:
                raise AppError(413, "file_too_large", "The maximum file size is 10 MiB.")
        if not content:
            raise AppError(422, "empty_file", "The uploaded file is empty.")
        context = ReviewContext(reviewing_party=reviewing_party.strip() or "Not specified",
                                jurisdiction=jurisdiction.strip() or "Not specified",
                                contract_type=contract_type.strip() or "General agreement")
        # Monitor the entire pipeline, including extraction, for client disconnects.
        async def work():
            try:
                await asyncio.wait_for(request.app.state.parser_lock.acquire(), timeout=10)
            except TimeoutError:
                raise AppError(429, "parser_busy", "Document processing is busy. Please retry in a moment.") from None
            try:
                document = await parse_document(bytes(content), extension, settings)
            finally:
                request.app.state.parser_lock.release()
            return await build_super_analysis(document, context, request.state.request_id,
                                               request.app.state.http, settings)
        task = asyncio.create_task(work())
        try:
            while not task.done():
                if await request.is_disconnected():
                    raise AppError(499, "request_cancelled", "The analysis request was cancelled.")
                await asyncio.sleep(0.1)
            return await task
        finally:
            if not task.done():
                task.cancel()
            await asyncio.gather(task, return_exceptions=True)
    finally:
        await file.close()
