import os
import time
import asyncio
from services.gemini_service import generate_json_response, MasterSchema
from services.openrouter_service import generate_openrouter_response
from utils.helpers import normalize_analysis_response

async def build_super_analysis(chunks: list[str]) -> dict:
    """
    Single unified prompt analysis with provider cascade:
    Gemini 2.5 Flash → OpenRouter Claude 3.5 → Mock Fallback
    """
    prompt_path = os.path.join(os.path.dirname(__file__), '..', 'prompts', 'super_agent_prompt.txt')
    with open(prompt_path, 'r') as f:
        super_prompt = f.read()

    content_to_analyze = "\n\n---\n\n".join(chunks)

    provider_used = "unknown"
    fallback_triggered = False
    t_start = time.monotonic()

    try:
        print("[GEMINI ATTEMPT] Trying primary provider...")
        result = await generate_json_response(super_prompt, content_to_analyze, response_schema=MasterSchema)
        provider_used = "gemini"
        print("[GEMINI SUCCESS] Primary provider succeeded.")
    except Exception as e:
        print(f"[GEMINI FAILED] Error: {e}")
        print("[OPENROUTER FALLBACK] Trying secondary provider...")
        fallback_triggered = True
        result = await generate_openrouter_response(super_prompt, content_to_analyze)
        provider_used = "openrouter"
        print("[OPENROUTER SUCCESS] Secondary provider succeeded.")

    analysis_duration = round(time.monotonic() - t_start, 2)

    normalized = normalize_analysis_response(result)

    # Inject metadata for transparency / debugging
    normalized["provider_used"] = provider_used
    normalized["analysis_duration"] = analysis_duration
    normalized["fallback_triggered"] = fallback_triggered

    return normalized
