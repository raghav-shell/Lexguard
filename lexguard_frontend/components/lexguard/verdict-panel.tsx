"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Shield, AlertTriangle, AlertOctagon, CheckCircle, TrendingUp, Sparkles, Brain, Zap } from "lucide-react"
import { GlassCard } from "./glass-card"
import { cn } from "@/lib/utils"
import { useEffect, useState, useRef } from "react"

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
    glow: "rgba(52, 211, 153, 0.3)",
    meterGradient: "from-emerald-400 to-emerald-500",
    orbColor: "rgba(52, 211, 153, 0.4)",
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
    glow: "rgba(251, 191, 36, 0.3)",
    meterGradient: "from-amber-400 to-amber-500",
    orbColor: "rgba(251, 191, 36, 0.4)",
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
    glow: "rgba(251, 113, 133, 0.3)",
    meterGradient: "from-rose-400 to-rose-500",
    orbColor: "rgba(251, 113, 133, 0.4)",
  },
  critical: {
    label: "Critical Risk",
    description: "This contract heavily favors the other party",
    icon: AlertOctagon,
    color: "rose",
    gradient: "from-rose-200 to-rose-100",
    border: "border-rose-300",
    text: "text-rose-700",
    bg: "bg-rose-100",
    glow: "rgba(251, 113, 133, 0.4)",
    meterGradient: "from-rose-500 to-rose-600",
    orbColor: "rgba(251, 113, 133, 0.5)",
  },
}

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      
      setDisplayValue(Math.floor(progress * value))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return <span>{displayValue}</span>
}

export function VerdictPanel({ verdict, score, summary }: VerdictPanelProps) {
  const config = verdictConfig[verdict]
  const Icon = config.icon
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
    >
      <GlassCard 
        className={cn(
          "overflow-hidden relative",
          `shadow-[0_8px_50px_${config.glow}]`
        )}
        hover={false}
      >
        {/* Animated background gradient */}
        <motion.div 
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-50",
            config.gradient
          )}
          animate={{
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Floating ambient orb */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${config.orbColor} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />

        {/* Scanning line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-x-0 h-20"
            style={{
              background: `linear-gradient(to bottom, transparent, ${config.glow}, transparent)`
            }}
          />
        </div>

        <div className="relative p-5 xs:p-6 sm:p-8">
          {/* Header with animated icon */}
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <motion.div
                className={cn(
                  "w-18 h-18 rounded-2xl flex items-center justify-center relative",
                  "bg-gradient-to-br",
                  config.gradient,
                  "border",
                  config.border,
                  "shadow-lg"
                )}
              >
                {/* Pulsing glow behind icon */}
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `radial-gradient(circle, ${config.orbColor} 0%, transparent 70%)`,
                    filter: 'blur(15px)',
                  }}
                />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icon className={cn("w-9 h-9 relative z-10", config.text)} />
                </motion.div>
              </motion.div>
              <div>
                <div className="text-sm text-slate-400 uppercase tracking-wider mb-1 font-medium flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Brain className="w-4 h-4 text-violet-400" />
                  </motion.div>
                  AI Verdict
                </div>
                <motion.h2 
                  className={cn("text-2xl font-bold", config.text)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {config.label}
                </motion.h2>
              </div>
            </div>

            {/* Animated Risk Score Circle */}
            <div className="text-right relative">
              <div className="text-sm text-slate-400 uppercase tracking-wider mb-2 font-medium">
                Risk Score
              </div>
              <div className="relative w-24 h-24">
                {/* Background circle */}
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-100"
                  />
                  <motion.circle
                    cx="48"
                    cy="48"
                    r="40"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className={config.text}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: score / 100 }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                    style={{
                      strokeDasharray: 251.2,
                      filter: `drop-shadow(0 0 6px ${config.glow})`,
                    }}
                  />
                </svg>
                {/* Score number in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span 
                    className={cn("text-2xl font-bold", config.text)}
                  >
                    <AnimatedCounter value={score} duration={2} />
                  </motion.span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Risk Meter */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500 font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" />
                Overall Risk Assessment
              </span>
              <div className="flex items-center gap-2">
                <TrendingUp className={cn("w-4 h-4", config.text)} />
                <span className={cn("text-sm font-semibold", config.text)}>
                  {score < 30 ? "Low" : score < 60 ? "Moderate" : score < 80 ? "High" : "Critical"}
                </span>
              </div>
            </div>
            
            <div className="relative h-5 rounded-full bg-slate-100 overflow-hidden shadow-inner">
              {/* Segment markers */}
              <div className="absolute inset-0 flex">
                <div className="w-1/4 border-r border-slate-200/50" />
                <div className="w-1/4 border-r border-slate-200/50" />
                <div className="w-1/4 border-r border-slate-200/50" />
                <div className="w-1/4" />
              </div>
              
              {/* Animated progress bar with gradient */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r",
                  config.meterGradient
                )}
                style={{
                  boxShadow: `0 0 20px ${config.glow}`,
                }}
              />
              
              {/* Animated shimmer */}
              <motion.div
                animate={{ x: ["-100%", "400%"] }}
                transition={{ duration: 2, repeat: Infinity, delay: 2 }}
                className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
              
              {/* Score indicator dot */}
              <motion.div
                initial={{ left: 0 }}
                animate={{ left: `calc(${score}% - 8px)` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg border-2"
                style={{ borderColor: config.text.replace('text-', '') }}
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

          {/* Summary with animated border */}
          <motion.div 
            className={cn(
              "p-4 sm:p-5 rounded-2xl border relative overflow-hidden",
              config.bg, config.border
            )}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {/* Animated gradient border effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-30"
              animate={{
                background: [
                  `linear-gradient(0deg, ${config.glow}, transparent)`,
                  `linear-gradient(180deg, ${config.glow}, transparent)`,
                  `linear-gradient(360deg, ${config.glow}, transparent)`,
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <motion.div 
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    `bg-gradient-to-br ${config.gradient}`
                  )}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Shield className={cn("w-5.5 h-5.5", config.text)} />
                </motion.div>
                <div className={cn("text-sm font-semibold sm:text-base", config.text)}>
                  {config.description}
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed pl-0 sm:pl-13">
                {summary}
              </p>
            </div>
          </motion.div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
