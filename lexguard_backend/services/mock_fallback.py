import json

def get_fallback_mock_response() -> dict:
    """
    Returns a perfect, realistic JSON mock response if the AI fails.
    Guarantees the demo UI never breaks.
    """
    return {
      "overall_risk_score": 85,
      "fairness_score": 25,
      "overall_verdict": "high-risk",
      "summary": "This contract heavily favors the issuing party. We detected highly restrictive non-compete clauses, aggressive IP assignment covering personal projects, and a forced arbitration clause that waives your class-action rights.",
      "top_concerns": [
        "Unreasonable 3-year post-employment non-compete.",
        "Perpetual assignment of intellectual property including side projects.",
        "One-sided termination rights without severance."
      ],
      "risk_breakdown": {
        "employment": 90,
        "privacy": 40,
        "financial": 70,
        "ip": 95,
        "fairness": 80
      },
      "clauses": [
        {
          "clause_id": "mock-1",
          "clause_type": "Non-Compete",
          "severity": "Critical",
          "risk_score": 9,
          "affected_party": "Employee",
          "fairness_assessment": "Highly Asymmetrical",
          "original_clause": "Employee agrees not to engage in any competitive business within a 500-mile radius for a period of 3 years following termination.",
          "plain_english": "You cannot work for any competitor within 500 miles for 3 years after you leave.",
          "why_risky": "The duration and geographic scope are exceptionally broad and prevent you from earning a livelihood in your field.",
          "real_world_impact": "If you quit or are fired, you may be forced to relocate to another state or entirely change your career path for 3 years to avoid being sued.",
          "negotiation_tip": "Limit the non-compete to 6-12 months and restrict the geographic scope to 50 miles.",
          "agent_source": "Employment Agent",
          "confidence_score": 95
        },
        {
          "clause_id": "mock-2",
          "clause_type": "Intellectual Property",
          "severity": "High",
          "risk_score": 8,
          "affected_party": "Creator",
          "fairness_assessment": "Unfair Overreach",
          "original_clause": "Company retains perpetual, exclusive rights to all intellectual property created by the Employee during the term of employment, regardless of whether company resources were utilized.",
          "plain_english": "The company owns everything you create while employed here, even side projects built at home.",
          "why_risky": "It claims ownership over your personal creations outside of work hours.",
          "real_world_impact": "If you build a successful side-hustle app on your weekends, the company can legally claim 100% ownership and revenues.",
          "negotiation_tip": "Add an explicit carve-out protecting inventions made entirely on your own time without company equipment.",
          "agent_source": "IP Agent",
          "confidence_score": 98
        }
      ]
    }
