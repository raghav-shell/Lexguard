"use client"

import { useState, useCallback, useRef } from "react"
import { AnimatedBackground } from "@/components/lexguard/animated-background"
import { Navbar } from "@/components/lexguard/navbar"
import { HeroSection } from "@/components/lexguard/hero-section"
import { UploadZone } from "@/components/lexguard/upload-zone"
import { AnalysisOverlay } from "@/components/lexguard/analysis-overlay"
import { ResultsDashboard } from "@/components/lexguard/results-dashboard"
import { FeaturesSection } from "@/components/lexguard/features-section"
import type { ClauseData } from "@/components/lexguard/clause-card"
import type { VerdictLevel } from "@/components/lexguard/verdict-panel"

// Mock analysis result for demo
const mockAnalysisResult = {
  fileName: "Employment_Agreement_2024.pdf",
  analyzedAt: new Date(),
  verdict: "high-risk" as VerdictLevel,
  riskScore: 72,
  summary: "This employment agreement contains several clauses that significantly favor the employer. The non-compete clause is overly broad, the arbitration terms limit your legal options, and the intellectual property assignment extends beyond work-related creations. We recommend negotiating these terms before signing.",
  clauses: [
    {
      id: "1",
      type: "Non-Compete",
      severity: "critical" as const,
      title: "Overly Broad Non-Compete Clause",
      explanation: "The non-compete clause restricts you from working in any related industry for 3 years within a 500-mile radius. This is exceptionally broad and may not be enforceable in many jurisdictions.",
      consequence: "You could be prevented from finding similar employment for 3 years after leaving, severely limiting your career options and income potential.",
      recommendation: "Request reduction to 1 year and limit scope to direct competitors only. Many courts find 3-year restrictions unreasonable.",
    },
    {
      id: "2",
      type: "Arbitration",
      severity: "high" as const,
      title: "Mandatory Binding Arbitration",
      explanation: "This clause requires all disputes to be resolved through binding arbitration selected by the employer, waiving your right to a jury trial or class action.",
      consequence: "If a dispute arises, you cannot sue in court. The arbitrator is chosen from a list provided by the employer, potentially creating bias.",
      recommendation: "Request mutual selection of arbitrator from a neutral organization like AAA or JAMS, or strike this clause entirely.",
    },
    {
      id: "3",
      type: "Intellectual Property",
      severity: "high" as const,
      title: "Broad IP Assignment",
      explanation: "The agreement assigns all intellectual property created during employment to the company, including work done outside of office hours on personal projects.",
      consequence: "Any side projects, inventions, or creative works you develop—even in your free time—could legally belong to your employer.",
      recommendation: "Add an exception for work done outside business hours that doesn't relate to company business or use company resources.",
    },
    {
      id: "4",
      type: "Termination",
      severity: "medium" as const,
      title: "At-Will Termination Without Severance",
      explanation: "The employer can terminate employment at any time for any reason with no severance pay, while you must provide 4 weeks notice.",
      consequence: "You could lose your job without warning and without any financial cushion, while being bound to give advance notice if you resign.",
      recommendation: "Negotiate for mutual notice requirements and minimum 2-4 weeks severance for terminations without cause.",
    },
    {
      id: "5",
      type: "Liability",
      severity: "medium" as const,
      title: "Personal Liability for Company Decisions",
      explanation: "Section 12.3 states employees may be held personally liable for business decisions made within their role.",
      consequence: "You could be sued personally for decisions made as part of your job duties, even if following company policy.",
      recommendation: "Request addition of indemnification clause protecting you from personal liability for good-faith job-related decisions.",
    },
    {
      id: "6",
      type: "Jurisdiction",
      severity: "low" as const,
      title: "Distant Jurisdiction Clause",
      explanation: "All legal disputes must be filed in Delaware courts, regardless of where you work or reside.",
      consequence: "If you need to pursue legal action, you'd need to travel to Delaware and hire local counsel, increasing costs significantly.",
      recommendation: "Request jurisdiction in your state of residence or where you perform work.",
    },
  ] as ClauseData[],
  stats: {
    totalClauses: 24,
    criticalCount: 1,
    highRiskCount: 2,
    mediumRiskCount: 2,
    lowRiskCount: 1,
  },
}

type AppState = "landing" | "analyzing" | "results"

export default function LexguardPage() {
  const [appState, setAppState] = useState<AppState>("landing")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const uploadRef = useRef<HTMLDivElement>(null)

  const handleUploadClick = useCallback(() => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleFileUpload = useCallback((file: File) => {
    setUploadedFile(file)
    setAppState("analyzing")
  }, [])

  const handleAnalysisComplete = useCallback(() => {
    setAppState("results")
  }, [])

  const handleBack = useCallback(() => {
    setAppState("landing")
    setUploadedFile(null)
  }, [])

  return (
    <main className="relative min-h-screen">
      <AnimatedBackground />
      
      {appState === "landing" && (
        <>
          <Navbar />
          <HeroSection onUploadClick={handleUploadClick} />
          <div ref={uploadRef}>
            <UploadZone 
              onFileUpload={handleFileUpload} 
              isAnalyzing={appState === "analyzing"} 
            />
          </div>
          <FeaturesSection />
        </>
      )}

      {appState === "results" && (
        <ResultsDashboard 
          result={{
            ...mockAnalysisResult,
            fileName: uploadedFile?.name || mockAnalysisResult.fileName,
            analyzedAt: new Date(),
          }}
          onBack={handleBack}
        />
      )}

      <AnalysisOverlay 
        isVisible={appState === "analyzing"} 
        onComplete={handleAnalysisComplete}
      />
    </main>
  )
}
