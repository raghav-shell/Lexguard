import re
from typing import List

def chunk_legal_text(text: str, max_chunks: int = 10) -> List[str]:
    """
    Smart, semantics-based chunker that splits text via paragraph boundaries 
    and numbered lists, limiting to a max number of strong chunks for speed.
    """
    if not text:
        return []

    # Split by double newlines or numbered patterns (e.g., "1. ", "1.1 ")
    # This is a simplified regex for hackathon purposes.
    raw_chunks = re.split(r'\n\s*\n|\n(?=\d+\.\s)', text)
    
    # Filter out very short chunks and strip whitespace
    cleaned_chunks = [chunk.strip() for chunk in raw_chunks if len(chunk.strip()) > 50]
    
    # Sort chunks by length (longest/most dense usually contain the most legal risk)
    # Then take the top N chunks to process
    cleaned_chunks.sort(key=len, reverse=True)
    selected_chunks = cleaned_chunks[:max_chunks]
    
    return selected_chunks
