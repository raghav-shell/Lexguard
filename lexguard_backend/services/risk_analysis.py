import asyncio
import json
import os
import uuid
from services.agent_analysis import analyze_with_agents
from services.gemini_service import generate_json_response

async def build_final_analysis(clauses: list[dict]) -> dict:
    """
    Takes the aggregated clauses from all agents and uses the master prompt 
    to synthesize the final JSON response matching AnalysisResponse schema.
    """
    try:
        prompt_path = os.path.join(os.path.dirname(__file__), '..', 'prompts', 'master_analysis_prompt.txt')
        with open(prompt_path, 'r') as f:
            master_prompt = f.read()
            
        content_to_analyze = json.dumps({"agent_findings": clauses})
        
        result = await generate_json_response(master_prompt, content_to_analyze)
        
        # Ensure clauses have IDs
        if "clauses" in result:
            for clause in result["clauses"]:
                if "clause_id" not in clause or not clause["clause_id"]:
                    clause["clause_id"] = str(uuid.uuid4())[:8]
                    
        return result
    except Exception as e:
        print(f"Master synthesis failed: {e}")
        raise e
