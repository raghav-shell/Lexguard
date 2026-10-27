import React from "react"
import { describe, expect, it, vi, afterEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ResultsDashboard } from "@/components/lexguard/results-dashboard"
import Page from "@/app/page"
import demo from "@/lib/demo-analysis.json"

vi.mock("next/dynamic", () => ({ default: () => ResultsDashboard }))
vi.mock("@/components/lexguard/animated-background", () => ({ AnimatedBackground: () => null }))
vi.mock("@/components/lexguard/hero-section", () => ({ HeroSection: () => null }))
vi.mock("@/components/lexguard/features-section", () => ({ FeaturesSection: () => null }))

afterEach(() => vi.unstubAllGlobals())
const upload = async () => {
  const user = userEvent.setup()
  await user.upload(screen.getByLabelText("Contract document"), new File(["contract"], "service.pdf", { type: "application/pdf" }))
  await user.click(screen.getByRole("button", { name: "Start contract review" }))
  return user
}

describe("upload to report flow", () => {
  it("renders a validated report from the upload response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ ...demo, provider_used: "gemini", is_demo: false })))
    vi.stubGlobal("scrollTo", vi.fn())
    render(<Page />)
    await upload()
    expect(await screen.findByRole("heading", { name: "service.pdf" })).toBeTruthy()
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.queryByText(/Sample report ·/)).toBeNull()
  })
  it("shows actionable backend errors without displaying a fabricated report", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: { code: "no_readable_text", message: "Run OCR first.", request_id: "test-reference" } }, { status: 422 })))
    render(<Page />)
    await upload()
    expect(await screen.findByText("Run OCR first.")).toBeTruthy()
    expect(screen.queryByRole("heading", { name: "service.pdf" })).toBeNull()
    expect(screen.getByText("Reference: test-reference")).toBeTruthy()
  })
  it("cancels the request and ignores its late response", async () => {
    let resolve!: (value: Response) => void
    const response = new Promise<Response>(done => { resolve = done })
    const fetcher = vi.fn().mockReturnValue(response)
    vi.stubGlobal("fetch", fetcher)
    render(<Page />)
    const user = await upload()
    await user.click(screen.getByRole("button", { name: "Cancel review" }))
    expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true)
    resolve(Response.json(demo))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(screen.queryByRole("heading", { name: "service.pdf" })).toBeNull()
  })
})
