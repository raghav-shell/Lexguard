"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCheck,
  ChevronRight,
  CircleHelp,
  Clipboard,
  Download,
  FileJson,
  ListFilter,
  MessageSquareText,
  Printer,
  ScanSearch,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Brand } from "./brand";
import { ClauseCard } from "./clause-card";
import { ContractViewer } from "./contract-viewer";
import {
  downloadReport,
  negotiationDraft,
  reportMarkdown,
  type Report,
} from "@/lib/analysis";

export type { AnalysisResponse as BackendAnalysisResponse } from "@/lib/analysis-contract";

export function ResultsDashboard({
  result,
  onBack,
}: {
  result: Report;
  onBack: () => void;
}) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [category, setCategory] = useState("all");
  const [active, setActive] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<string | null>(null);
  const [tab, setTab] = useState<"findings" | "document">("findings");
  const findings = useMemo(() => {
    const search = query.trim().toLowerCase();
    return result.clauses.filter(
      (c) =>
        (severity === "all" ||
          (severity === "priority"
            ? c.risk_score >= 7
            : c.severity === severity)) &&
        (category === "all" || c.clause_type === category) &&
        (!search ||
          [
            c.original_clause,
            c.plain_english,
            c.why_risky,
            c.negotiation_tip,
          ].some((text) => text.toLowerCase().includes(search))),
    );
  }, [result.clauses, query, severity, category]);
  const priorityCount = result.clauses.filter(
    (clause) => clause.risk_score >= 7,
  ).length;
  const hasFilters =
    query.trim() !== "" || severity !== "all" || category !== "all";
  const riskLevel =
    result.overall_risk_score >= 85
      ? "critical"
      : result.overall_risk_score >= 65
        ? "high"
        : result.overall_risk_score >= 35
          ? "medium"
          : "low";
  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setSeverity("all");
  };
  const selectFinding = useCallback((id: string) => {
    setQuery("");
    setCategory("all");
    setSeverity("all");
    setExpanded((previous) => new Set(previous).add(id));
    setActive(id);
    setTab("findings");
    requestAnimationFrame(() => {
      const finding = document.getElementById("finding-" + id);
      finding?.scrollIntoView({ block: "center", behavior: "instant" });
      finding?.focus({ preventScroll: true });
    });
  }, []);
  function toggle(id: string) {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft || "");
      toast.success("Email template copied");
    } catch {
      toast.error(
        "Copy was unavailable. Select the email text and copy it manually.",
      );
    }
  }
  function source(id: string) {
    setActive(id);
    setTab("document");
    requestAnimationFrame(() => {
      const panel = document.querySelector<HTMLElement>(
        '#document-panel [tabindex="0"]',
      );
      panel?.focus({ preventScroll: true });
      if (window.matchMedia("(max-width: 800px)").matches)
        panel?.scrollIntoView({ block: "center", behavior: "instant" });
    });
  }
  const stem =
    "lexguard-" + result.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);

  return (
    <div className="workspace">
      <div className="no-print">
        <nav className="workspace-nav" aria-label="Review navigation">
          <div className="workspace-nav-left">
            <button type="button" onClick={onBack} aria-label="Lexguard home">
              <Brand />
            </button>
            <span className="workspace-nav-label">Your review workspace</span>
          </div>
          <button
            type="button"
            className="button button-secondary button-small"
            onClick={onBack}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Review another contract
          </button>
        </nav>
        <div className="workspace-inner">
          <header className="report-heading">
            <div>
              <p className="eyebrow">YOUR CONTRACT, IN PERSPECTIVE</p>
              <h1>{result.fileName}</h1>
              <div className="report-meta">
                <span>
                  <CheckCheck size={13} aria-hidden="true" />
                  {result.is_demo ? "Illustrative sample" : "Review complete"}
                </span>
                <span>{new Date(result.analyzedAt).toLocaleString()}</span>
                <span>
                  {result.provider_used === "demo"
                    ? "Included example agreement"
                    : "Provider: " + result.provider_used}
                </span>
              </div>
            </div>
            <div className="report-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() =>
                  downloadReport(
                    reportMarkdown(result),
                    stem + ".md",
                    "text/markdown;charset=utf-8",
                  )
                }
              >
                <Download size={14} aria-hidden="true" />
                Download report
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() =>
                  downloadReport(
                    JSON.stringify(result, null, 2),
                    stem + ".json",
                    "application/json",
                  )
                }
              >
                <FileJson size={14} aria-hidden="true" />
                Export JSON
              </button>
              <button
                type="button"
                className="button button-dark"
                onClick={() => window.print()}
              >
                <Printer size={14} aria-hidden="true" />
                Print / Save PDF
              </button>
            </div>
          </header>
          {result.is_demo && (
            <div role="status" className="sample-notice">
              <CircleHelp size={15} aria-hidden="true" />
              <p>
                <strong>Sample report · </strong>These findings belong to the
                included sample agreement. No uploaded document was analyzed.
              </p>
            </div>
          )}
          <section aria-label="Review summary" className="summary-layout">
            <div className="summary-card summary-main">
              <h2 className="mini-label">OVERALL RISK ESTIMATE</h2>
              <div className="risk-number">
                <p className="risk-value">
                  {result.overall_risk_score}
                  <small>/ 100</small>
                </p>
                <span className={"risk-label risk-" + riskLevel}>
                  {result.overall_verdict.replaceAll("-", " ")}
                </span>
              </div>
              <p>
                {priorityCount
                  ? priorityCount +
                    " high or critical " +
                    (priorityCount === 1
                      ? "finding deserves"
                      : "findings deserve") +
                    " a closer look."
                  : "Read the findings and source text before deciding your next step."}
              </p>
            </div>
            <div className="summary-card">
              <div className="summary-card-icon">
                <h2 className="mini-label">FAIRNESS ESTIMATE</h2>
                <ShieldCheck size={17} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <p className="fairness-value">
                {result.fairness_score}
                <small> / 100</small>
              </p>
              <div className="metric-track" aria-hidden="true">
                <span style={{ width: result.fairness_score + "%" }} />
              </div>
              <p>Higher indicates more balanced terms.</p>
            </div>
            <div className="summary-card">
              <div className="summary-card-icon">
                <h2 className="mini-label">REVIEW COVERAGE</h2>
                <CheckCheck size={17} aria-hidden="true" />
              </div>
              <p className="coverage-value">All extracted text</p>
              <p>
                {result.coverage.analyzed_characters.toLocaleString()}{" "}
                characters · {result.coverage.batches} section(s)
                {result.coverage.total_pages > 0
                  ? " · " + result.coverage.total_pages + " pages"
                  : ""}
                <br />
                Extracted wording submitted for review.
              </p>
            </div>
          </section>
          <section
            className="report-summary"
            aria-label="Summary and review context"
          >
            <div className="report-summary-text">
              <h2>The big picture</h2>
              <p>{result.summary}</p>
              <dl className="review-context">
                <div>
                  <dt>Reviewing party</dt>
                  <dd>{result.context.reviewing_party}</dd>
                </div>
                <div>
                  <dt>Jurisdiction</dt>
                  <dd>{result.context.jurisdiction}</dd>
                </div>
                <div>
                  <dt>Contract type</dt>
                  <dd>{result.context.contract_type}</dd>
                </div>
              </dl>
            </div>
            <div className="risk-domains" aria-label="Risk estimates by domain">
              {Object.entries(result.risk_breakdown).map(([name, score]) => (
                <div className="risk-domain" key={name}>
                  <span>
                    {name === "ip"
                      ? "Intellectual property"
                      : name.charAt(0).toUpperCase() + name.slice(1)}
                  </span>
                  <div className="metric-track" aria-hidden="true">
                    <span
                      style={{
                        width: score + "%",
                        background: score >= 65 ? "#c89776" : "#9db77c",
                      }}
                    />
                  </div>
                  <span aria-label={score + " out of 100"}>{score}</span>
                </div>
              ))}
            </div>
          </section>
          <details className="scope-note">
            <summary>
              <CircleHelp size={14} aria-hidden="true" />
              AI estimates need your judgment. Read the review scope and
              limitations.
            </summary>
            <ul>
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
            <p>
              Reference: {result.request_id}
              {result.fallback_triggered
                ? " · A fallback AI provider was used."
                : ""}
            </p>
          </details>
          <div role="group" aria-label="Review panels" className="panel-switch">
            <button
              type="button"
              aria-pressed={tab === "findings"}
              aria-controls="findings-panel"
              id="findings-tab"
              onClick={() => setTab("findings")}
            >
              Findings ({result.clauses.length})
            </button>
            <button
              type="button"
              aria-pressed={tab === "document"}
              aria-controls="document-panel"
              id="document-tab"
              onClick={() => setTab("document")}
            >
              Source document
            </button>
          </div>
          <div className="review-grid">
            <div
              id="document-panel"
              className={
                "document-column" +
                (tab === "document" ? "" : " mobile-panel-hidden")
              }
            >
              <ContractViewer
                extractedText={result.extracted_text}
                clauses={result.clauses}
                activeClauseId={active}
                onSelect={selectFinding}
              />
            </div>
            <section
              id="findings-panel"
              aria-label="Contract findings"
              className={
                "findings-column" +
                (tab === "findings" ? "" : " mobile-panel-hidden")
              }
            >
              <div className="findings-title">
                <h2>
                  What to look at
                  <span className="finding-count">{result.clauses.length}</span>
                </h2>
                <span>ESTIMATED RISKS</span>
              </div>
              <div className="finding-filters">
                <label className="search-field block">
                  <span className="sr-only">Search findings</span>
                  <Search size={15} aria-hidden="true" />
                  <input
                    className="field"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search clauses, risks, or suggestions"
                  />
                </label>
                <div className="filter-row">
                  <label>
                    <span className="sr-only">Severity</span>
                    <select
                      className="field"
                      value={severity}
                      onChange={(event) => setSeverity(event.target.value)}
                    >
                      <option value="all">All severities</option>
                      <option value="priority">High & critical only</option>
                      {["critical", "high", "medium", "low"].map((value) => (
                        <option key={value} value={value}>
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="sr-only">Domain</span>
                    <select
                      className="field"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                    >
                      <option value="all">All domains</option>
                      {[
                        "Employment",
                        "Privacy",
                        "Financial",
                        "Intellectual Property",
                        "Fairness",
                      ].map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="filter-status">
                  <p role="status">
                    {findings.length} of {result.clauses.length} findings shown
                  </p>
                  {hasFilters ? (
                    <button type="button" onClick={resetFilters}>
                      Clear filters
                    </button>
                  ) : (
                    <span className="flex items-center gap-1">
                      <ListFilter size={11} aria-hidden="true" />
                      Filter your focus
                    </span>
                  )}
                </div>
              </div>
              {findings.map((clause) => (
                <ClauseCard
                  key={clause.clause_id}
                  clause={clause}
                  expanded={expanded.has(clause.clause_id)}
                  onToggle={() => toggle(clause.clause_id)}
                  onSource={() => source(clause.clause_id)}
                />
              ))}
              {!findings.length && (
                <div className="empty-findings">
                  <ScanSearch size={28} strokeWidth={1.5} aria-hidden="true" />
                  <p>
                    {result.clauses.length
                      ? "No findings match these filters."
                      : "No source-grounded findings were returned. This does not establish that the agreement is safe to sign."}
                  </p>
                  {hasFilters && (
                    <button
                      type="button"
                      className="text-link"
                      onClick={resetFilters}
                    >
                      Show all findings{" "}
                      <ChevronRight size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>
          <section className="negotiation-section">
            <div className="negotiation-heading">
              <div>
                <span className="negotiation-symbol">
                  <MessageSquareText
                    size={22}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <h2>Make the next conversation a better one.</h2>
                  <p>
                    Turn this review’s suggestions into an editable email
                    template. Adapt the wording to your situation before
                    sending.
                  </p>
                </div>
              </div>
              {draft === null && (
                <button
                  type="button"
                  className="button button-dark"
                  onClick={() => setDraft(negotiationDraft(result))}
                >
                  Prepare email template{" "}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
              )}
            </div>
            {draft !== null && (
              <div className="email-draft">
                <label htmlFor="negotiation-email">Your email draft</label>
                <textarea
                  id="negotiation-email"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={14}
                />
                <div className="email-actions">
                  <button
                    type="button"
                    className="button button-dark button-small"
                    onClick={copyDraft}
                  >
                    <Clipboard size={14} aria-hidden="true" />
                    Copy draft
                  </button>
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={() =>
                      downloadReport(
                        draft,
                        stem + "-negotiation.txt",
                        "text/plain;charset=utf-8",
                      )
                    }
                  >
                    <Download size={14} aria-hidden="true" />
                    Download draft
                  </button>
                </div>
              </div>
            )}
          </section>
          <p className="workspace-footnote">
            LEXGUARD · A clearer starting point. AI-assisted review is not legal
            advice.
          </p>
        </div>
      </div>

      <section className="report-print hidden print:block">
        <h1>
          LEXGUARD ·{" "}
          {result.is_demo
            ? "Sample contract report"
            : "AI-assisted contract report"}
        </h1>
        <p>Document: {result.fileName}</p>
        <p>
          Generated: {result.analyzedAt} · Provider: {result.provider_used} ·
          Reference: {result.request_id}
        </p>
        <p>
          Reviewing party: {result.context.reviewing_party} · Jurisdiction:{" "}
          {result.context.jurisdiction} · Type: {result.context.contract_type}
        </p>
        <p>
          Risk estimate: {result.overall_risk_score}/100 · Fairness estimate:{" "}
          {result.fairness_score}/100
        </p>
        <p>
          All {result.coverage.analyzed_characters} extracted characters
          submitted in {result.coverage.batches} section(s).
        </p>
        <p>{result.summary}</p>
        <h2>Scope and limitations</h2>
        <ul>
          {result.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
        <h2>All findings ({result.clauses.length})</h2>
        {!result.clauses.length && (
          <p>
            No findings returned. This does not establish that the contract is
            safe to sign.
          </p>
        )}
        {result.clauses.map((clause) => (
          <article key={clause.clause_id} className="print-finding">
            <h3>
              {clause.clause_type} · {clause.severity} · Risk{" "}
              {clause.risk_score}/10
            </h3>
            <p>
              Source:{" "}
              {clause.source_page
                ? "page " + clause.source_page
                : "character " + (clause.source_start + 1)}
            </p>
            <blockquote>{clause.original_clause}</blockquote>
            <p>{clause.plain_english}</p>
            <p>
              <strong>Potential risk:</strong> {clause.why_risky}
            </p>
            <p>
              <strong>Possible impact:</strong> {clause.real_world_impact}
            </p>
            <p>
              <strong>Negotiation suggestion:</strong> {clause.negotiation_tip}
            </p>
            <p>
              Affected party: {clause.affected_party} · Model confidence
              estimate: {clause.confidence_score}% (uncalibrated)
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
