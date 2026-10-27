import React from "react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ContractViewer } from "@/components/lexguard/contract-viewer"
import { ResultsDashboard } from "@/components/lexguard/results-dashboard"
import { UploadZone } from "@/components/lexguard/upload-zone"
import { parseAnalysis, negotiationDraft, reportMarkdown, type Report } from "@/lib/analysis"
import { uploadError } from "@/lib/config"
import demo from "@/lib/demo-analysis.json"

const report = (): Report => ({ ...parseAnalysis(demo), fileName: "sample.docx", analyzedAt: "2026-10-27T00:00:00.000Z" })

describe("report boundary and source safety", () => {
  it("rejects malformed scores, fake coverage, and changed quotations", () => {
    expect(() => parseAnalysis({ ...demo, overall_risk_score: 999 })).toThrow()
    expect(() => parseAnalysis({ ...demo, coverage: { ...demo.coverage, analyzed_characters: 1 } })).toThrow()
    const changed = structuredClone(demo)
    changed.clauses[0].original_clause = "A fabricated clause."
    expect(() => parseAnalysis(changed)).toThrow()
  })
  it("renders malicious document markup as visible text", () => {
    const text = '<img src=x onerror="alert(1)"> No liability cap.'
    const { container } = render(<ContractViewer extractedText={text} clauses={[]} activeClauseId={null} />)
    expect(container.querySelector("img")).toBeNull()
    expect(screen.getByText(text)).toBeTruthy()
  })
  it("preserves Unicode source offsets and overlapping findings", () => {
    const text = "😀 No liability cap."
    const clause = { ...report().clauses[0], original_clause: "No liability cap.", source_start: 2, source_end: 19 }
    const { container } = render(<ContractViewer extractedText={text} clauses={[clause]} activeClauseId={clause.clause_id} />)
    expect(container.textContent).toContain(text)
    expect(screen.getByRole("button", { name: /View Employment finding/ }).textContent).toBe("No liability cap.")
  })
  it("exports every finding and labels sample provenance", () => {
    const value = report()
    expect(reportMarkdown(value)).toContain("SAMPLE REPORT")
    for (const clause of value.clauses) expect(reportMarkdown(value)).toContain(clause.negotiation_tip)
    expect(negotiationDraft(value)).toContain(value.clauses[0].negotiation_tip)
    expect(negotiationDraft(value)).not.toContain("attached")
    expect(reportMarkdown({ ...value, fileName: '<img src=x onerror="alert(1)">' })).not.toContain("<img")
  })
})

describe("review controls", () => {
  it("rejects unsupported, empty, and oversized uploads", () => {
    expect(uploadError({ name: "old.doc", size: 10 })).toMatch(/PDF or DOCX/)
    expect(uploadError({ name: "empty.pdf", size: 0 })).toMatch(/empty/)
    expect(uploadError({ name: "large.pdf", size: 11 * 1024 * 1024 })).toMatch(/less/)
    expect(uploadError({ name: "VALID.PDF", size: 10 })).toBeNull()
  })
  it("accepts one document with reviewer context", async () => {
    const user = userEvent.setup()
    let selected = ""
    render(<UploadZone isAnalyzing={false} onFileUpload={(file, context) => { selected = file.name + ":" + context.reviewing_party }} />)
    await user.upload(screen.getByLabelText("Contract document"), new File(["contract"], "service.pdf", { type: "application/pdf" }))
    await user.type(screen.getByLabelText("Your role or reviewing party"), "Supplier")
    await user.click(screen.getByRole("button", { name: "Start contract review" }))
    expect(selected).toBe("service.pdf:Supplier")
  })
  it("filters screen findings while the complete print report stays present", async () => {
    const user = userEvent.setup()
    const { container } = render(<ResultsDashboard result={report()} onBack={() => {}} />)
    await user.selectOptions(screen.getByLabelText("Domain"), "Privacy")
    expect(screen.getByText(/Sample report ·/)).toBeTruthy()
    expect(screen.getByText("No findings match these filters.")).toBeTruthy()
    expect(container.querySelectorAll(".report-print article")).toHaveLength(demo.clauses.length)
  })
  it("uses keyboard-accessible finding controls and an editable email", async () => {
    const user = userEvent.setup()
    render(<ResultsDashboard result={report()} onBack={() => {}} />)
    const button = screen.getAllByRole("button", { name: "Impact and negotiation" })[0]
    await user.click(button)
    expect(button.getAttribute("aria-expanded")).toBe("true")
    await user.click(screen.getByRole("button", { name: "Prepare email template" }))
    expect((screen.getByLabelText("Your email draft") as HTMLTextAreaElement).value).toContain("Subject:")
  })
})
