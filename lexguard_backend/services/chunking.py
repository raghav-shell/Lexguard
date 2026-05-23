import re
from typing import List

def chunk_legal_text(text: str, max_chunks: int = 10) -> List[str]:
    """
    Smart, semantics-based chunker that splits text via paragraph boundaries
    and numbered lists, selects the top N highest density chunks, and returns
    them preserved in their original document reading order.
    """
    if not text:
        return []

    # Split by double newlines or numbered patterns (e.g., "1. ", "1.1 ")
    raw_chunks = re.split(r'\n\s*\n|\n(?=\d+\.\s)', text)
    
    # Track chunks with their original indices to preserve reading order
    indexed_chunks = [(i, chunk.strip()) for i, chunk in enumerate(raw_chunks) if len(chunk.strip()) > 50]
    if not indexed_chunks:
        return []

    # Sort chunks by length descending (longest/most dense contain most legal risk)
    indexed_chunks.sort(key=lambda x: len(x[1]), reverse=True)
    top_chunks = indexed_chunks[:max_chunks]
    
    # Re-sort by original index to restore correct document sequence
    top_chunks.sort(key=lambda x: x[0])
    
    return [chunk for _, chunk in top_chunks]
