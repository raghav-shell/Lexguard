"use client"

import { motion } from "framer-motion"
import { FileText, AlertTriangle, Shield, Clock, ArrowLeft, Download, Share2, Sparkles } from "lucide-react"
import { GlassCard, GlassButton } from "./glass-card"
import { ClauseCard, type ClauseData } from "./clause-card"
import { VerdictPanel, type VerdictLevel } from "./verdict-panel"
import { cn } from "@/lib/utils"

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <GlassButton variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </GlassButton>
            
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 border border-violet-200/50 flex items-center justify-center shadow-lg"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <FileText className="w-6 h-6 text-violet-500" />
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

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
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
            icon={Shield}
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
          {/* Verdict Panel - Takes full width on mobile, 1 column on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-6">
              <VerdictPanel
                verdict={result.verdict}
                score={result.riskScore}
                summary={result.summary}
              />
            </div>
          </motion.div>

          {/* Clause Cards - 2 columns on desktop */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-violet-500" />
                </motion.div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Flagged Clauses
                </h2>
              </div>
              <span className="text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {result.clauses.length} issues found
              </span>
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

function StatCard({ label, value, icon: Icon, color, delay }: StatCardProps) {
  const colorClasses = {
    lavender: {
      iconBg: "bg-violet-100",
      iconColor: "text-violet-500",
      valueBg: "bg-violet-50",
    },
    rose: {
      iconBg: "bg-rose-100",
      iconColor: "text-rose-500",
      valueBg: "bg-rose-50",
    },
    amber: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
      valueBg: "bg-amber-50",
    },
    pink: {
      iconBg: "bg-pink-100",
      iconColor: "text-pink-500",
      valueBg: "bg-pink-50",
    },
    emerald: {
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-500",
      valueBg: "bg-emerald-50",
    },
  }

  const classes = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <GlassCard className="p-4" hover={false}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center",
            classes.iconBg
          )}>
            <Icon className={cn("w-5 h-5", classes.iconColor)} />
          </div>
          <div>
            <motion.div 
              className="text-2xl font-bold text-slate-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              {value}
            </motion.div>
            <div className="text-xs text-slate-400 font-medium">{label}</div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
