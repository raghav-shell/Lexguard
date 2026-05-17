import os
import json
import google.generativeai as genai
from utils.helpers import clean_json_response

async def generate_json_response(prompt: str, content: str) -> dict:
    """
    Calls Gemini API with the given prompt and content, forcing JSON output.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise ValueError("Valid GEMINI_API_KEY not found.")
        
    genai.configure(api_key=api_key)
    
    # Use gemini-2.5-flash for speed
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    full_prompt = f"{prompt}\n\nCONTENT TO ANALYZE:\n{content}\n\nOUTPUT STRICT JSON ONLY:"
    
    try:
        # In a real app we'd use await model.generate_content_async but 
        # the sync version is fine if wrapped or for this MVP pattern.
        # Actually, let's use the async version for better performance if possible,
        # but the standard genai sdk generate_content is synchronous.
        # We will use generate_content_async
        response = await model.generate_content_async(full_prompt)
        cleaned_text = clean_json_response(response.text)
        return json.loads(cleaned_text)
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        raise e
