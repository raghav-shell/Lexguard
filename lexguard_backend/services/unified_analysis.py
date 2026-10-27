import asyncio
import json
import logging
import time
from pathlib import Path
import httpx
from config import Settings, configured
from errors import AppError
from models.schemas import AnalysisResponse, Coverage, ReviewContext, RiskBreakdown
from services.chunking import chunk_legal_text
from services import providers
from utils.helpers import ground_analysis

logger = logging.getLogger("lexguard.analysis")
SYSTEM_PROMPT = (Path(__file__).parent.parent / "prompts/super_agent_prompt.txt").read_text()


def verdict(score: int) -> str:
    return "critical" if score >= 85 else "high-risk" if score >= 65 else "caution" if score >= 35 else "low-risk"


async def build_super_analysis(document: dict, context: ReviewContext, request_id: str, client: httpx.AsyncClient, settings: Settings) -> AnalysisResponse:
    if not any(configured(key) for key in ("GEMINI_API_KEY", "OPENROUTER_API_KEY")):
        raise AppError(503, "providers_not_configured", "Analysis is not configured on this server. Try the sample report or contact the operator.")
    started = time.monotonic()
    batches = chunk_legal_text(document["text"], settings.batch_chars)
    semaphore = asyncio.Semaphore(2)

    async def analyze_batch(batch):
        async with semaphore:
            content = json.dumps({"review_context": context.model_dump(), "document_text": batch.text}, ensure_ascii=False)
            for name, key, call, budget in [
                ("gemini", "GEMINI_API_KEY", providers.gemini, settings.primary_seconds),
                ("openrouter", "OPENROUTER_API_KEY", providers.openrouter, settings.secondary_seconds),
            ]:
                if not configured(key):
                    continue
                try:
                    raw = await asyncio.wait_for(call(client, SYSTEM_PROMPT, content), timeout=budget)
                    analysis, clauses = ground_analysis(raw, batch.text, batch.start, document["pages"])
                    for clause in clauses:
                        expected = "critical" if clause.risk_score >= 9 else "high" if clause.risk_score >= 7 else "medium" if clause.risk_score >= 4 else "low"
                        if clause.severity != expected:
                            raise ValueError("Inconsistent risk magnitude and severity")
                    return name, analysis, clauses
                except (ValueError, KeyError, IndexError, TypeError, TimeoutError, httpx.HTTPError) as error:
                    logger.warning("provider_attempt_failed request_id=%s provider=%s error_type=%s http_status=%s",
                                   request_id, name, type(error).__name__,
                                   error.status_code if isinstance(error, providers.ProviderRequestError) else "none")
            raise AppError(502, "analysis_unavailable", "The AI providers could not return a complete, source-verified analysis. Please retry later. No sample findings have been substituted.")

    tasks = [asyncio.create_task(analyze_batch(batch)) for batch in batches]
    try:
        results = await asyncio.wait_for(asyncio.gather(*tasks), timeout=settings.analysis_seconds)
    except TimeoutError:
        raise AppError(504, "analysis_timeout", "The analysis deadline was reached. Try a smaller document or retry later.") from None
    finally:
        for task in tasks:
            if not task.done():
                task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)

    unique = {}
    for _, _, clauses in results:
        for clause in clauses:
            key = (clause.source_start, clause.source_end, clause.clause_type)
            if key not in unique or clause.risk_score > unique[key].risk_score:
                unique[key] = clause
    clauses = sorted(unique.values(), key=lambda c: (-c.risk_score, c.source_start))
    names = {name for name, _, _ in results}
    # Conservative aggregation: never average away a high-risk batch.
    overall = max([result.overall_risk_score for _, result, _ in results] + [c.risk_score * 10 for c in clauses])
    breakdown = RiskBreakdown(**{key: max(getattr(r.risk_breakdown, key) for _, r, _ in results) for key in RiskBreakdown.model_fields})
    warnings = list(document["warnings"]) + [
        "AI findings and confidence are estimates, not legal advice or a guarantee of completeness. Verify important terms with qualified counsel.",
        "All extracted text was submitted in bounded sections. Cross-section references and document formatting can still affect interpretation.",
    ]
    if context.jurisdiction == "Not specified":
        warnings.append("No jurisdiction was specified. Enforceability and local legal requirements have not been established.")
    summary = results[0][1].summary if len(results) == 1 else f"Reviewed all extracted text across {len(results)} sections and identified {len(clauses)} source-verified findings. Scores show the highest section risk and lowest section fairness; review the findings and their context."
    return AnalysisResponse(
        schema_version="3.0", request_id=request_id, extracted_text=document["text"],
        overall_risk_score=overall, fairness_score=min(r.fairness_score for _, r, _ in results),
        overall_verdict=verdict(overall), summary=summary, top_concerns=[c.why_risky for c in clauses[:5]],
        risk_breakdown=breakdown, clauses=clauses,
        provider_used=next(iter(names)) if len(names) == 1 else "mixed",
        analysis_duration=round(time.monotonic() - started, 2),
        fallback_triggered="openrouter" in names and configured("GEMINI_API_KEY"),
        is_demo=False, coverage=Coverage(total_characters=len(document["text"]),
            analyzed_characters=len(document["text"]), total_pages=len(document["pages"]),
            batches=len(batches), scope="all_extracted_text"),
        context=context, warnings=warnings,
    )
