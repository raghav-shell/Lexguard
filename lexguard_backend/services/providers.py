"""Async provider adapters. No provider response, credential, or contract is logged."""
import asyncio
import json
import logging
import os
import httpx
from config import configured
from models.schemas import ProviderAnalysis
from utils.helpers import safe_json_loads

logger = logging.getLogger("lexguard.providers")
RETRYABLE = {408, 429, 500, 502, 503, 504}


class ProviderRequestError(ValueError):
    """Carry only a safe HTTP status, never provider bodies or credentials."""

    def __init__(self, status_code: int, reason: str = "request_rejected"):
        super().__init__("Provider rejected request")
        self.status_code = status_code
        self.reason = reason


def rejection_reason(body: bytes) -> str:
    """Classify failures into fixed labels; never propagate provider error text."""
    try:
        error = json.loads(body).get("error", {})
        message = str(error.get("message", "")).lower()
        details = error.get("details", [])
        reasons = {d.get("reason") for d in details if isinstance(d, dict)} if isinstance(details, list) else set()
    except (ValueError, AttributeError, TypeError):
        return "request_rejected"
    if reasons & {"API_KEY_INVALID", "API_KEY_EXPIRED", "API_KEY_SERVICE_BLOCKED", "CONSUMER_INVALID"} or "api key not valid" in message or "api key expired" in message:
        return "invalid_credentials"
    if "schema" in message or "generation_config" in message:
        return "invalid_schema"
    if "no endpoints" in message or "not a valid model" in message or "model not found" in message:
        return "model_unavailable"
    if "credit" in message or "quota" in message or "billing" in message:
        return "quota_or_billing"
    return "request_rejected"


async def _post(client: httpx.AsyncClient, url: str, headers: dict, payload: dict) -> dict:
    for attempt in range(2):
        try:
            async with client.stream("POST", url, headers=headers, json=payload) as response:
                body = bytearray()
                async for part in response.aiter_bytes():
                    body.extend(part)
                    if len(body) > 512000:
                        raise ValueError("Provider response too large")
                response.raise_for_status()
                result = json.loads(body)
                if not isinstance(result, dict):
                    raise ValueError("Unexpected provider response")
                return result
        except httpx.HTTPStatusError as error:
            if attempt or error.response.status_code not in RETRYABLE:
                raise ProviderRequestError(error.response.status_code, rejection_reason(body)) from None
        except httpx.TransportError:
            if attempt:
                raise ValueError("Provider connection failed") from None
        await asyncio.sleep(0.5)
    raise ValueError("Provider unavailable")


async def gemini(client: httpx.AsyncClient, system: str, content: str) -> dict:
    if not configured("GEMINI_API_KEY"):
        raise ValueError("Provider not configured")
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    if not all(c.isalnum() or c in "-._" for c in model):
        raise ValueError("Invalid model name")
    result = await _post(client,
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        {"x-goog-api-key": os.environ["GEMINI_API_KEY"]},
        {"systemInstruction": {"parts": [{"text": system}]},
         "contents": [{"role": "user", "parts": [{"text": content}]}],
         "generationConfig": {"temperature": 0.1, "maxOutputTokens": 12000,
                              "responseMimeType": "application/json",
                              "responseJsonSchema": ProviderAnalysis.model_json_schema()}},
    )
    candidate = result.get("candidates", [{}])[0]
    if candidate.get("finishReason") != "STOP":
        raise ValueError("Incomplete or refused provider response")
    return safe_json_loads("".join(p.get("text", "") for p in candidate.get("content", {}).get("parts", []) if not p.get("thought")))


async def openrouter(client: httpx.AsyncClient, system: str, content: str) -> dict:
    if not configured("OPENROUTER_API_KEY"):
        raise ValueError("Provider not configured")
    result = await _post(client, "https://openrouter.ai/api/v1/chat/completions",
        {"Authorization": "Bearer " + os.environ["OPENROUTER_API_KEY"], "X-Title": "LEXGUARD"},
        {"model": os.getenv("OPENROUTER_MODEL", "anthropic/claude-sonnet-4.6"),
         "temperature": 0.1, "max_tokens": 12000,
         "response_format": {"type": "json_schema", "json_schema": {
             "name": "contract_analysis", "strict": True, "schema": ProviderAnalysis.model_json_schema()}},
         "provider": {"require_parameters": True},
         "messages": [{"role": "system", "content": system}, {"role": "user", "content": content}]},
    )
    choice = result.get("choices", [{}])[0]
    if choice.get("finish_reason") != "stop":
        raise ValueError("Incomplete or refused provider response")
    return safe_json_loads(choice["message"]["content"])
