import json
import re
import uuid

def clean_json_response(raw_text: str) -> str:
    """
    Cleans up the raw text returned by Gemini to ensure it's valid JSON.
    Removes markdown code blocks and trailing commas.
    """
    if not raw_text:
        return "{}"
        
    cleaned = raw_text.strip()
    
    # Remove markdown wrappers (handles ```json, ``` json, and trailing ```)
    cleaned = re.sub(r'^```[a-zA-Z]*\s*\n?', '', cleaned)
    cleaned = re.sub(r'\n?```\s*$', '', cleaned).strip()
    
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

def normalize_analysis_response(raw_json: dict) -> dict:
    """
    Normalizes the JSON output from any AI provider to ensure it strictly matches
    the ClauseData interface expected by the frontend.

    FRONTEND ClauseData INTERFACE (must match exactly):
      clause_id, clause_type, severity, risk_score, affected_party,
      fairness_assessment, original_clause, plain_english, why_risky,
      real_world_impact, negotiation_tip, agent_source, confidence_score
    """
    if not isinstance(raw_json, dict):
        raw_json = {}

    # Map verdict safely
    verdict = str(raw_json.get("overall_verdict", "caution")).lower()
    if verdict not in ["critical", "high-risk", "caution", "safe"]:
        verdict = "caution"

    normalized = {
        "overall_risk_score": int(raw_json.get("overall_risk_score", 50) or 50),
        "fairness_score": int(raw_json.get("fairness_score", 50) or 50),
        "overall_verdict": verdict,
        "summary": str(raw_json.get("summary", "Analysis completed.")),
        "top_concerns": list(raw_json.get("top_concerns", [])),
        "risk_breakdown": raw_json.get("risk_breakdown", {
            "employment": 50, "privacy": 50, "financial": 50, "ip": 50, "fairness": 50
        }),
        "clauses": []
    }

    # Normalize risk breakdown fields
    rb = normalized["risk_breakdown"]
    if isinstance(rb, dict):
        normalized["risk_breakdown"] = {
            "employment": int(rb.get("employment", 50) or 50),
            "privacy": int(rb.get("privacy", 50) or 50),
            "financial": int(rb.get("financial", 50) or 50),
            "ip": int(rb.get("ip", 50) or 50),
            "fairness": int(rb.get("fairness", 50) or 50)
        }
    else:
        normalized["risk_breakdown"] = {
            "employment": 50, "privacy": 50, "financial": 50, "ip": 50, "fairness": 50
        }

    # Map severity/risk_level to frontend ClauseSeverity type
    def map_severity(raw: str) -> str:
        s = str(raw or "medium").lower()
        if s in ["critical"]: return "critical"
        if s in ["high"]: return "high"
        if s in ["low"]: return "low"
        return "medium"

    # Map category to a readable agent_source label
    def map_agent_source(category: str) -> str:
        mapping = {
            "employment": "Employment Agent",
            "privacy": "Privacy Agent",
            "financial": "Financial Agent",
            "intellectual property": "IP Agent",
            "ip": "IP Agent",
            "fairness": "Fairness Agent",
        }
        return mapping.get(category.lower(), "LEXGUARD AI")

    # Process and remap all clause fields
    raw_clauses = raw_json.get("clauses", [])
    if isinstance(raw_clauses, list):
        for c in raw_clauses:
            if not isinstance(c, dict):
                continue

            # Support both backend field names (category/text/risk_level/explanation)
            # and legacy field names (clause_type/original_clause/severity/why_risky)
            category  = str(c.get("category") or c.get("clause_type") or "General")
            text      = str(c.get("text") or c.get("original_clause") or "")
            severity  = map_severity(c.get("risk_level") or c.get("severity") or "medium")
            explain   = str(c.get("explanation") or c.get("why_risky") or "")
            conf      = c.get("confidence_score", 80)

            clause = {
                # Frontend-required field names
                "clause_id":          str(c.get("clause_id") or c.get("id") or uuid.uuid4()),
                "clause_type":        category,
                "severity":           severity,
                "risk_score":         max(1, min(10, int(conf or 80) // 10)),  # map 0-100 → 1-10
                "affected_party":     str(c.get("affected_party") or "Both Parties"),
                "fairness_assessment": str(c.get("fairness_assessment") or "Requires Review"),
                "original_clause":    text,
                "plain_english":      str(c.get("plain_english") or explain),
                "why_risky":          explain,
                "real_world_impact":  str(c.get("real_world_impact") or ""),
                "negotiation_tip":    str(c.get("negotiation_tip") or ""),
                "agent_source":       str(c.get("agent_source") or map_agent_source(category)),
                "confidence_score":   int(conf or 80),
            }
            normalized["clauses"].append(clause)

    return normalized
