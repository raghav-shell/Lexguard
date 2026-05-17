"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Shield, Scale, FileWarning, Gavel, Ban, Info, ChevronRight, ExternalLink } from "lucide-react"
import { GlassCard } from "./glass-card"
import { cn } from "@/lib/utils"

export type ClauseSeverity = "low" | "medium" | "high" | "critical"

export interface ClauseData {
  id: string
  type: string
  severity: ClauseSeverity
  title: string
  explanation: string
  consequence: string
  recommendation: string
  originalText?: string
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
    iconBg: "bg-emerald-100",
    glow: "emerald",
    label: "Low Risk",
    icon: Shield,
  },
  medium: {
    color: "amber",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-600",
    iconBg: "bg-amber-100",
    glow: "amber",
    label: "Medium Risk",
    icon: Info,
  },
  high: {
    color: "rose",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-600",
    iconBg: "bg-rose-100",
    glow: "rose",
    label: "High Risk",
    icon: AlertTriangle,
  },
  critical: {
    color: "rose",
    bg: "bg-rose-100",
    border: "border-rose-300",
    text: "text-rose-700",
    iconBg: "bg-rose-200",
    glow: "rose",
    label: "Critical Risk",
    icon: Ban,
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

export function ClauseCard({ clause, index, onClick, isExpanded }: ClauseCardProps) {
  const config = severityConfig[clause.severity]
  const Icon = clauseIcons[clause.type.toLowerCase()] || clauseIcons.default
  const SeverityIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.23, 1, 0.32, 1]
      }}
    >
      <GlassCard
        glowColor={config.glow as "emerald" | "amber" | "rose"}
        delay={0}
        className="cursor-pointer group overflow-hidden"
      >
        <motion.div
          onClick={onClick}
          className="p-6"
          whileHover={{ scale: 1.005 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <motion.div 
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  config.iconBg
                )}
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Icon className={cn("w-6 h-6", config.text)} />
              </motion.div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-medium">
                  {clause.type}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                  {clause.title}
                </h3>
              </div>
            </div>
            
            {/* Severity badge */}
            <motion.div 
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border",
                config.bg, config.border, config.text
              )}
              whileHover={{ scale: 1.05 }}
            >
              <SeverityIcon className="w-3.5 h-3.5" />
              {config.label}
            </motion.div>
          </div>

          {/* Explanation */}
          <p className="text-slate-600 text-sm leading-relaxed mb-5">
            {clause.explanation}
          </p>

          {/* Consequence */}
          <div className="mb-5 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Real-World Impact
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              {clause.consequence}
            </p>
          </div>

          {/* Recommendation */}
          <div className={cn(
            "p-4 rounded-2xl border",
            config.bg, config.border
          )}>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              Negotiation Recommendation
            </div>
            <p className={cn("text-sm font-medium leading-relaxed", config.text)}>
              {clause.recommendation}
            </p>
          </div>

          {/* Expand indicator */}
          <motion.div 
            className="flex items-center justify-end mt-5 text-slate-400 group-hover:text-violet-500 transition-colors"
            whileHover={{ x: 3 }}
          >
            <span className="text-xs mr-2 font-medium">View Original Clause</span>
            <ChevronRight className={cn(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-90"
            )} />
          </motion.div>
        </motion.div>
      </GlassCard>
    </motion.div>
  )
}
