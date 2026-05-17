import json
import urllib.request
import urllib.error
import os
import asyncio
from utils.helpers import safe_json_loads

async def generate_openrouter_response(prompt: str, content: str) -> dict:
    """
    Calls OpenRouter API as a fallback provider.
    Uses standard library urllib wrapped in asyncio.to_thread for async operation.
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key or api_key == "your_openrouter_api_key_here":
        raise ValueError("Valid OPENROUTER_API_KEY not found.")
        
    model = os.getenv("OPENROUTER_MODEL", "anthropic/claude-3.5-sonnet")
    
    full_prompt = f"{prompt}\n\nCONTENT TO ANALYZE:\n{content}\n\nOUTPUT STRICT JSON ONLY:"
    
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Lexguard",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "user", "content": full_prompt}
        ]
    }
    
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    
    def _make_request():
        with urllib.request.urlopen(req, timeout=45) as response:
            return response.read().decode('utf-8')
            
    try:
        response_body = await asyncio.to_thread(_make_request)
        response_json = json.loads(response_body)
        
        if "choices" not in response_json or len(response_json["choices"]) == 0:
            raise ValueError(f"Invalid OpenRouter response structure: {response_json}")
            
        content_text = response_json["choices"][0]["message"]["content"]
        
        # Pipe through our resilient parser
        return safe_json_loads(content_text)
    except Exception as e:
        print(f"OpenRouter API Error: {str(e)}")
        raise e
