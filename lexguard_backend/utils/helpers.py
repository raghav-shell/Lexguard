"""Strict JSON parsing and evidence grounding; never rewrite a quotation's meaning."""
import hashlib
import json
import re
from models.schemas import ClauseAnalysis, ProviderAnalysis


def safe_json_loads(raw_text: str) -> dict:
    if not isinstance(raw_text, str) or len(raw_text) > 200000:
        raise ValueError("Invalid provider output")
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    result = json.loads(cleaned)
    if not isinstance(result, dict):
        raise ValueError("Expected an analysis object")
    return result


def source_span(text: str, quote: str) -> tuple[int, int]:
    start = text.find(quote)
    if start >= 0:
        return start, start + len(quote)
    words = re.split(r"\s+", quote.strip())
    match = re.search(r"\s+".join(re.escape(word) for word in words), text)
    if not match:
        raise ValueError("Ungrounded quotation")
    return match.span()


def ground_analysis(raw: dict, source: str, offset: int, pages: list[dict]) -> tuple[ProviderAnalysis, list[ClauseAnalysis]]:
    analysis = ProviderAnalysis.model_validate(raw)
    grounded = []
    for clause in analysis.clauses:
        start, end = source_span(source, clause.original_clause)
        absolute_start, absolute_end = offset + start, offset + end
        page = next((p["number"] for p in pages if p["start"] <= absolute_start < p["end"]), None)
        values = clause.model_dump()
        values["original_clause"] = source[start:end]
        grounded.append(ClauseAnalysis(
            **values,
            clause_id="clause-" + hashlib.sha256(f"{absolute_start}:{absolute_end}:{clause.clause_type}".encode()).hexdigest()[:16],
            fairness_assessment="Potential imbalance" if clause.risk_score >= 4 else "Limited concern identified",
            agent_source=f"{clause.clause_type} review",
            source_start=absolute_start, source_end=absolute_end, source_page=page,
        ))
    return analysis, grounded
