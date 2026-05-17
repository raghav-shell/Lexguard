"use client"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, WifiOff, Clock, FileX, RefreshCw, Sparkles } from "lucide-react"
import { AnimatedBackground } from "@/components/lexguard/animated-background"
import { Navbar } from "@/components/lexguard/navbar"
import { HeroSection } from "@/components/lexguard/hero-section"
import { UploadZone } from "@/components/lexguard/upload-zone"
import { AnalysisOverlay } from "@/components/lexguard/analysis-overlay"
import { ResultsDashboard, type BackendAnalysisResponse } from "@/components/lexguard/results-dashboard"
import { FeaturesSection } from "@/components/lexguard/features-section"
import { API_BASE_URL } from "@/lib/config"

type AppState = "landing" | "analyzing" | "results" | "error"
type ErrorType = "offline" | "timeout" | "file" | "server" | null

// ============================================================
// Glassmorphic Error State Component
// ============================================================
const errorConfig = {
  offline: {
    icon: WifiOff,
    title: "Connection Lost",
    message: "Unable to reach the LEXGUARD backend. Please ensure the server is running and try again.",
    color: "rose",
  },
  timeout: {
    icon: Clock,
    title: "Analysis Timed Out",
    message: "The AI took longer than expected. This is usually a temporary issue. Please try again.",
    color: "amber",
  },
  file: {
    icon: FileX,
    title: "Invalid Document",
    message: "Only PDF, DOC, and DOCX files under 10MB are supported. Please upload a valid contract.",
    color: "violet",
  },
  server: {
    icon: AlertTriangle,
    title: "Server Error",
    message: "Something went wrong during analysis. The LEXGUARD team has been notified. Please try again.",
    color: "rose",
  },
}

function ErrorState({ type, onRetry }: { type: ErrorType; onRetry: () => void }) {
  if (!type) return null
  const config = errorConfig[type]
  const Icon = config.icon

  const colorMap: Record<string, string> = {
    rose: "rgba(251, 113, 133, 0.15)",
    amber: "rgba(251, 191, 36, 0.15)",
    violet: "rgba(167, 139, 250, 0.15)",
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
      >
        <div
          className="absolute inset-0 backdrop-blur-2xl"
          style={{ background: "linear-gradient(135deg, rgba(250,249,255,0.97), rgba(253,242,248,0.97))" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 max-w-md w-full"
        >
          <div
            className="rounded-3xl border border-white/60 p-10 text-center"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(40px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.8) inset",
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 relative"
              style={{ background: colorMap[config.color] }}
            >
              <Icon className="w-9 h-9 text-slate-600" />
            </motion.div>

            <h2 className="text-2xl font-bold text-slate-800 mb-3">{config.title}</h2>
            <p className="text-slate-500 leading-relaxed mb-8">{config.message}</p>

            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-semibold transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #a78bfa, #ec4899)",
                boxShadow: "0 8px 24px rgba(167,139,250,0.35)",
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================
// Main Page
// ============================================================
export default function LexguardPage() {
  const [appState, setAppState] = useState<AppState>("landing")
  const [errorType, setErrorType] = useState<ErrorType>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<
    (BackendAnalysisResponse & { fileName: string; analyzedAt: Date }) | null
  >(null)
  const [statusMessage, setStatusMessage] = useState("Initializing AI Core...")
  const uploadRef = useRef<HTMLDivElement>(null)

  const handleUploadClick = useCallback(() => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const pollStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/analyze-status`)
      if (res.ok) {
        const data = await res.json()
        if (data.stage && !data.stage.includes("Complete")) {
          setStatusMessage(data.stage)
        }
      }
    } catch {
      // Silently ignore polling errors — they don't affect the main analysis
    }
  }

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadedFile(file)
    setAppState("analyzing")
    setStatusMessage("Uploading document for analysis...")

    const pollInterval = setInterval(pollStatus, 1500)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 100_000) // 100s client timeout

      let response: Response
      try {
        response = await fetch(`${API_BASE_URL}/analyze-contract`, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        clearInterval(pollInterval)
        if (fetchError.name === "AbortError") {
          setErrorType("timeout")
        } else {
          setErrorType("offline")
        }
        setAppState("error")
        return
      }

      // Handle HTTP error responses
      if (response.status === 413) {
        clearInterval(pollInterval)
        setErrorType("file")
        setAppState("error")
        return
      }
      if (response.status === 400) {
        clearInterval(pollInterval)
        setErrorType("file")
        setAppState("error")
        return
      }
      if (!response.ok) {
        clearInterval(pollInterval)
        setErrorType("server")
        setAppState("error")
        return
      }

      const data: BackendAnalysisResponse = await response.json()

      setTimeout(() => {
        clearInterval(pollInterval)
        setAnalysisResult({
          ...data,
          fileName: file.name,
          analyzedAt: new Date(),
        })
        setAppState("results")
      }, 800)
    } catch (error) {
      console.error("Analysis failed:", error)
      clearInterval(pollInterval)
      setErrorType("server")
      setAppState("error")
    }
  }, [])

  const handleBack = useCallback(() => {
    setAppState("landing")
    setUploadedFile(null)
    setAnalysisResult(null)
    setErrorType(null)
  }, [])

  const handleRetry = useCallback(() => {
    setErrorType(null)
    setAppState("landing")
    setUploadedFile(null)
  }, [])

  return (
    <main className="relative min-h-screen">
      <AnimatedBackground />

      {(appState === "landing" || appState === "error") && (
        <>
          <Navbar />
          <HeroSection onUploadClick={handleUploadClick} />
          <div ref={uploadRef}>
            <UploadZone onFileUpload={handleFileUpload} isAnalyzing={false} />
          </div>
          <FeaturesSection />

          {/* Powered by footer */}
          <div className="text-center py-8 text-xs text-slate-400 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span>Powered by</span>
            <span className="font-semibold text-slate-500">Gemini 2.5 Flash</span>
            <span>&</span>
            <span className="font-semibold text-slate-500">Claude 3.5 Sonnet</span>
            <span>· Built with LEXGUARD AI</span>
          </div>
        </>
      )}

      {appState === "results" && analysisResult && (
        <ResultsDashboard result={analysisResult} onBack={handleBack} />
      )}

      <AnalysisOverlay isVisible={appState === "analyzing"} statusMessage={statusMessage} />

      {appState === "error" && <ErrorState type={errorType} onRetry={handleRetry} />}
    </main>
  )
}
