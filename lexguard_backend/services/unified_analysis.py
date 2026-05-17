import os
import uuid
import json
from services.gemini_service import generate_json_response, MasterSchema
from services.openrouter_service import generate_openrouter_response

async def build_super_analysis(chunks: list[str]) -> dict:
    """
    Takes the extracted document chunks and runs a single, unified Gemini prompt
    to synthesize the entire legal analysis across all domains at once.
    Falls back to OpenRouter if Gemini fails.
    """
    try:
        prompt_path = os.path.join(os.path.dirname(__file__), '..', 'prompts', 'super_agent_prompt.txt')
        with open(prompt_path, 'r') as f:
            super_prompt = f.read()
            
        content_to_analyze = "\n\n---\n\n".join(chunks)
        
        try:
            print("[GEMINI ATTEMPT] Trying primary provider...")
            result = await generate_json_response(super_prompt, content_to_analyze, response_schema=MasterSchema)
            print("[GEMINI SUCCESS] Primary provider succeeded.")
        except Exception as e:
            print(f"[GEMINI FAILED] Error: {e}")
            print("[OPENROUTER FALLBACK] Trying secondary provider...")
            result = await generate_openrouter_response(super_prompt, content_to_analyze)
            print("[OPENROUTER SUCCESS] Secondary provider succeeded.")
            
        from utils.helpers import normalize_analysis_response
        return normalize_analysis_response(result)
    except Exception as e:
        print(f"[MOCK FALLBACK] Unified analysis failed entirely: {e}")
        raise e
