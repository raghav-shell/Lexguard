"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { MotionConfig } from "framer-motion"
import { AnimatedBackground } from "@/components/lexguard/animated-background"
import { Navbar } from "@/components/lexguard/navbar"
import { HeroSection } from "@/components/lexguard/hero-section"
import { UploadZone } from "@/components/lexguard/upload-zone"
import { AnalysisOverlay } from "@/components/lexguard/analysis-overlay"
import { FeaturesSection } from "@/components/lexguard/features-section"
import { API_BASE_URL, uploadError } from "@/lib/config"
import { parseAnalysis, type Report } from "@/lib/analysis"
import type { ReviewContext } from "@/lib/analysis-contract"

const ResultsDashboard = dynamic(() => import("@/components/lexguard/results-dashboard").then(module => module.ResultsDashboard))
type Problem = { message: string; requestId?: string }

export default function LexguardPage() {
  const [report, setReport] = useState<Report | null>(null)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<Problem | null>(null)
  const request = useRef<AbortController | null>(null)
  const mounted = useRef(true)
  const upload = useRef<HTMLDivElement>(null)
  const errorPanel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false; request.current?.abort() }
  }, [])
  useEffect(() => { if (problem) errorPanel.current?.focus() }, [problem])

  const cancel = useCallback(() => {
    request.current?.abort()
    request.current = null
    setBusy(false)
  }, [])
  const showUpload = useCallback(() => upload.current?.scrollIntoView({ behavior: "instant" }), [])
  const showDemo = useCallback(async () => {
    setProblem(null)
    const sample = await import("@/lib/demo-analysis.json")
    setReport({ ...parseAnalysis(sample.default), fileName: "Sample employment agreement", analyzedAt: new Date().toISOString() })
    window.scrollTo(0, 0)
  }, [])

  const analyze = useCallback(async (file: File, context: ReviewContext) => {
    const invalid = uploadError(file)
    if (invalid) { setProblem({ message: invalid }); return }
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    let timedOut = false
    const timer = setTimeout(() => { timedOut = true; controller.abort() }, 210000)
    setProblem(null)
    setBusy(true)
    try {
      const body = new FormData()
      body.append("file", file)
      for (const [key, value] of Object.entries(context)) body.append(key, value)
      const response = await fetch(API_BASE_URL + "/analyze-contract", { method: "POST", body, signal: controller.signal })
      const value: unknown = await response.json()
      if (!response.ok) {
        const error = value as { error?: { message?: unknown; request_id?: unknown } }
        throw Object.assign(new Error(typeof error.error?.message === "string" ? error.error.message : "The analysis could not be completed. Please retry."),
          { requestId: typeof error.error?.request_id === "string" ? error.error.request_id : undefined })
      }
      let result
      try { result = parseAnalysis(value) }
      catch { throw new Error("The server returned an invalid or unverified report. Please retry or contact the operator.") }
      if (mounted.current && request.current === controller && !controller.signal.aborted) {
        setReport({ ...result, fileName: file.name, analyzedAt: new Date().toISOString() })
        window.scrollTo(0, 0)
      }
    } catch (error) {
      if (!mounted.current || request.current !== controller) return
      if (timedOut) setProblem({ message: "The review took too long. Try a smaller document or retry later." })
      else if (!controller.signal.aborted) {
        const message = error instanceof Error ? error.message : "Unable to complete the review."
        const requestId = error instanceof Error && "requestId" in error ? String(error.requestId || "") : undefined
        setProblem({ message: message.includes("Failed to fetch") ? "Cannot reach the review service. Check your connection and retry." : message.includes("validation") ? "The server returned an invalid report. Please retry or contact the operator." : message, requestId })
      }
    } finally {
      clearTimeout(timer)
      if (mounted.current && request.current === controller) { setBusy(false); request.current = null }
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-screen">
        <div className="no-print" aria-hidden="true"><AnimatedBackground /></div>
        <div inert={busy}>
          {report ? <ResultsDashboard result={report} onBack={() => { setReport(null); setProblem(null); window.scrollTo(0, 0) }} /> : <>
            <Navbar onUploadClick={showUpload} onDemoClick={showDemo} />
            <HeroSection onUploadClick={showUpload} onDemoClick={showDemo} />
            <div ref={upload}>
              {problem && <div ref={errorPanel} tabIndex={-1} role="alert" className="relative max-w-3xl mx-6 md:mx-auto p-6 mt-8 rounded-xl border border-rose-200 bg-rose-50 text-rose-950">
                <h2 className="font-semibold">Review could not be completed</h2>
                <p className="mt-2">{problem.message}</p>
                {problem.requestId && <p className="text-xs mt-2">Reference: {problem.requestId}</p>}
              </div>}
              <UploadZone onFileUpload={analyze} isAnalyzing={busy} />
            </div>
            <FeaturesSection />
            <footer className="relative text-center p-8 text-sm text-slate-600">LEXGUARD · AI-assisted contract review · Verify important terms before signing.</footer>
          </>}
        </div>
        {busy && <AnalysisOverlay onCancel={cancel} />}
      </main>
    </MotionConfig>
  )
}
