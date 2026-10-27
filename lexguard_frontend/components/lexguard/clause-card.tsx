"use client"

import type { ClauseAnalysis } from "@/lib/analysis-contract"
export type ClauseData = ClauseAnalysis
export type ClauseSeverity = ClauseAnalysis["severity"]

interface Props {
  clause: ClauseAnalysis
  expanded: boolean
  onToggle: () => void
  onSource: () => void
}

const severityColor = {
  low: "bg-emerald-100 text-emerald-900", medium: "bg-amber-100 text-amber-900",
  high: "bg-rose-100 text-rose-900", critical: "bg-rose-200 text-rose-950",
}

export function ClauseCard({ clause, expanded, onToggle, onSource }: Props) {
  return (
    <article tabIndex={-1} id={"finding-" + clause.clause_id} className="bg-white/80 border border-slate-200 rounded-2xl p-5 scroll-mt-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="font-semibold text-slate-900">{clause.clause_type}</h3>
        <span className={"text-xs rounded-full px-3 py-1 " + severityColor[clause.severity]}>
          {clause.severity} · {clause.risk_score}/10
        </span>
      </div>
      <blockquote className="border-l-2 border-violet-300 pl-3 text-sm text-slate-700 whitespace-pre-wrap">{clause.original_clause}</blockquote>
      <p className="text-sm text-slate-700 mt-3">{clause.plain_english}</p>
      <p className="text-sm text-slate-700 mt-3"><strong>Potential risk:</strong> {clause.why_risky}</p>
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={"details-" + clause.clause_id}
          className="text-sm font-semibold text-violet-800 underline underline-offset-4 focus-visible:outline-2">
          {expanded ? "Hide details" : "Impact and negotiation"}
        </button>
        <button type="button" onClick={onSource} className="text-sm font-semibold text-violet-800 underline underline-offset-4 focus-visible:outline-2">
          View source{clause.source_page ? " · page " + clause.source_page : ""}
        </button>
      </div>
      <div id={"details-" + clause.clause_id} hidden={!expanded} className="mt-4 space-y-3 text-sm text-slate-700">
        <p><strong>Possible impact:</strong> {clause.real_world_impact}</p>
        <p><strong>Negotiation suggestion:</strong> {clause.negotiation_tip}</p>
        <p><strong>Affected party:</strong> {clause.affected_party}</p>
        <p className="text-xs text-slate-500">Model confidence estimate: {clause.confidence_score}%. This estimate is uncalibrated and independent of risk magnitude.</p>
      </div>
    </article>
  )
}
