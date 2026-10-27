from dataclasses import dataclass


@dataclass(frozen=True)
class TextBatch:
    text: str
    start: int


def chunk_legal_text(text: str, batch_chars: int = 20000) -> list[TextBatch]:
    """Partition all text without dropping short clauses or changing source offsets."""
    if batch_chars < 100:
        raise ValueError("Batch size too small")
    batches = []
    start = 0
    while start < len(text):
        end = min(start + batch_chars, len(text))
        if end < len(text):
            boundary = text.rfind("\n", start + batch_chars * 3 // 4, end)
            if boundary < 0:
                boundary = text.rfind(" ", start + batch_chars * 3 // 4, end)
            if boundary >= 0:
                end = boundary + 1
        batches.append(TextBatch(text[start:end], start))
        if end == len(text):
            break
        start = end - min(300, batch_chars // 10)
    return batches
