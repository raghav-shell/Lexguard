import os
import json
import google.generativeai as genai
from utils.helpers import clean_json_response, safe_json_loads
import typing_extensions as typing

class ClauseSchema(typing.TypedDict):
    category: str
    text: str
    risk_level: str
    explanation: str
    confidence_score: int
    affected_party: str
    negotiation_tip: str
    real_world_impact: str

class RiskBreakdownSchema(typing.TypedDict):
    employment: int
    privacy: int
    financial: int
    ip: int
    fairness: int

class MasterSchema(typing.TypedDict):
    overall_risk_score: int
    fairness_score: int
    overall_verdict: str
    summary: str
    top_concerns: list[str]
    risk_breakdown: RiskBreakdownSchema
    clauses: list[ClauseSchema]

async def generate_json_response(prompt: str, content: str, response_schema=None) -> dict | list:
    """
    Calls Gemini API with the given prompt and content, forcing JSON output.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise ValueError("Valid GEMINI_API_KEY not found.")
        
    genai.configure(api_key=api_key)
    
    # Use gemini-2.5-flash for speed and reliability
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    full_prompt = f"{prompt}\n\nCONTENT TO ANALYZE:\n{content}\n\nOUTPUT STRICT JSON ONLY:"
    
    # Configure deterministic JSON output with limits to prevent free-tier abuse
    generation_config = genai.types.GenerationConfig(
        temperature=0.1,
        candidate_count=1,
        max_output_tokens=4096,
        response_mime_type="application/json",
        response_schema=response_schema
    )
    
    try:
        response = await model.generate_content_async(
            full_prompt,
            generation_config=generation_config
        )
        return safe_json_loads(response.text)
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        raise e
