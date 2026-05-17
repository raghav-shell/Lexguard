import json
import re

def clean_json_response(raw_text: str) -> str:
    """
    Cleans up the raw text returned by Gemini to ensure it's valid JSON.
    Removes markdown code blocks if present.
    """
    if not raw_text:
        return "{}"
        
    # Remove ```json and ```
    cleaned = re.sub(r'```json\s*', '', raw_text)
    cleaned = re.sub(r'\s*```', '', cleaned)
    
    return cleaned.strip()
