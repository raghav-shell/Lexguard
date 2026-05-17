import json
import re

def clean_json_response(raw_text: str) -> str:
    """
    Cleans up the raw text returned by Gemini to ensure it's valid JSON.
    Removes markdown code blocks and trailing commas.
    """
    if not raw_text:
        return "{}"
        
    cleaned = raw_text.strip()
    
    # Remove markdown wrappers
    cleaned = re.sub(r'^```[a-zA-Z]*\n', '', cleaned)
    cleaned = re.sub(r'```$', '', cleaned).strip()
    
    # Remove trailing commas before closing brackets/braces
    cleaned = re.sub(r',\s*([\]}])', r'\1', cleaned)
    
    return cleaned

def safe_json_loads(raw_text: str) -> dict | list:
    """
    Safely attempts to parse JSON, falling back to aggressive extraction if needed.
    """
    cleaned = clean_json_response(raw_text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"Primary JSON decode failed: {e}")
        # Secondary recovery attempt: extract just the JSON boundaries
        try:
            first_brace = cleaned.find('{')
            first_bracket = cleaned.find('[')
            
            start_idx = -1
            if first_brace != -1 and first_bracket != -1:
                start_idx = min(first_brace, first_bracket)
            else:
                start_idx = max(first_brace, first_bracket)
                
            last_brace = cleaned.rfind('}')
            last_bracket = cleaned.rfind(']')
            
            end_idx = max(last_brace, last_bracket)
            
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                extracted = cleaned[start_idx:end_idx+1]
                return json.loads(extracted)
            raise ValueError("Could not find JSON boundaries")
        except Exception as e2:
            print(f"Secondary JSON recovery failed: {e2}")
            # Log snippet for debugging
            snippet = cleaned[:200] + "..." + cleaned[-200:] if len(cleaned) > 400 else cleaned
            print(f"RAW JSON SNIPPET FAULT:\n{snippet}")
            raise e # Raise original error to trigger fallback

import uuid

def normalize_analysis_response(raw_json: dict) -> dict:
    """
    Normalizes the JSON output from any AI provider to ensure it strictly matches 
    the MasterSchema format expected by the frontend.
    Guarantees that missing fields, IDs, and types are corrected regardless of provider.
    """
    if not isinstance(raw_json, dict):
        raw_json = {}
        
    normalized = {
        "overall_risk_score": int(raw_json.get("overall_risk_score", 50) or 50),
        "fairness_score": int(raw_json.get("fairness_score", 50) or 50),
        "overall_verdict": str(raw_json.get("overall_verdict", "caution")),
        "summary": str(raw_json.get("summary", "Analysis completed.")),
        "top_concerns": list(raw_json.get("top_concerns", [])),
        "risk_breakdown": raw_json.get("risk_breakdown", {
            "employment": 50, "privacy": 50, "financial": 50, "ip": 50, "fairness": 50
        }),
        "clauses": []
    }
    
    # Normalize risk breakdown if it's missing inner fields
    rb = normalized["risk_breakdown"]
    if isinstance(rb, dict):
        normalized["risk_breakdown"] = {
            "employment": int(rb.get("employment", 50)),
            "privacy": int(rb.get("privacy", 50)),
            "financial": int(rb.get("financial", 50)),
            "ip": int(rb.get("ip", 50)),
            "fairness": int(rb.get("fairness", 50))
        }
    
    # Process clauses
    raw_clauses = raw_json.get("clauses", [])
    if isinstance(raw_clauses, list):
        for c in raw_clauses:
            if not isinstance(c, dict): continue
            
            clause = {
                "id": str(uuid.uuid4()),
                "category": str(c.get("category", "General")),
                "text": str(c.get("text", "")),
                "risk_level": str(c.get("risk_level", "medium")),
                "explanation": str(c.get("explanation", "")),
                "confidence_score": int(c.get("confidence_score", 80) or 80),
                "affected_party": str(c.get("affected_party", "Both Parties")),
                "negotiation_tip": str(c.get("negotiation_tip", "")),
                "real_world_impact": str(c.get("real_world_impact", ""))
            }
            normalized["clauses"].append(clause)
            
    return normalized
