"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Shield, Scale, FileWarning, Gavel, Ban, Info, ChevronDown, Sparkles, Lightbulb, User, Activity, Bot } from "lucide-react"
import { GlassCard } from "./glass-card"
import { cn } from "@/lib/utils"
import { useState } from "react"

export type ClauseSeverity = "low" | "medium" | "high" | "critical"

export interface ClauseData {
  clause_id: string
  clause_type: string
  severity: ClauseSeverity
  risk_score: number
  affected_party: string
  fairness_assessment: string
  original_clause: string
  plain_english: string
  why_risky: string
  real_world_impact: string
  negotiation_tip: string
  agent_source: string
  confidence_score: number
}

interface ClauseCardProps {
  clause: ClauseData
  index: number
  onClick?: () => void
  isExpanded?: boolean
}

const severityConfig = {
  low: {
    color: "emerald",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-600",
    iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-50",
    glow: "emerald",
    glowShadow: "shadow-[0_0_20px_rgba(52,211,153,0.2)]",
    label: "Low Risk",
    icon: Shield,
    pulseColor: "rgba(52, 211, 153, 0.5)",
  },
  medium: {
    color: "amber",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-600",
    iconBg: "bg-gradient-to-br from-amber-100 to-amber-50",
    glow: "amber",
    glowShadow: "shadow-[0_0_20px_rgba(251,191,36,0.2)]",
    label: "Medium Risk",
    icon: Info,
    pulseColor: "rgba(251, 191, 36, 0.5)",
  },
  high: {
    color: "rose",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-600",
    iconBg: "bg-gradient-to-br from-rose-100 to-rose-50",
    glow: "rose",
    glowShadow: "shadow-[0_0_20px_rgba(251,113,133,0.25)]",
    label: "High Risk",
    icon: AlertTriangle,
    pulseColor: "rgba(251, 113, 133, 0.5)",
  },
  critical: {
    color: "rose",
    bg: "bg-rose-100",
    border: "border-rose-300",
    text: "text-rose-700",
    iconBg: "bg-gradient-to-br from-rose-200 to-rose-100",
    glow: "rose",
    glowShadow: "shadow-[0_0_30px_rgba(251,113,133,0.35)]",
    label: "Critical",
    icon: Ban,
    pulseColor: "rgba(251, 113, 133, 0.6)",
  },
}

const clauseIcons: Record<string, typeof AlertTriangle> = {
  liability: AlertTriangle,
  arbitration: Scale,
  termination: FileWarning,
  indemnification: Shield,
  jurisdiction: Gavel,
  "non-compete": Ban,
  "intellectual property": FileWarning,
  default: Info,
}

export function ClauseCard({ clause, index, onClick }: ClauseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const config = severityConfig[clause.severity.toLowerCase() as ClauseSeverity] || severityConfig.medium
  
  // Find icon or use default
  let Icon = clauseIcons.default
  const typeLower = clause.clause_type.toLowerCase()
  for (const [key, val] of Object.entries(clauseIcons)) {
      if (typeLower.includes(key)) {
          Icon = val
          break
      }
  }
  const SeverityIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.23, 1, 0.32, 1]
      }}
    >
      <GlassCard
        glowColor={config.glow as "emerald" | "amber" | "rose"}
        delay={0}
        className={cn("cursor-pointer group overflow-hidden", config.glowShadow)}
        tilt
      >
        {/* Ambient glow based on severity */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${config.pulseColor} 0%, transparent 70%)`,
            filter: 'blur(30px)',
          }}
        />

        <motion.div
          onClick={() => {
            setIsExpanded(!isExpanded)
            onClick?.()
          }}
          className="p-6 relative"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <motion.div 
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center relative flex-shrink-0",
                  config.iconBg
                )}
                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                {/* Icon glow */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `radial-gradient(circle, ${config.pulseColor} 0%, transparent 70%)`,
                    filter: 'blur(8px)',
                  }}
                />
                <Icon className={cn("w-7 h-7 relative z-10", config.text)} />
              </motion.div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-medium">
                  {clause.clause_type}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                  {clause.plain_english}
                </h3>
              </div>
            </div>
            
            {/* Severity badge with pulse */}
            <motion.div 
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border relative overflow-hidden flex-shrink-0",
                config.bg, config.border, config.text
              )}
              whileHover={{ scale: 1.05 }}
            >
              {/* Pulse ring for critical */}
              {clause.severity.toLowerCase() === 'critical' && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-rose-400"
                  animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <SeverityIcon className="w-3.5 h-3.5" />
              {config.label}
            </motion.div>
          </div>

          {/* AI Confidence & Affected Party Badges */}
          <div className="flex items-center gap-3 mb-5">
             <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                <Activity className="w-3.5 h-3.5 text-violet-500" />
                <span>AI Confidence: <span className="font-semibold">{clause.confidence_score}%</span></span>
             </div>
             <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span>Affected Party: <span className="font-semibold">{clause.affected_party}</span></span>
             </div>
          </div>

          {/* Why Risky */}
          <p className="text-slate-600 text-sm leading-relaxed mb-5">
            <strong className="text-slate-700">Why it's risky:</strong> {clause.why_risky}
          </p>

          {/* Consequence - with animated border */}
          <motion.div 
            className="mb-5 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 relative overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              </motion.div>
              Real-World Impact
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              {clause.real_world_impact}
            </p>
          </motion.div>

          {/* Recommendation - with glow effect */}
          <motion.div 
            className={cn(
              "p-4 rounded-2xl border relative overflow-hidden",
              config.bg, config.border
            )}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {/* Subtle animated gradient */}
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  `linear-gradient(45deg, ${config.pulseColor}, transparent)`,
                  `linear-gradient(225deg, ${config.pulseColor}, transparent)`,
                  `linear-gradient(45deg, ${config.pulseColor}, transparent)`,
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            <div className="relative z-10">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-violet-500" />
                Negotiation Recommendation
              </div>
              <p className={cn("text-sm font-medium leading-relaxed", config.text)}>
                {clause.negotiation_tip}
              </p>
            </div>
          </motion.div>

          {/* Expand indicator */}
          <motion.div 
            className="flex items-center justify-center mt-5 pt-4 border-t border-slate-100"
          >
            <motion.button
              className="flex items-center gap-2 text-slate-400 hover:text-violet-500 transition-colors text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isExpanded ? "Hide Details" : "View Agent Details & Original Clause"}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </motion.div>

          {/* Expandable original text and agent info */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Bot className="w-3 h-3"/> Analysis Source</div>
                    <div className="text-sm font-medium text-slate-700">{clause.agent_source}</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Scale className="w-3 h-3"/> Fairness Assessment</div>
                    <div className="text-sm font-medium text-slate-700">{clause.fairness_assessment}</div>
                  </div>
                </div>

                {clause.original_clause && (
                    <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 font-mono text-xs leading-relaxed">
                      <div className="text-slate-500 mb-2">// Original Contract Text</div>
                      {clause.original_clause}
                    </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </GlassCard>
    </motion.div>
  )
}
