"use client";

import { ArrowUpRight, ChevronDown, ScanText } from "lucide-react";
import type { ClauseAnalysis } from "@/lib/analysis-contract";
export type ClauseData = ClauseAnalysis;
export type ClauseSeverity = ClauseAnalysis["severity"];
interface Props {
  clause: ClauseAnalysis;
  expanded: boolean;
  onToggle: () => void;
  onSource: () => void;
}

export function ClauseCard({ clause, expanded, onToggle, onSource }: Props) {
  return (
    <article
      tabIndex={-1}
      id={"finding-" + clause.clause_id}
      className="finding-card"
    >
      <div className="finding-card-header">
        <h3>
          <ScanText size={15} strokeWidth={1.5} aria-hidden="true" />
          {clause.clause_type}
        </h3>
        <span className={"risk-label risk-" + clause.severity}>
          {clause.severity.charAt(0).toUpperCase() + clause.severity.slice(1)} ·{" "}
          {clause.risk_score}/10
        </span>
      </div>
      <blockquote className="finding-quote">
        {clause.original_clause}
      </blockquote>
      <p className="finding-explanation">{clause.plain_english}</p>
      <p className="finding-risk">
        <strong>Why it matters:</strong> {clause.why_risky}
      </p>
      <div className="finding-actions">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={"details-" + clause.clause_id}
        >
          {expanded ? "Hide details" : "Impact and negotiation"}
          <ChevronDown
            size={13}
            aria-hidden="true"
            style={{ transform: expanded ? "rotate(180deg)" : undefined }}
          />
        </button>
        <button type="button" onClick={onSource}>
          View source{clause.source_page ? " · page " + clause.source_page : ""}
          <ArrowUpRight size={13} aria-hidden="true" />
        </button>
      </div>
      <div
        id={"details-" + clause.clause_id}
        hidden={!expanded}
        className="finding-details"
      >
        <p>
          <strong>Possible impact</strong>
          <br />
          {clause.real_world_impact}
        </p>
        <p>
          <strong>A starting point for negotiation</strong>
          <br />
          {clause.negotiation_tip}
        </p>
        <p>
          <strong>Affected party:</strong> {clause.affected_party}
        </p>
        <p className="confidence-note">
          Model confidence estimate: {clause.confidence_score}%. Uncalibrated
          and independent of risk magnitude.
        </p>
      </div>
    </article>
  );
}
