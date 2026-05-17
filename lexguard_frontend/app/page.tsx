"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { AnimatedBackground } from "@/components/lexguard/animated-background"
import { Navbar } from "@/components/lexguard/navbar"
import { HeroSection } from "@/components/lexguard/hero-section"
import { UploadZone } from "@/components/lexguard/upload-zone"
import { AnalysisOverlay } from "@/components/lexguard/analysis-overlay"
import { ResultsDashboard, type BackendAnalysisResponse } from "@/components/lexguard/results-dashboard"
import { FeaturesSection } from "@/components/lexguard/features-section"

type AppState = "landing" | "analyzing" | "results"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"

export default function LexguardPage() {
  const [appState, setAppState] = useState<AppState>("landing")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<(BackendAnalysisResponse & { fileName: string, analyzedAt: Date }) | null>(null)
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
      } catch (e) {
          console.warn("Polling error", e)
      }
  }

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadedFile(file)
    setAppState("analyzing")
    setStatusMessage("Uploading document for analysis...")
    
    // Start polling status
    const pollInterval = setInterval(pollStatus, 1500)

    try {
        const formData = new FormData()
        formData.append("file", file)
        
        const response = await fetch(`${API_BASE_URL}/analyze-contract`, {
            method: 'POST',
            body: formData,
        })
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`)
        }
        
        const data: BackendAnalysisResponse = await response.json()
        
        // Wait a tiny bit for the UI to catch up to the 100% fake timer if it's running
        setTimeout(() => {
            clearInterval(pollInterval)
            setAnalysisResult({
                ...data,
                fileName: file.name,
                analyzedAt: new Date()
            })
            setAppState("results")
        }, 800)
        
    } catch (error) {
        console.error("Analysis failed:", error)
        clearInterval(pollInterval)
        // In a real app we'd show an error state. 
        // For the hackathon, if network fails completely (e.g. backend offline), 
        // we could revert to landing or show a toast.
        alert("Backend connection failed. Please ensure the FastAPI server is running.")
        setAppState("landing")
    }
  }, [])

  const handleBack = useCallback(() => {
    setAppState("landing")
    setUploadedFile(null)
    setAnalysisResult(null)
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

      {appState === "results" && analysisResult && (
        <ResultsDashboard 
          result={analysisResult}
          onBack={handleBack}
        />
      )}

      <AnalysisOverlay 
        isVisible={appState === "analyzing"} 
        statusMessage={statusMessage}
      />
    </main>
  )
}
