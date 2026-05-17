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
        
        # We ask the agent to return a JSON array of issues found.
        # Let's augment the prompt to ensure it returns a list of clauses.
        augmented_prompt = prompt_text + "\nReturn a JSON array of objects, where each object represents a flagged clause following the schema. If no risks found, return empty array []."
        
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
