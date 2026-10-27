"use client"

import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { ClauseCard } from "./clause-card"
import { ContractViewer } from "./contract-viewer"
import { downloadReport, negotiationDraft, reportMarkdown, type Report } from "@/lib/analysis"

export type { AnalysisResponse as BackendAnalysisResponse } from "@/lib/analysis-contract"

export function ResultsDashboard({ result, onBack }: { result: Report; onBack: () => void }) {
  const [query, setQuery] = useState("")
  const [severity, setSeverity] = useState("all")
  const [category, setCategory] = useState("all")
  const [active, setActive] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [draft, setDraft] = useState<string | null>(null)
  const [tab, setTab] = useState<"findings" | "document">("findings")
  const findings = useMemo(() => {
    const search = query.trim().toLowerCase()
    return result.clauses.filter(c =>
      (severity === "all" || c.severity === severity) && (category === "all" || c.clause_type === category) &&
      (!search || [c.original_clause, c.plain_english, c.why_risky, c.negotiation_tip].some(text => text.toLowerCase().includes(search))),
    )
  }, [result.clauses, query, severity, category])

  const selectFinding = useCallback((id: string) => {
    setQuery(""); setCategory("all"); setSeverity("all")
    setExpanded(previous => new Set(previous).add(id))
    setActive(id)
    setTab("findings")
    requestAnimationFrame(() => { const finding = document.getElementById("finding-" + id); finding?.scrollIntoView({ block: "center", behavior: "instant" }); finding?.focus({ preventScroll: true }) })
  }, [])
  function toggle(id: string) {
    setExpanded(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }
  async function copyDraft() {
    try { await navigator.clipboard.writeText(draft || ""); toast.success("Email template copied") }
    catch { toast.error("Copy was unavailable. Select the email text and copy it manually.") }
  }
  function source(id: string) { setActive(id); setTab("document"); requestAnimationFrame(() => document.querySelector<HTMLElement>('#document-panel [tabindex="0"]')?.focus({ preventScroll: true })) }
  const button = "rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-900 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-violet-600"
  const stem = "lexguard-" + result.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80)

  return (
    <div className="relative max-w-[1500px] mx-auto p-4 md:p-8">
      <div className="no-print">
        <header className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="min-w-0">
            <button type="button" onClick={onBack} className={button}>Review another contract</button>
            <h1 className="mt-5 text-2xl md:text-3xl font-bold text-slate-900 break-all">{result.fileName}</h1>
            <p className="text-sm text-slate-600 mt-2">{new Date(result.analyzedAt).toLocaleString()} · {result.provider_used === "demo" ? "Illustrative sample" : "Provider: " + result.provider_used}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={button} onClick={() => downloadReport(reportMarkdown(result), stem + ".md", "text/markdown;charset=utf-8")}>Download report</button>
            <button type="button" className={button} onClick={() => downloadReport(JSON.stringify(result, null, 2), stem + ".json", "application/json")}>Export JSON</button>
            <button type="button" className={button} onClick={() => window.print()}>Print / Save PDF</button>
          </div>
        </header>

        {result.is_demo && <div role="status" className="p-4 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 mb-5 font-semibold">Sample report · These findings belong to the included sample agreement. No uploaded document was analyzed.</div>}
        <section aria-label="Review summary" className="bg-white/85 border border-violet-100 rounded-2xl p-6 mb-6">
          <div className="grid sm:grid-cols-3 gap-5 mb-5">
            <div><h2 className="text-sm text-slate-600">Overall risk estimate</h2><p className="text-3xl font-bold text-slate-900">{result.overall_risk_score}<span className="text-base text-slate-500"> / 100</span></p><p className="text-sm capitalize">{result.overall_verdict.replace("-", " ")}</p></div>
            <div><h2 className="text-sm text-slate-600">Fairness estimate</h2><p className="text-3xl font-bold text-slate-900">{result.fairness_score}<span className="text-base text-slate-500"> / 100</span></p><p className="text-sm text-slate-600">Higher indicates more balance</p></div>
            <div><h2 className="text-sm text-slate-600">Review coverage</h2><p className="font-semibold text-slate-900">All extracted text submitted</p><p className="text-sm text-slate-600">{result.coverage.analyzed_characters.toLocaleString()} characters · {result.coverage.batches} section(s){result.coverage.total_pages > 0 ? " · " + result.coverage.total_pages + " pages" : ""}</p></div>
          </div>
          <p className="text-slate-700">{result.summary}</p>
          <dl className="grid sm:grid-cols-3 gap-3 mt-5 text-sm">
            <div><dt className="text-slate-500">Reviewing party</dt><dd>{result.context.reviewing_party}</dd></div>
            <div><dt className="text-slate-500">Jurisdiction</dt><dd>{result.context.jurisdiction}</dd></div>
            <div><dt className="text-slate-500">Contract type</dt><dd>{result.context.contract_type}</dd></div>
          </dl>
          <div className="grid sm:grid-cols-5 gap-3 mt-5">
            {Object.entries(result.risk_breakdown).map(([name, score]) => <div key={name} className="bg-violet-50 rounded-xl p-3">
              <p className="text-xs capitalize text-slate-600">{name === "ip" ? "Intellectual property" : name} risk</p>
              <p className="font-semibold text-slate-900">{score}/100</p>
            </div>)}
          </div>
        </section>

        <details className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6" open>
          <summary className="font-semibold text-amber-950 cursor-pointer">Review scope and limitations</summary>
          <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-amber-950">{result.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul>
          <p className="text-xs mt-3">Reference: {result.request_id}{result.fallback_triggered ? " · A fallback AI provider was used." : ""}</p>
        </details>

        <div role="group" aria-label="Review panels" className="lg:hidden flex gap-2 mb-5">
          <button aria-pressed={tab === "findings"} aria-controls="findings-panel" id="findings-tab" onClick={() => setTab("findings")} className={button}>Findings</button>
          <button aria-pressed={tab === "document"} aria-controls="document-panel" id="document-tab" onClick={() => setTab("document")} className={button}>Source document</button>
        </div>
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <div id="document-panel" className={(tab === "document" ? "" : "hidden ") + "lg:block lg:sticky lg:top-5"}>
            <ContractViewer extractedText={result.extracted_text} clauses={result.clauses} activeClauseId={active} onSelect={selectFinding} />
          </div>
          <section id="findings-panel" aria-label="Contract findings" className={(tab === "findings" ? "" : "hidden ") + "lg:block space-y-4"}>
            <h2 className="text-xl font-bold text-slate-900">Findings</h2>
            <div className="bg-white/80 border border-violet-100 rounded-xl p-4 grid sm:grid-cols-2 gap-3">
              <label className="text-sm sm:col-span-2">Search findings
                <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search clauses, risks, or suggestions"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5" />
              </label>
              <label className="text-sm">Severity<select value={severity} onChange={event => setSeverity(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 bg-white">
                <option value="all">All severities</option>{["critical", "high", "medium", "low"].map(value => <option key={value}>{value}</option>)}
              </select></label>
              <label className="text-sm">Domain<select value={category} onChange={event => setCategory(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 bg-white">
                <option value="all">All domains</option>{["Employment", "Privacy", "Financial", "Intellectual Property", "Fairness"].map(value => <option key={value}>{value}</option>)}
              </select></label>
              <p role="status" className="text-sm text-slate-600 sm:col-span-2">{findings.length} of {result.clauses.length} findings shown</p>
            </div>
            {findings.map(clause => <ClauseCard key={clause.clause_id} clause={clause} expanded={expanded.has(clause.clause_id)}
              onToggle={() => toggle(clause.clause_id)} onSource={() => source(clause.clause_id)} />)}
            {!findings.length && <p className="bg-white p-5 rounded-xl text-slate-700">{result.clauses.length ? "No findings match these filters." : "No source-grounded findings were returned. This does not establish that the agreement is safe to sign."}</p>}
          </section>
        </div>

        <section className="mt-8 rounded-2xl p-6 bg-white/80 border border-violet-100">
          <h2 className="text-xl font-bold text-slate-900">Prepare for negotiation</h2>
          <p className="text-sm text-slate-600 mt-2 mb-4">Create an editable email template using this report’s negotiation suggestions. Review and adapt it before sending.</p>
          {draft === null ? <button type="button" className={button} onClick={() => setDraft(negotiationDraft(result))}>Prepare email template</button> : <>
            <label className="block text-sm font-semibold mb-2" htmlFor="negotiation-email">Your email draft</label>
            <textarea id="negotiation-email" value={draft} onChange={event => setDraft(event.target.value)} rows={14} className="w-full border border-slate-300 rounded-xl p-4 text-sm leading-7" />
            <div className="flex gap-2 mt-3">
              <button type="button" className={button} onClick={copyDraft}>Copy draft</button>
              <button type="button" className={button} onClick={() => downloadReport(draft, stem + "-negotiation.txt", "text/plain;charset=utf-8")}>Download draft</button>
            </div>
          </>}
        </section>
      </div>

      <section className="report-print hidden print:block">
        <h1>LEXGUARD · {result.is_demo ? "Sample contract report" : "AI-assisted contract report"}</h1>
        <p>Document: {result.fileName}</p><p>Generated: {result.analyzedAt} · Provider: {result.provider_used} · Reference: {result.request_id}</p>
        <p>Reviewing party: {result.context.reviewing_party} · Jurisdiction: {result.context.jurisdiction} · Type: {result.context.contract_type}</p>
        <p>Risk estimate: {result.overall_risk_score}/100 · Fairness estimate: {result.fairness_score}/100</p>
        <p>All {result.coverage.analyzed_characters} extracted characters submitted in {result.coverage.batches} section(s).</p>
        <p>{result.summary}</p>
        <h2>Scope and limitations</h2><ul>{result.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul>
        <h2>All findings ({result.clauses.length})</h2>
        {!result.clauses.length && <p>No findings returned. This does not establish that the contract is safe to sign.</p>}
        {result.clauses.map(clause => <article key={clause.clause_id} className="print-finding">
          <h3>{clause.clause_type} · {clause.severity} · Risk {clause.risk_score}/10</h3>
          <p>Source: {clause.source_page ? "page " + clause.source_page : "character " + (clause.source_start + 1)}</p>
          <blockquote>{clause.original_clause}</blockquote><p>{clause.plain_english}</p>
          <p><strong>Potential risk:</strong> {clause.why_risky}</p><p><strong>Possible impact:</strong> {clause.real_world_impact}</p>
          <p><strong>Negotiation suggestion:</strong> {clause.negotiation_tip}</p>
          <p>Affected party: {clause.affected_party} · Model confidence estimate: {clause.confidence_score}% (uncalibrated)</p>
        </article>)}
      </section>
    </div>
  )
}
