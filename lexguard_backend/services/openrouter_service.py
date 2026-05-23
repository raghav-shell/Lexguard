import json
import urllib.request
import urllib.error
import ssl
import os
import time
import asyncio
import certifi
from utils.helpers import safe_json_loads

# Use certifi's CA bundle to fix SSL certificate verification on macOS
SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())

async def generate_openrouter_response(prompt: str, content: str) -> dict:
    """
    Calls OpenRouter API as a fallback provider with retry logic and timing.
    Uses certifi for SSL cert verification (required on macOS Python installs).
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key or api_key == "your_openrouter_api_key_here":
        raise ValueError("Valid OPENROUTER_API_KEY not found.")

    model = os.getenv("OPENROUTER_MODEL", "anthropic/claude-3.5-sonnet")
    full_prompt = f"{prompt}\n\nCONTENT TO ANALYZE:\n{content}\n\nOUTPUT STRICT JSON ONLY:"

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "X-Title": "Lexguard",
        "Content-Type": "application/json"
    }

    data = {
        "model": model,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": "You are a legal document analyzer. You must output STRICT JSON matching the schema. CRITICAL: The 'text' field for each clause MUST be an exact 100% verbatim substring directly from the contract text as written, with zero changes, zero paraphrasing, and zero ellipses, so it can be matched and highlighted in the document viewer."
            },
            {"role": "user", "content": full_prompt}
        ]
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers=headers,
        method='POST'
    )

    def _make_request():
        # Pass SSL_CONTEXT with certifi CA bundle to fix macOS cert issues
        with urllib.request.urlopen(req, timeout=45, context=SSL_CONTEXT) as response:
            return response.read().decode('utf-8')

    max_retries = 2
    last_error = None

    for attempt in range(max_retries + 1):
        try:
            t_start = time.monotonic()
            response_body = await asyncio.to_thread(_make_request)
            elapsed = time.monotonic() - t_start

            response_json = json.loads(response_body)

            if "choices" not in response_json or len(response_json["choices"]) == 0:
                raise ValueError(f"Invalid OpenRouter response structure")

            content_text = response_json["choices"][0]["message"]["content"]
            result = safe_json_loads(content_text)
            print(f"[OPENROUTER SUCCESS - {elapsed:.1f}s] model={model} (attempt {attempt + 1})")
            return result
        except urllib.error.HTTPError as he:
            error_body = ""
            try:
                error_body = he.read().decode('utf-8')
            except Exception:
                pass
            detailed_err = f"HTTP Error {he.code} {he.reason}: {error_body}"
            print(f"[OPENROUTER HTTP ERROR] {detailed_err}")
            last_error = Exception(detailed_err)
            if attempt < max_retries:
                wait = 1.5 ** attempt
                print(f"[OPENROUTER RETRY {attempt + 1}] Retrying in {wait:.1f}s...")
                await asyncio.sleep(wait)
            else:
                print(f"[OPENROUTER FAILED] All {max_retries + 1} attempts failed.")
        except Exception as e:
            last_error = e
            if attempt < max_retries:
                wait = 1.5 ** attempt
                print(f"[OPENROUTER RETRY {attempt + 1}] Error: {e}. Retrying in {wait:.1f}s...")
                await asyncio.sleep(wait)
            else:
                print(f"[OPENROUTER FAILED] All {max_retries + 1} attempts failed. Last error: {e}")

    raise last_error
