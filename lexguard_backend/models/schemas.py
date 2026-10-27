"""Canonical API contract. Regenerate the client with scripts/generate_contract.py."""
from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, Field

Score = Annotated[int, Field(strict=True, ge=0, le=100)]
Text = Annotated[str, Field(min_length=1, max_length=4000)]
Category = Literal["Employment", "Privacy", "Financial", "Intellectual Property", "Fairness"]
Severity = Literal["low", "medium", "high", "critical"]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class ReviewContext(StrictModel):
    reviewing_party: Annotated[str, Field(min_length=1, max_length=120)]
    jurisdiction: Annotated[str, Field(min_length=1, max_length=120)]
    contract_type: Annotated[str, Field(min_length=1, max_length=80)]


class ProviderClause(StrictModel):
    clause_type: Category
    severity: Severity
    risk_score: Annotated[int, Field(strict=True, ge=1, le=10)]
    original_clause: Annotated[str, Field(min_length=5, max_length=3000)]
    plain_english: Text
    why_risky: Text
    real_world_impact: Text
    negotiation_tip: Text
    affected_party: Text
    confidence_score: Score


class RiskBreakdown(StrictModel):
    employment: Score
    privacy: Score
    financial: Score
    ip: Score
    fairness: Score


class ProviderAnalysis(StrictModel):
    summary: Text
    overall_risk_score: Score
    fairness_score: Score
    risk_breakdown: RiskBreakdown
    clauses: Annotated[list[ProviderClause], Field(max_length=16)]


class ClauseAnalysis(ProviderClause):
    clause_id: str
    fairness_assessment: str
    agent_source: str
    source_start: Annotated[int, Field(ge=0)]
    source_end: Annotated[int, Field(ge=1)]
    source_page: int | None


class Coverage(StrictModel):
    total_characters: Annotated[int, Field(ge=1)]
    analyzed_characters: Annotated[int, Field(ge=1)]
    total_pages: Annotated[int, Field(ge=0)]
    batches: Annotated[int, Field(ge=1)]
    scope: Literal["all_extracted_text"]


class AnalysisResponse(StrictModel):
    schema_version: Literal["3.0"]
    request_id: str
    extracted_text: Annotated[str, Field(min_length=1, max_length=80000)]
    overall_risk_score: Score
    fairness_score: Score
    overall_verdict: Literal["critical", "high-risk", "caution", "low-risk"]
    summary: Text
    top_concerns: list[str]
    risk_breakdown: RiskBreakdown
    clauses: list[ClauseAnalysis]
    provider_used: Literal["gemini", "openrouter", "mixed", "demo"]
    analysis_duration: Annotated[float, Field(ge=0)]
    fallback_triggered: bool
    is_demo: bool
    coverage: Coverage
    context: ReviewContext
    warnings: list[str]


class ErrorDetail(StrictModel):
    code: str
    message: str
    request_id: str


class ErrorResponse(StrictModel):
    error: ErrorDetail
