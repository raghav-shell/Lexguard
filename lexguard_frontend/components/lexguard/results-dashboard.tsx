"use client"

import { motion } from "framer-motion"
import { FileText, AlertTriangle, Shield, Clock, ArrowLeft, Download, Share2, Sparkles, Brain, Eye, Zap } from "lucide-react"
import { GlassCard, GlassButton } from "./glass-card"
import { ClauseCard, type ClauseData } from "./clause-card"
import { VerdictPanel, type VerdictLevel } from "./verdict-panel"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface AnalysisResult {
  fileName: string
  analyzedAt: Date
  verdict: VerdictLevel
  riskScore: number
  summary: string
  clauses: ClauseData[]
  stats: {
    totalClauses: number
    criticalCount: number
    highRiskCount: number
    mediumRiskCount: number
    lowRiskCount: number
  }
}

interface ResultsDashboardProps {
  result: AnalysisResult
  onBack: () => void
}

export function ResultsDashboard({ result, onBack }: ResultsDashboardProps) {
  return (
    <section className="relative px-6 py-12 min-h-screen">
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

      <div className="max-w-7xl mx-auto relative z-10">
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
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <FileText className="w-7 h-7 text-violet-500 relative z-10" />
              </motion.div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800 truncate max-w-[300px]">
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
              Share
            </GlassButton>
            <GlassButton variant="secondary" size="sm">
              <Download className="w-4 h-4" />
              Export PDF
            </GlassButton>
          </div>
        </motion.div>

        {/* Stats Overview - Enhanced with animations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10"
        >
          <StatCard
            label="Total Clauses"
            value={result.stats.totalClauses}
            icon={FileText}
            color="lavender"
            delay={0}
          />
          <StatCard
            label="Critical"
            value={result.stats.criticalCount}
            icon={AlertTriangle}
            color="rose"
            delay={0.1}
          />
          <StatCard
            label="High Risk"
            value={result.stats.highRiskCount}
            icon={AlertTriangle}
            color="amber"
            delay={0.2}
          />
          <StatCard
            label="Medium Risk"
            value={result.stats.mediumRiskCount}
            icon={Eye}
            color="pink"
            delay={0.3}
          />
          <StatCard
            label="Low Risk"
            value={result.stats.lowRiskCount}
            icon={Shield}
            color="emerald"
            delay={0.4}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Verdict Panel - Sticky sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-6 space-y-6">
              <VerdictPanel
                verdict={result.verdict}
                score={result.riskScore}
                summary={result.summary}
              />
              
              {/* Quick Actions Panel */}
              <GlassCard className="p-5" hover={false}>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-medium text-slate-700">Quick Actions</span>
                </div>
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left px-4 py-3 rounded-xl bg-white/50 hover:bg-white/80 border border-white/60 text-sm text-slate-600 hover:text-slate-800 transition-all flex items-center gap-3"
                  >
                    <Brain className="w-4 h-4 text-violet-500" />
                    Generate Counter-Proposal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left px-4 py-3 rounded-xl bg-white/50 hover:bg-white/80 border border-white/60 text-sm text-slate-600 hover:text-slate-800 transition-all flex items-center gap-3"
                  >
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    AI Negotiation Tips
                  </motion.button>
                </div>
              </GlassCard>
            </div>
          </motion.div>

          {/* Clause Cards - Main content area */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-violet-500" />
                </motion.div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Flagged Clauses
                </h2>
              </div>
              <motion.span 
                className="text-sm text-slate-400 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/50"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                {result.clauses.length} issues found
              </motion.span>
            </div>

            <div className="space-y-5">
              {result.clauses.map((clause, index) => (
                <ClauseCard
                  key={clause.id}
                  clause={clause}
                  index={index}
                />
              ))}
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="pt-8"
            >
              <GlassCard className="p-6 text-center" hover={false}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-violet-500" />
                  <span className="font-semibold text-slate-800">Need Help Negotiating?</span>
                </div>
                <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                  Let our AI generate a professional counter-proposal addressing all flagged issues
                </p>
                <GlassButton>
                  <Sparkles className="w-4 h-4" />
                  Generate Counter-Proposal
                </GlassButton>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

interface StatCardProps {
  label: string
  value: number
  icon: typeof FileText
  color: "lavender" | "rose" | "amber" | "pink" | "emerald"
  delay: number
}

function AnimatedNumber({ value, delay }: { value: number; delay: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0
      const duration = 1000
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
    }, delay * 1000 + 500)

    return () => clearTimeout(timer)
  }, [value, delay])

  return <span>{displayValue}</span>
}

function StatCard({ label, value, icon: Icon, color, delay }: StatCardProps) {
  const colorClasses = {
    lavender: {
      iconBg: "bg-gradient-to-br from-violet-100 to-violet-50",
      iconColor: "text-violet-500",
      glow: "rgba(168, 139, 250, 0.2)",
    },
    rose: {
      iconBg: "bg-gradient-to-br from-rose-100 to-rose-50",
      iconColor: "text-rose-500",
      glow: "rgba(251, 113, 133, 0.2)",
    },
    amber: {
      iconBg: "bg-gradient-to-br from-amber-100 to-amber-50",
      iconColor: "text-amber-500",
      glow: "rgba(251, 191, 36, 0.2)",
    },
    pink: {
      iconBg: "bg-gradient-to-br from-pink-100 to-pink-50",
      iconColor: "text-pink-500",
      glow: "rgba(244, 114, 182, 0.2)",
    },
    emerald: {
      iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-50",
      iconColor: "text-emerald-500",
      glow: "rgba(52, 211, 153, 0.2)",
    },
  }

  const classes = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <GlassCard className="p-4 relative overflow-hidden" hover={false}>
        {/* Ambient glow */}
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-10 -right-10 w-20 h-20 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${classes.glow} 0%, transparent 70%)`,
            filter: 'blur(15px)',
          }}
        />

        <div className="flex items-center gap-3 relative z-10">
          <motion.div 
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center relative",
              classes.iconBg
            )}
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.4 }}
          >
            <Icon className={cn("w-5 h-5", classes.iconColor)} />
          </motion.div>
          <div>
            <motion.div 
              className="text-2xl font-bold text-slate-800"
            >
              <AnimatedNumber value={value} delay={delay} />
            </motion.div>
            <div className="text-xs text-slate-400 font-medium">{label}</div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
