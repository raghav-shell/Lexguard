"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { FileText, MousePointer2 } from "lucide-react";
import type { ClauseAnalysis } from "@/lib/analysis-contract";

interface Props {
  extractedText: string;
  clauses: ClauseAnalysis[];
  activeClauseId: string | null;
  onSelect?: (id: string) => void;
}

const colors = {
  low: "risk-low",
  medium: "risk-medium",
  high: "risk-high",
  critical: "risk-critical",
};

export function ContractViewer({
  extractedText,
  clauses,
  activeClauseId,
  onSelect,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const nodes = useMemo(() => {
    // API offsets count Unicode code points, not JavaScript UTF-16 code units.
    const characters = Array.from(extractedText);
    const boundaries = new Set([0, characters.length]);
    const grounded = clauses.filter(
      (c) =>
        c.source_start >= 0 &&
        c.source_end <= characters.length &&
        characters.slice(c.source_start, c.source_end).join("") ===
          c.original_clause,
    );
    for (const clause of grounded) {
      boundaries.add(clause.source_start);
      boundaries.add(clause.source_end);
    }
    const points = [...boundaries].sort((a, b) => a - b);
    const result: ReactNode[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i],
        end = points[i + 1];
      const text = characters.slice(start, end).join("");
      const matches = grounded.filter(
        (c) => c.source_start <= start && c.source_end >= end,
      );
      const active = matches.find((c) => c.clause_id === activeClauseId);
      const clause =
        active || matches.sort((a, b) => b.risk_score - a.risk_score)[0];
      if (!clause) result.push(text);
      else
        result.push(
          <button
            key={start}
            type="button"
            data-clause-id={clause.clause_id}
            aria-label={"View " + clause.clause_type + " finding"}
            onClick={() => onSelect?.(clause.clause_id)}
            className={
              colors[clause.severity] +
              " rounded px-0.5 text-left whitespace-pre-wrap inline focus-visible:outline-2 " +
              (active ? "source-active" : "")
            }
          >
            {text}
          </button>,
        );
    }
    return result;
  }, [extractedText, clauses, activeClauseId, onSelect]);

  useEffect(() => {
    if (!activeClauseId) return;
    const target = [
      ...(container.current?.querySelectorAll<HTMLElement>(
        "[data-clause-id]",
      ) || []),
    ].find((element) => element.dataset.clauseId === activeClauseId);
    target?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [activeClauseId]);

  return (
    <section aria-label="Extracted contract text" className="source-viewer">
      <div className="source-heading">
        <div>
          <FileText size={17} strokeWidth={1.5} aria-hidden="true" />
          <div>
            <h2>Source document</h2>
            <p>Extracted text · Select a highlight to inspect its finding</p>
          </div>
        </div>
        <MousePointer2 size={14} aria-hidden="true" />
      </div>
      <div
        ref={container}
        tabIndex={0}
        aria-label="Scrollable source text"
        className="source-document"
      >
        {nodes}
      </div>
    </section>
  );
}
