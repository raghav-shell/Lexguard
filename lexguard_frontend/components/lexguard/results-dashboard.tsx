"use client"

import { motion, AnimatePresence } from "framer-motion"
import { FileText, AlertTriangle, Shield, Clock, ArrowLeft, Download, Share2, Sparkles, Brain, Eye, Zap, Scale, Activity, Copy, Check } from "lucide-react"
import { GlassCard, GlassButton } from "./glass-card"
import { ClauseCard, type ClauseData } from "./clause-card"
import { VerdictPanel, type VerdictLevel } from "./verdict-panel"
import { ContractViewer } from "./contract-viewer"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export interface BackendAnalysisResponse {
  extracted_text: string
  overall_risk_score: number
  fairness_score: number
  overall_verdict: string
  summary: string
  top_concerns: string[]
  risk_breakdown: {
    employment: number
    privacy: number
    financial: number
    ip: number
    fairness: number
  }
  clauses: ClauseData[]
}

interface ResultsDashboardProps {
  result: BackendAnalysisResponse & { fileName: string, analyzedAt: Date }
  onBack: () => void
}

export function ResultsDashboard({ result, onBack }: ResultsDashboardProps) {
  const [activeClauseId, setActiveClauseId] = useState<string | null>(null)
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false)
  const [proposalText, setProposalText] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [mobileTab, setMobileTab] = useState<"insights" | "document">("insights")

  // Map verdict from backend string to VerdictLevel
  const getVerdictLevel = (backendVerdict: string): VerdictLevel => {
      const v = backendVerdict.toLowerCase()
      if (v.includes("critical") || v.includes("extremely")) return "critical"
      if (v.includes("high")) return "high-risk"
      if (v.includes("caution") || v.includes("medium")) return "caution"
      return "safe"
  }

  const verdictLevel = getVerdictLevel(result.overall_verdict)

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Lexguard Analysis Report',
          text: `Check out the AI analysis for ${result.fileName}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Report link copied to clipboard!")
      }
    } catch (e) {
      console.warn("Share failed", e)
    }
  }

  const handleGenerateProposal = () => {
    setIsGeneratingProposal(true)
    
    // Simulate AI generation time for MVP
    setTimeout(() => {
      const topConcernsText = result.top_concerns.map(c => `- ${c}`).join('\n')
      const draft = `Subject: Proposed Revisions to ${result.fileName}

Hi [Name],

I've reviewed the current draft of the agreement. While most of it looks good, there are a few areas of concern we need to address before moving forward:

${topConcernsText}

Could we schedule a brief call to discuss modifying these terms to be more mutually beneficial? I've attached my specific redlines for your review.

Looking forward to finalizing this.

Best regards,
[Your Name]`
      
      setProposalText(draft)
      setIsGeneratingProposal(false)
      toast.success("Counter-proposal generated successfully!")
    }, 2000)
  }

  const handleCopyProposal = () => {
    if (proposalText) {
      navigator.clipboard.writeText(proposalText)
      setIsCopied(true)
      toast.success("Draft copied to clipboard!")
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  return (
    <section className="relative px-4 py-8 md:px-8 md:py-12 min-h-screen">
      {/* Ambient background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-20 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 139, 250, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-20 left-20 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(244, 114, 182, 0.25) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* PRINT ONLY: Cover Page */}
        <div className="hidden print:flex flex-col items-center justify-center min-h-screen page-break-after text-center py-20 px-8">
          <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 mx-auto border-4 border-slate-900 shadow-2xl">
             <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tight mb-4">LEXGUARD</h1>
          <h2 className="text-2xl font-medium text-slate-500 mb-16 uppercase tracking-widest">AI Contract Intelligence Report</h2>
          
          <div className="w-full max-w-3xl border-t-2 border-b-2 border-slate-100 py-12 mb-16">
             <h3 className="text-3xl font-bold text-slate-800 mb-4">{result.fileName}</h3>
             <p className="text-slate-500 flex items-center justify-center gap-2 font-medium">
                <Clock className="w-4 h-4" />
                Generated on {result.analyzedAt.toLocaleDateString()} at {result.analyzedAt.toLocaleTimeString()}
             </p>
          </div>

          <div className="grid grid-cols-2 gap-8 w-full max-w-3xl">
            <div className="border border-slate-200 p-8 rounded-2xl bg-slate-50">
               <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Overall Verdict</div>
               <div className="text-4xl font-bold capitalize text-slate-900">{verdictLevel.replace('-', ' ')}</div>
            </div>
            <div className="border border-slate-200 p-8 rounded-2xl bg-slate-50">
               <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Fairness Score</div>
               <div className="text-4xl font-bold text-slate-900">{result.fairness_score} <span className="text-2xl text-slate-400">/ 100</span></div>
            </div>
          </div>
        </div>

        {/* PRINT ONLY: Executive Summary */}
        <div className="hidden print:block page-break-after py-12 px-8 max-w-4xl mx-auto">
           <h2 className="text-4xl font-bold text-slate-900 mb-10 border-b-2 border-slate-100 pb-4">Executive Summary</h2>
           
           <div className="mb-12">
              <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <Brain className="w-6 h-6 text-violet-600" />
                 AI Recommendation
              </h3>
              <p className="text-lg text-slate-700 leading-relaxed bg-violet-50/50 p-6 rounded-2xl border border-violet-100">
                 <strong className="text-slate-900 block mb-2">
                   {verdictLevel === 'critical' ? 'Do not sign. Extremely high risk terms detected that heavily favor the issuer.' :
                    verdictLevel === 'high-risk' ? 'Negotiation strongly advised. Several concerning clauses require your attention before proceeding.' :
                    verdictLevel === 'caution' ? 'Proceed with caution. The agreement is mostly standard but contains a few asymmetric terms.' :
                    'Safe to proceed. The agreement appears balanced and standard.'}
                 </strong>
                 {result.summary}
              </p>
           </div>

           <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <AlertTriangle className="w-6 h-6 text-rose-500" />
                 Top Legal Concerns
              </h3>
              <ul className="space-y-4">
                 {result.top_concerns.map((concern, i) => (
                    <li key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-rose-50/30 border border-rose-100 text-slate-700 text-lg">
                       <div className="mt-2 w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                       <span className="leading-relaxed">{concern}</span>
                    </li>
                 ))}
              </ul>
           </div>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 print:hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
            <GlassButton variant="ghost" onClick={onBack} className="self-start flex-shrink-0">
              <ArrowLeft className="w-4 h-4" />
              Back
            </GlassButton>
            
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <motion.div 
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 border border-violet-200/50 flex items-center justify-center shadow-lg relative overflow-hidden flex-shrink-0"
                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <FileText className="w-5.5 h-5.5 sm:w-7 sm:h-7 text-violet-500 relative z-10" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-slate-800 truncate max-w-[200px] xs:max-w-[260px] sm:max-w-[500px]">
                  {result.fileName}
                </h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Analyzed {result.analyzedAt.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
 
          <div className="flex flex-wrap gap-2.5 sm:gap-3 flex-shrink-0">
            <GlassButton variant="secondary" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              Share Report
            </GlassButton>
            <GlassButton variant="secondary" size="sm" onClick={() => window.print()}>
              <Download className="w-4 h-4" />
              Export PDF
            </GlassButton>
          </div>
        </motion.div>

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden bg-white/50 border border-white/40 backdrop-blur-md p-1.5 rounded-2xl mb-8 shadow-[0_4px_20px_rgba(168,139,250,0.05)]">
          <button
            onClick={() => setMobileTab("insights")}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2",
              mobileTab === "insights"
                ? "bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white shadow-md shadow-violet-500/20"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Brain className="w-4 h-4" />
            AI Insights
          </button>
          <button
            onClick={() => setMobileTab("document")}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2",
              mobileTab === "document"
                ? "bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white shadow-md shadow-violet-500/20"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <FileText className="w-4 h-4" />
            Contract Viewer
          </button>
        </div>

        {/* Main Grid Layout: Left (Contract), Right (Insights) */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: Contract Viewer */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className={cn("lg:col-span-5 h-[calc(100vh-140px)] lg:sticky lg:top-6", mobileTab === "document" ? "block" : "hidden lg:block")}
          >
             <ContractViewer 
                extractedText={result.extracted_text} 
                clauses={result.clauses} 
                activeClauseId={activeClauseId}
             />
          </motion.div>

          {/* RIGHT: AI Insights Dashboard */}
          <motion.div
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3, duration: 0.6 }}
             className={cn("lg:col-span-7 space-y-6", mobileTab === "insights" ? "block" : "hidden lg:block")}
          >
             {/* Scores Row */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <VerdictPanel
                  verdict={verdictLevel}
                  score={result.overall_risk_score}
                  summary={result.summary}
                />

                <GlassCard className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden h-full" hover={false}>
                    {/* Background glow for fairness */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute inset-0 bg-[radial-gradient(circle,rgba(52,211,153,0.15)_0%,transparent_70%)]"
                    />
                    
                    <Scale className="w-8 h-8 text-emerald-500 mb-3 relative z-10" />
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2 relative z-10">Contract Fairness Score</div>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">
                           <AnimatedNumber value={result.fairness_score} delay={0.4} />
                        </span>
                        <span className="text-xl text-slate-400 font-medium">/ 100</span>
                    </div>
                    
                    <div className="mt-4 w-full max-w-[200px] h-2 bg-slate-100 rounded-full overflow-hidden relative z-10">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.fairness_score}%` }}
                          transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                        />
                    </div>
                    
                    <p className="mt-4 text-xs text-slate-500 relative z-10">
                        Scores above 70 indicate a reasonably balanced agreement. Lower scores indicate severe asymmetry favoring the issuer.
                    </p>
                </GlassCard>
             </div>

             {/* Risk Breakdown & Top Concerns Row */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Risk Breakdown Bars */}
                 <GlassCard className="p-6" hover={false}>
                     <div className="flex items-center gap-2 mb-6">
                         <Activity className="w-5 h-5 text-violet-500" />
                         <h3 className="font-semibold text-slate-800">Risk Breakdown</h3>
                     </div>
                     <div className="space-y-4">
                        <RiskBar label="Employment" score={result.risk_breakdown.employment} color="violet" delay={0.5} />
                        <RiskBar label="Privacy" score={result.risk_breakdown.privacy} color="cyan" delay={0.6} />
                        <RiskBar label="Financial" score={result.risk_breakdown.financial} color="rose" delay={0.7} />
                        <RiskBar label="Intellectual Property" score={result.risk_breakdown.ip} color="amber" delay={0.8} />
                     </div>
                 </GlassCard>

                 {/* Top Concerns */}
                 <GlassCard className="p-6" hover={false}>
                     <div className="flex items-center gap-2 mb-6">
                         <AlertTriangle className="w-5 h-5 text-rose-500" />
                         <h3 className="font-semibold text-slate-800">Top Concerns</h3>
                     </div>
                     <ul className="space-y-3">
                         {result.top_concerns.map((concern, i) => (
                             <motion.li 
                               key={i}
                               initial={{ opacity: 0, x: -10 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 0.8 + (i * 0.1) }}
                               className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100/50 text-sm text-slate-700"
                             >
                                 <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                                 {concern}
                             </motion.li>
                         ))}
                     </ul>
                 </GlassCard>
             </div>

             {/* Clause Cards Header */}
             <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-3">
                    <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                        <Sparkles className="w-5 h-5 text-violet-500" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-slate-800">Flagged Clauses</h2>
                </div>
                <span className="text-sm text-slate-400 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/50 shadow-sm">
                    {result.clauses.length} issues found
                </span>
             </div>

             {/* Clauses List */}
             <div className="space-y-5">
                 {result.clauses.map((clause, index) => (
                    <div 
                      key={clause.clause_id} 
                      onMouseEnter={() => setActiveClauseId(clause.clause_id)}
                      onMouseLeave={() => setActiveClauseId(null)}
                      className="print:break-inside-avoid"
                    >
                      <ClauseCard
                        clause={clause}
                        index={index}
                      />
                    </div>
                 ))}
             </div>
             
             {/* Bottom CTA & Proposal Panel */}
             <div className="pt-8 pb-12 space-y-6">
                <GlassCard className="p-6 text-center" hover={false}>
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Brain className="w-5 h-5 text-violet-500" />
                        <span className="font-semibold text-slate-800">Ready to Negotiate?</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                        Let our AI generate a professional email counter-proposal addressing all flagged issues.
                    </p>
                    <GlassButton 
                        onClick={handleGenerateProposal} 
                        disabled={isGeneratingProposal || proposalText !== null}
                    >
                        {isGeneratingProposal ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                <Sparkles className="w-4 h-4" />
                            </motion.div>
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                        {isGeneratingProposal ? "Generating Draft..." : "Generate Counter-Proposal"}
                    </GlassButton>
                </GlassCard>

                {/* Animated Proposal Reveal */}
                <AnimatePresence>
                    {proposalText && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: 20 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden"
                        >
                            <GlassCard className="p-6 relative overflow-hidden" hover={false}>
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 to-pink-500" />
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-violet-500" />
                                        <span className="font-semibold text-slate-800">AI Suggested Draft</span>
                                    </div>
                                    <GlassButton variant="secondary" size="sm" onClick={handleCopyProposal}>
                                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        {isCopied ? "Copied!" : "Copy"}
                                    </GlassButton>
                                </div>
                                <div className="p-4 rounded-xl bg-white/50 border border-slate-100 font-mono text-sm text-slate-600 whitespace-pre-wrap leading-relaxed text-left">
                                    {proposalText}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

function AnimatedNumber({ value, delay }: { value: number; delay: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0
      const duration = 1500
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        setDisplayValue(Math.floor(easeOut * value))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <>
      <span className="print:hidden">{displayValue}</span>
      <span className="hidden print:inline">{value}</span>
    </>
  )
}

function RiskBar({ label, score, color, delay }: { label: string, score: number, color: string, delay: number }) {
   const colorMap: Record<string, string> = {
       violet: "from-violet-400 to-purple-500",
       cyan: "from-cyan-400 to-blue-500",
       rose: "from-rose-400 to-pink-500",
       amber: "from-amber-400 to-orange-500"
   }
   const gradient = colorMap[color] || colorMap.violet

   return (
       <div className="space-y-1.5">
           <div className="flex justify-between text-xs font-medium">
               <span className="text-slate-600">{label}</span>
               <span className="text-slate-400">{score}/100</span>
           </div>
           <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <motion.div 
                  className={`h-full bg-gradient-to-r ${gradient} rounded-full print:hidden`}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, delay, ease: "easeOut" }}
               />
               <div 
                  className={`hidden print:block h-full bg-gradient-to-r ${gradient} rounded-full`}
                  style={{ width: `${score}%` }}
               />
           </div>
       </div>
   )
}
