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
    verdict = str(raw_json.get("overall_verdict") or raw_json.get("verdict") or "caution").lower()
    if verdict not in ["critical", "high-risk", "caution", "safe"]:
        verdict = "caution"

    # Deep extract overall risk and fairness scores supporting diverse schemas
    overall_risk = raw_json.get("overall_risk_score")
    if overall_risk is None:
        overall_risk = raw_json.get("total_risk_assessment", {}).get("overall_contract_risk")
    if overall_risk is None:
        overall_risk = raw_json.get("overall_contract_risk")
    if overall_risk is None:
        overall_risk = 50

    fairness = raw_json.get("fairness_score")
    if fairness is None:
        fairness = raw_json.get("total_risk_assessment", {}).get("fairness_rating")
    if fairness is None:
        fairness = raw_json.get("fairness_rating")
    if fairness is None:
        fairness = 50

    summary = str(raw_json.get("summary") or raw_json.get("executive_summary") or "Analysis completed.")

    top_concerns = raw_json.get("top_concerns") or raw_json.get("key_concerns") or raw_json.get("concerns") or []
    if not isinstance(top_concerns, list):
        top_concerns = []

    normalized = {
        "overall_risk_score": int(overall_risk),
        "fairness_score": int(fairness),
        "overall_verdict": verdict,
        "summary": summary,
        "top_concerns": top_concerns,
        "risk_breakdown": raw_json.get("risk_breakdown") or raw_json.get("breakdown") or {
            "employment": 50, "privacy": 50, "financial": 50, "ip": 50, "fairness": 50
        },
        "clauses": []
    }

    # Safe integer conversion helper to handle percentage strings (e.g. "95%") or errors defensively
    def safe_int(val, default=80) -> int:
        if val is None:
            return default
        try:
            if isinstance(val, (int, float)):
                return int(val)
            # Find all numbers in the string
            digits = re.findall(r'\d+', str(val))
            if digits:
                return int(digits[0])
        except Exception:
            pass
        return default

    # Normalize risk breakdown fields using safe_int
    rb = normalized["risk_breakdown"]
    if isinstance(rb, dict):
        normalized["risk_breakdown"] = {
            "employment": safe_int(rb.get("employment"), 50),
            "privacy": safe_int(rb.get("privacy"), 50),
            "financial": safe_int(rb.get("financial"), 50),
            "ip": safe_int(rb.get("ip"), 50),
            "fairness": safe_int(rb.get("fairness"), 50)
        }
    else:
        normalized["risk_breakdown"] = {
            "employment": 50, "privacy": 50, "financial": 50, "ip": 50, "fairness": 50
        }

    # Map severity/risk_level to frontend ClauseSeverity type (substring-safe check)
    def map_severity(raw: str) -> str:
        s = str(raw or "").lower()
        if any(w in s for w in ["critical", "severe", "danger", "red", "extreme"]):
            return "critical"
        if any(w in s for w in ["high", "major", "elevated", "orange"]):
            return "high"
        if any(w in s for w in ["low", "minor", "negligible", "minimal", "safe", "green", "acceptable"]):
            return "low"
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

    # Generate an intelligent default negotiation tip based on category if the AI omits it
    def generate_fallback_negotiation_tip(category: str) -> str:
        cat = category.lower()
        if "employment" in cat or "non-compete" in cat:
            return "Propose limiting the geographic scope to 10-25 miles and reducing the duration to 6 months."
        if "intellectual property" in cat or "ip" in cat:
            return "Add an explicit intellectual property carve-out protecting inventions created entirely on your own time, using your own equipment, and unrelated to the company's business."
        if "financial" in cat or "liability" in cat or "payment" in cat:
            return "Request that payment approval timelines be explicitly defined and capped, and add late payment interest to prevent indefinite delays."
        if "privacy" in cat or "consent" in cat or "monitor" in cat:
            return "Request that device and communication monitoring be restricted strictly to company-owned hardware, during standard working hours, with zero access to personal accounts."
        if "fairness" in cat or "termination" in cat:
            return "Negotiate to make all termination notice requirements and severance provisions strictly mutual between both parties."
        return "Seek to negotiate a more balanced and mutual version of this clause with the other party before signing."

    # Process and remap all clause fields (supports clauses, critical_clauses, flagged_clauses, risky_clauses)
    raw_clauses = raw_json.get("clauses") or raw_json.get("critical_clauses") or raw_json.get("flagged_clauses") or raw_json.get("risky_clauses") or []
    if isinstance(raw_clauses, list):
        for c in raw_clauses:
            if not isinstance(c, dict):
                continue

            category  = str(c.get("category") or c.get("clause_type") or c.get("type") or "General")
            text      = str(c.get("text") or c.get("original_clause") or c.get("quote") or c.get("content") or "")
            explain   = str(c.get("explanation") or c.get("why_risky") or c.get("description") or "")
            
            raw_conf  = c.get("confidence_score") or c.get("confidence") or c.get("overall_risk_score") or c.get("risk_score") or 80
            conf      = safe_int(raw_conf, 80)
            if conf <= 10:
                conf = conf * 10

            raw_risk  = c.get("risk_score") or c.get("overall_risk_score")
            risk_val  = safe_int(raw_risk, default=None)
            if risk_val is None:
                risk_val = conf // 10
            risk_score = max(1, min(10, risk_val))

            # Heuristic fallback mapping: prevent any unrecognized strings from collapsing to medium
            raw_severity = (
                c.get("risk_level") or 
                c.get("severity") or 
                c.get("level") or 
                c.get("risk") or 
                c.get("risk_severity")
            )
            if raw_severity:
                severity = map_severity(raw_severity)
            else:
                if risk_score >= 9:
                    severity = "critical"
                elif risk_score >= 7:
                    severity = "high"
                elif risk_score >= 4:
                    severity = "medium"
                else:
                    severity = "low"

            party = str(c.get("affected_party") or c.get("party") or "Both Parties").strip()
            if party.lower() in ["both", "both parties", "both_parties", "bothparties"]:
                party = "Both Parties"
            else:
                party = party.title()

            tip = str(c.get("negotiation_tip") or c.get("negotiation_recommendation") or c.get("recommendation") or c.get("tip") or "")
            if not tip:
                tip = generate_fallback_negotiation_tip(category)

            clause = {
                # Frontend-required field names
                "clause_id":          str(c.get("clause_id") or c.get("id") or uuid.uuid4()),
                "clause_type":        category,
                "severity":           severity,
                "risk_score":         risk_score,
                "affected_party":     party,
                "fairness_assessment": str(c.get("fairness_assessment") or c.get("fairness_rating") or c.get("fairness") or "Requires Review"),
                "original_clause":    text,
                "plain_english":      str(c.get("plain_english") or explain),
                "why_risky":          explain,
                "real_world_impact":  str(c.get("real_world_impact") or c.get("impact") or ""),
                "negotiation_tip":    tip,
                "agent_source":       str(c.get("agent_source") or map_agent_source(category)),
                "confidence_score":   conf,
            }
            normalized["clauses"].append(clause)

    # Populate top concerns if empty but clauses exist
    if not normalized["top_concerns"] and normalized["clauses"]:
        normalized["top_concerns"] = [c["why_risky"] or c["plain_english"] for c in normalized["clauses"][:3]]

    return normalized
