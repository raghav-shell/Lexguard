"use client"

import { motion } from "framer-motion"
import { FileText, AlertTriangle, Shield, Clock, ArrowLeft, Download, Share2, Sparkles, Brain, Eye, Zap, Scale } from "lucide-react"
import { GlassCard, GlassButton } from "./glass-card"
import { ClauseCard, type ClauseData } from "./clause-card"
import { VerdictPanel, type VerdictLevel } from "./verdict-panel"
import { ContractViewer } from "./contract-viewer"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

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

  // Map verdict from backend string to VerdictLevel
  const getVerdictLevel = (backendVerdict: string): VerdictLevel => {
      const v = backendVerdict.toLowerCase()
      if (v.includes("critical") || v.includes("extremely")) return "critical"
      if (v.includes("high")) return "high-risk"
      if (v.includes("caution") || v.includes("medium")) return "caution"
      return "safe"
  }

  const verdictLevel = getVerdictLevel(result.overall_verdict)

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <GlassButton variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </GlassButton>
            
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 border border-violet-200/50 flex items-center justify-center shadow-lg relative overflow-hidden"
                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <FileText className="w-7 h-7 text-violet-500 relative z-10" />
              </motion.div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800 truncate max-w-[300px] md:max-w-[500px]">
                  {result.fileName}
                </h1>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  Analyzed {result.analyzedAt.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <GlassButton variant="secondary" size="sm">
              <Share2 className="w-4 h-4" />
              Share Report
            </GlassButton>
            <GlassButton variant="secondary" size="sm">
              <Download className="w-4 h-4" />
              Export PDF
            </GlassButton>
          </div>
        </motion.div>

        {/* Main Grid Layout: Left (Contract), Right (Insights) */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: Contract Viewer */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-5 h-[calc(100vh-140px)] sticky top-6"
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
             className="lg:col-span-7 space-y-6"
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
                    >
                      <ClauseCard
                        clause={clause}
                        index={index}
                      />
                    </div>
                 ))}
             </div>
             
             {/* Bottom CTA */}
             <div className="pt-8 pb-12">
                <GlassCard className="p-6 text-center" hover={false}>
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Brain className="w-5 h-5 text-violet-500" />
                        <span className="font-semibold text-slate-800">Ready to Negotiate?</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                        Let our AI generate a professional email counter-proposal addressing all flagged issues.
                    </p>
                    <GlassButton>
                        <Sparkles className="w-4 h-4" />
                        Generate Counter-Proposal
                    </GlassButton>
                </GlassCard>
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

  return <span>{displayValue}</span>
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
                  className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, delay, ease: "easeOut" }}
               />
           </div>
       </div>
   )
}
