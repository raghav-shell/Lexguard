"use client"

import { motion } from "framer-motion"
import { Shield, AlertTriangle, AlertOctagon, CheckCircle, TrendingUp, Sparkles } from "lucide-react"
import { GlassCard } from "./glass-card"
import { cn } from "@/lib/utils"

export type VerdictLevel = "safe" | "caution" | "high-risk" | "critical"

interface VerdictPanelProps {
  verdict: VerdictLevel
  score: number
  summary: string
}

const verdictConfig = {
  safe: {
    label: "Safe to Sign",
    description: "This contract has favorable terms with minimal risk",
    icon: CheckCircle,
    color: "emerald",
    gradient: "from-emerald-100 to-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    glow: "shadow-[0_8px_40px_rgba(52,211,153,0.25)]",
    meterGradient: "from-emerald-400 to-emerald-500",
  },
  caution: {
    label: "Caution Advised",
    description: "Some terms require negotiation before signing",
    icon: AlertTriangle,
    color: "amber",
    gradient: "from-amber-100 to-amber-50",
    border: "border-amber-200",
    text: "text-amber-600",
    bg: "bg-amber-50",
    glow: "shadow-[0_8px_40px_rgba(251,191,36,0.25)]",
    meterGradient: "from-amber-400 to-amber-500",
  },
  "high-risk": {
    label: "High Risk",
    description: "Significant unfavorable terms detected",
    icon: AlertTriangle,
    color: "rose",
    gradient: "from-rose-100 to-rose-50",
    border: "border-rose-200",
    text: "text-rose-600",
    bg: "bg-rose-50",
    glow: "shadow-[0_8px_40px_rgba(251,113,133,0.25)]",
    meterGradient: "from-rose-400 to-rose-500",
  },
  critical: {
    label: "Extremely One-Sided",
    description: "This contract heavily favors the other party",
    icon: AlertOctagon,
    color: "rose",
    gradient: "from-rose-200 to-rose-100",
    border: "border-rose-300",
    text: "text-rose-700",
    bg: "bg-rose-100",
    glow: "shadow-[0_8px_50px_rgba(251,113,133,0.35)]",
    meterGradient: "from-rose-500 to-rose-600",
  },
}

export function VerdictPanel({ verdict, score, summary }: VerdictPanelProps) {
  const config = verdictConfig[verdict]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      <GlassCard 
        className={cn("overflow-hidden", config.glow)}
        hover={false}
      >
        {/* Background gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-60",
          config.gradient
        )} />

        {/* Animated ambient light */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full"
          style={{
            background: `radial-gradient(circle, ${verdict === 'safe' ? 'rgba(52,211,153,0.3)' : verdict === 'caution' ? 'rgba(251,191,36,0.3)' : 'rgba(251,113,133,0.3)'} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />

        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center",
                  "bg-gradient-to-br",
                  config.gradient,
                  "border",
                  config.border,
                  "shadow-lg"
                )}
              >
                <Icon className={cn("w-8 h-8", config.text)} />
              </motion.div>
              <div>
                <div className="text-sm text-slate-400 uppercase tracking-wider mb-1 font-medium flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  AI Verdict
                </div>
                <h2 className={cn("text-2xl font-bold", config.text)}>
                  {config.label}
                </h2>
              </div>
            </div>

            {/* Risk Score */}
            <div className="text-right">
              <div className="text-sm text-slate-400 uppercase tracking-wider mb-1 font-medium">
                Risk Score
              </div>
              <motion.div 
                className={cn("text-4xl font-bold", config.text)}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {score}
                <span className="text-lg text-slate-300">/100</span>
              </motion.div>
            </div>
          </div>

          {/* Risk Meter */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500 font-medium">Overall Risk Assessment</span>
              <div className="flex items-center gap-2">
                <TrendingUp className={cn("w-4 h-4", config.text)} />
                <span className={cn("text-sm font-semibold", config.text)}>
                  {score < 30 ? "Low" : score < 60 ? "Moderate" : score < 80 ? "High" : "Critical"}
                </span>
              </div>
            </div>
            
            <div className="relative h-4 rounded-full bg-slate-100 overflow-hidden shadow-inner">
              {/* Segments */}
              <div className="absolute inset-0 flex">
                <div className="w-1/4 border-r border-slate-200/50" />
                <div className="w-1/4 border-r border-slate-200/50" />
                <div className="w-1/4 border-r border-slate-200/50" />
                <div className="w-1/4" />
              </div>
              
              {/* Progress bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", config.meterGradient)}
              />
              
              {/* Shimmer effect */}
              <motion.div
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              />
            </div>
            
            {/* Scale labels */}
            <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
              <span>Safe</span>
              <span>Caution</span>
              <span>High Risk</span>
              <span>Critical</span>
            </div>
          </div>

          {/* Summary */}
          <div className={cn(
            "p-5 rounded-2xl border",
            config.bg, config.border
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                config.gradient.replace('from-', 'bg-gradient-to-br from-')
              )}>
                <Shield className={cn("w-5 h-5", config.text)} />
              </div>
              <div>
                <div className={cn("text-sm font-semibold mb-1", config.text)}>
                  {config.description}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {summary}
                </p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
