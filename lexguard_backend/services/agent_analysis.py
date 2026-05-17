import asyncio
import os
from services.gemini_service import generate_json_response

async def run_agent(agent_type: str, chunks: list[str]) -> list[dict]:
    """
    Simulates a specific agent by running its prompt against the chunks.
    """
    try:
        # Load prompt
        prompt_path = os.path.join(os.path.dirname(__file__), '..', 'prompts', f'{agent_type}_agent_prompt.txt')
        with open(prompt_path, 'r') as f:
            prompt_text = f.read()
            
        # Combine chunks into a single text block to analyze
        content_to_analyze = "\n\n---\n\n".join(chunks)
        
        # Inject strict JSON schema and Real-World Impact rules directly into the prompt
        augmented_prompt = prompt_text + """

CRITICAL JSON INSTRUCTIONS:
Return a STRICT JSON array of objects representing flagged clauses. If no risks are found, return an empty array [].
DO NOT wrap the response in ```json ``` markdown. Return raw JSON.

Schema for each object in the array:
{
  "category": "Domain (e.g. Employment, Privacy, Financial)",
  "text": "The exact verbatim contract text you are flagging",
  "risk_level": "high", "medium", or "low",
  "explanation": "Clear, professional explanation of why this is a risk",
  "confidence_score": Integer between 0 and 100,
  "affected_party": "e.g., Employee, Consultant, Contractor",
  "negotiation_tip": "A practical sentence on how to counter or negotiate this term",
  "real_world_impact": "CRITICAL: Write a human, practical, and emotionally understandable consequence. Good: 'This clause may prevent you from joining competitors for 24 months after resignation.' Bad: 'This is restrictive.'"
}
"""
        
        result = await generate_json_response(augmented_prompt, content_to_analyze)
        
        if isinstance(result, list):
            return result
        elif isinstance(result, dict) and "clauses" in result:
            return result["clauses"]
        return []
    except Exception as e:
        print(f"Agent {agent_type} failed: {e}")
        return []

async def analyze_with_agents(chunks: list[str]) -> list[dict]:
    """
    Runs all agents concurrently against the selected chunks.
    """
    agents = ["employment", "privacy", "financial", "ip", "fairness"]
    
    # Run all agents in parallel
    results = await asyncio.gather(
        *[run_agent(agent, chunks) for agent in agents],
        return_exceptions=True
    )
    
    all_clauses = []
    for res in results:
        if isinstance(res, list):
            all_clauses.extend(res)
            
    return all_clauses
