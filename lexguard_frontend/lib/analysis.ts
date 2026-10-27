import { AnalysisResponseSchema, type AnalysisResponse } from "./analysis-contract"

export type Report = AnalysisResponse & { fileName: string; analyzedAt: string }

export function parseAnalysis(value: unknown): AnalysisResponse {
  const result = AnalysisResponseSchema.parse(value)
  const characters = Array.from(result.extracted_text)
  if (result.coverage.analyzed_characters !== characters.length || result.coverage.total_characters !== characters.length) {
    throw new Error("Invalid document coverage")
  }
  const ids = new Set<string>()
  for (const clause of result.clauses) {
    if (clause.source_end <= clause.source_start || clause.source_end > characters.length ||
        characters.slice(clause.source_start, clause.source_end).join("") !== clause.original_clause ||
        ids.has(clause.clause_id)) throw new Error("Invalid source evidence")
    ids.add(clause.clause_id)
  }
  if ((result.provider_used === "demo") !== result.is_demo) throw new Error("Invalid report provenance")
  return result
}

export function reportMarkdown(report: Report): string {
  const lines = [
    "# LEXGUARD contract review", "", report.is_demo ? "**SAMPLE REPORT**" : "**AI-assisted review**",
    "", "Document: " + report.fileName, "Generated: " + report.analyzedAt, "Report ID: " + report.request_id,
    "Provider: " + report.provider_used, "Risk estimate: " + report.overall_risk_score + "/100",
    "Fairness estimate: " + report.fairness_score + "/100",
    "Reviewing party: " + report.context.reviewing_party, "Jurisdiction: " + report.context.jurisdiction,
    "Contract type: " + report.context.contract_type, "", report.summary, "",
    "Coverage: all " + report.coverage.analyzed_characters + " extracted characters across " + report.coverage.batches + " analysis section(s).", "",
    ...report.warnings.map(w => "Notice: " + w), "", "## Findings", "",
  ]
  for (const clause of report.clauses) {
    lines.push("### " + clause.clause_type + " — " + clause.severity + " (" + clause.risk_score + "/10)", "",
      "Source: " + (clause.source_page ? "page " + clause.source_page : "character " + (clause.source_start + 1)), "",
      ...clause.original_clause.split("\n").map(line => "> " + line), "", clause.plain_english, "",
      "Potential risk: " + clause.why_risky, "Possible impact: " + clause.real_world_impact,
      "Negotiation suggestion: " + clause.negotiation_tip, "Affected party: " + clause.affected_party,
      "Model confidence estimate: " + clause.confidence_score + "% (uncalibrated)", "")
  }
  if (!report.clauses.length) lines.push("No source-grounded findings were returned. This does not establish that the agreement is safe to sign.")
  return lines.join("\n").replace(/&/g, "&amp;").replace(/</g, "&lt;")
}

export function negotiationDraft(report: Report): string {
  const suggestions = report.clauses.map(c => "- " + c.clause_type + ": " + c.negotiation_tip).join("\n")
  return "Subject: Proposed revisions to " + report.fileName + "\n\nHi [Name],\n\nFollowing my review, I would like to discuss the following proposed changes:\n\n" +
    (suggestions || "[Add the terms you would like to discuss.]") +
    "\n\nCould we review these points together and agree on balanced wording?\n\nBest regards,\n[Your name]"
}

export function downloadReport(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
