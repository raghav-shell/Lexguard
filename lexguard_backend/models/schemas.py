from pydantic import BaseModel, Field
from typing import List

class ClauseAnalysis(BaseModel):
    clause_id: str
    clause_type: str
    severity: str = Field(description="Low, Moderate, High, or Critical")
    risk_score: int = Field(ge=1, le=10)
    affected_party: str = Field(description="Who does this impact? e.g., Employee, Consumer, Contractor")
    fairness_assessment: str
    original_clause: str
    plain_english: str
    why_risky: str
    real_world_impact: str = Field(description="Real-world consequence simulation of the clause")
    negotiation_tip: str
    agent_source: str
    confidence_score: int = Field(ge=0, le=100)

class RiskBreakdown(BaseModel):
    employment: int
    privacy: int
    financial: int
    ip: int
    fairness: int

class AnalysisResponse(BaseModel):
    overall_risk_score: int
    fairness_score: int
    overall_verdict: str
    summary: str
    top_concerns: List[str]
    risk_breakdown: RiskBreakdown
    clauses: List[ClauseAnalysis]
