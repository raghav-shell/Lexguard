"use client"

import { useEffect, useMemo, useRef, type ReactNode } from "react"
import type { ClauseAnalysis } from "@/lib/analysis-contract"

interface Props {
  extractedText: string
  clauses: ClauseAnalysis[]
  activeClauseId: string | null
  onSelect?: (id: string) => void
}

const colors = {
  low: "bg-emerald-100 text-emerald-950",
  medium: "bg-amber-100 text-amber-950",
  high: "bg-rose-100 text-rose-950",
  critical: "bg-rose-200 text-rose-950",
}

export function ContractViewer({ extractedText, clauses, activeClauseId, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const nodes = useMemo(() => {
    // API offsets count Unicode code points, not JavaScript UTF-16 code units.
    const characters = Array.from(extractedText)
    const boundaries = new Set([0, characters.length])
    const grounded = clauses.filter(c => c.source_start >= 0 && c.source_end <= characters.length &&
      characters.slice(c.source_start, c.source_end).join("") === c.original_clause)
    for (const clause of grounded) { boundaries.add(clause.source_start); boundaries.add(clause.source_end) }
    const points = [...boundaries].sort((a, b) => a - b)
    const result: ReactNode[] = []
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i], end = points[i + 1]
      const text = characters.slice(start, end).join("")
      const matches = grounded.filter(c => c.source_start <= start && c.source_end >= end)
      const active = matches.find(c => c.clause_id === activeClauseId)
      const clause = active || matches.sort((a, b) => b.risk_score - a.risk_score)[0]
      if (!clause) result.push(text)
      else result.push(
        <button key={start} type="button" data-clause-id={clause.clause_id}
          aria-label={"View " + clause.clause_type + " finding"}
          onClick={() => onSelect?.(clause.clause_id)}
          className={colors[clause.severity] + " rounded px-0.5 text-left whitespace-pre-wrap inline focus-visible:outline-2 focus-visible:outline-violet-600 " +
            (active ? "ring-2 ring-violet-600" : "")}>
          {text}
        </button>,
      )
    }
    return result
  }, [extractedText, clauses, activeClauseId, onSelect])

  useEffect(() => {
    if (!activeClauseId) return
    const target = [...(container.current?.querySelectorAll<HTMLElement>("[data-clause-id]") || [])]
      .find(element => element.dataset.clauseId === activeClauseId)
    target?.scrollIntoView({ block: "nearest", behavior: "instant" })
  }, [activeClauseId])

  return (
    <section aria-label="Extracted contract text" className="bg-white/80 border border-violet-100 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900">Contract text</h2>
        <p className="text-xs text-slate-500">Extracted text. Select a highlight to open its finding.</p>
      </div>
      <div ref={container} tabIndex={0} aria-label="Scrollable source text"
        className="p-6 max-h-[70vh] overflow-y-auto whitespace-pre-wrap font-serif text-slate-800 leading-8 text-sm focus-visible:outline-2 focus-visible:outline-violet-600">
        {nodes}
      </div>
    </section>
  )
}
