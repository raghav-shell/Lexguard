"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
  glowColor?: "lavender" | "pink" | "cyan" | "emerald" | "amber" | "rose"
  hover?: boolean
  delay?: number
}

const glowColors = {
  lavender: "hover:shadow-[0_8px_40px_rgba(168,139,250,0.25)]",
  pink: "hover:shadow-[0_8px_40px_rgba(244,114,182,0.25)]",
  cyan: "hover:shadow-[0_8px_40px_rgba(34,211,238,0.25)]",
  emerald: "hover:shadow-[0_8px_40px_rgba(52,211,153,0.25)]",
  amber: "hover:shadow-[0_8px_40px_rgba(251,191,36,0.25)]",
  rose: "hover:shadow-[0_8px_40px_rgba(251,113,133,0.25)]",
}

const borderColors = {
  lavender: "hover:border-violet-300/50",
  pink: "hover:border-pink-300/50",
  cyan: "hover:border-cyan-300/50",
  emerald: "hover:border-emerald-300/50",
  amber: "hover:border-amber-300/50",
  rose: "hover:border-rose-300/50",
}

export function GlassCard({ 
  children, 
  className, 
  glowColor = "lavender",
  hover = true,
  delay = 0 
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "relative rounded-3xl",
        "bg-white/60 backdrop-blur-xl",
        "border border-white/50",
        "shadow-[0_4px_24px_rgba(168,139,250,0.08)]",
        "transition-all duration-500 ease-out",
        hover && glowColors[glowColor],
        hover && borderColors[glowColor],
        hover && "hover:-translate-y-1",
        className
      )}
    >
      {/* Inner light reflection */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
      
      {/* Subtle top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

interface GlassButtonProps {
  children: ReactNode
  className?: string
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  disabled?: boolean
}

export function GlassButton({ 
  children, 
  className, 
  variant = "primary",
  size = "md",
  onClick,
  disabled
}: GlassButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-2xl overflow-hidden"
  
  const variants = {
    primary: cn(
      "bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500",
      "text-white",
      "shadow-[0_4px_20px_rgba(168,139,250,0.4)]",
      "hover:shadow-[0_8px_30px_rgba(168,139,250,0.5)]",
      "hover:scale-[1.02]",
      "active:scale-[0.98]"
    ),
    secondary: cn(
      "bg-white/70 backdrop-blur-xl",
      "border border-white/60",
      "text-slate-700",
      "shadow-[0_2px_12px_rgba(168,139,250,0.1)]",
      "hover:bg-white/90",
      "hover:border-violet-200/60",
      "hover:shadow-[0_4px_20px_rgba(168,139,250,0.15)]"
    ),
    ghost: cn(
      "text-slate-600",
      "hover:text-slate-900",
      "hover:bg-white/50"
    ),
  }
  
  const sizes = {
    sm: "px-4 py-2.5 text-sm gap-2",
    md: "px-6 py-3 text-base gap-2.5",
    lg: "px-8 py-4 text-lg gap-3",
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Shimmer effect for primary */}
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}
