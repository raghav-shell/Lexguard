"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { useRef, useState, useEffect } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  glowColor?: "lavender" | "pink" | "cyan" | "emerald" | "amber" | "rose"
  hover?: boolean
  delay?: number
  tilt?: boolean
}

const glowColors = {
  lavender: "hover:shadow-[0_8px_50px_rgba(168,139,250,0.25)]",
  pink: "hover:shadow-[0_8px_50px_rgba(244,114,182,0.25)]",
  cyan: "hover:shadow-[0_8px_50px_rgba(34,211,238,0.25)]",
  emerald: "hover:shadow-[0_8px_50px_rgba(52,211,153,0.25)]",
  amber: "hover:shadow-[0_8px_50px_rgba(251,191,36,0.25)]",
  rose: "hover:shadow-[0_8px_50px_rgba(251,113,133,0.25)]",
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
  contentClassName,
  glowColor = "lavender",
  hover = true,
  delay = 0,
  tilt = false
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    const touchCheck = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsMobile(window.innerWidth < 768 || touchCheck)
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768 || touchCheck)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { damping: 30, stiffness: 200 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { damping: 30, stiffness: 200 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!tilt || isMobile || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tilt && !isMobile && mounted ? { rotateX, rotateY, transformPerspective: 1000 } : {}}
      className={cn(
        "relative rounded-3xl",
        "bg-white/60 backdrop-blur-xl",
        "border border-white/50",
        "shadow-[0_4px_24px_rgba(168,139,250,0.08)]",
        "transition-all duration-500 ease-out",
        hover && glowColors[glowColor],
        hover && borderColors[glowColor],
        hover && !isMobile && "hover:-translate-y-1",
        className
      )}
    >
      {/* Inner light reflection */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
      
      {/* Subtle top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      
      {/* Moving light reflection on hover */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden hidden md:block"
      >
        <motion.div
          className="absolute w-32 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
        />
      </motion.div>
      
      {/* Content */}
      <div className={cn("relative z-10 group", contentClassName)}>
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
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    const touchCheck = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsMobile(window.innerWidth < 768 || touchCheck)
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768 || touchCheck)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springConfig = { damping: 25, stiffness: 300 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile || !buttonRef.current || disabled) return
    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set((e.clientX - centerX) * 0.1)
    mouseY.set((e.clientY - centerY) * 0.1)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-2xl overflow-hidden"
  
  const variants = {
    primary: cn(
      "bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500",
      "text-white",
      "shadow-[0_4px_24px_rgba(168,139,250,0.4)]",
      "hover:shadow-[0_8px_40px_rgba(168,139,250,0.5)]",
      "md:hover:scale-[1.02]",
      "md:active:scale-[0.98]"
    ),
    secondary: cn(
      "bg-white/70 backdrop-blur-xl",
      "border border-white/60",
      "text-slate-700",
      "shadow-[0_2px_16px_rgba(168,139,250,0.1)]",
      "hover:bg-white/90",
      "hover:border-violet-200/60",
      "hover:shadow-[0_8px_30px_rgba(168,139,250,0.2)]"
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

  if (isMobile && mounted) {
    return (
      <button
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
        {variant === "primary" && (
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl" />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </button>
    )
  }

  return (
    <motion.button
      ref={buttonRef}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
      {/* Gradient glow behind button for primary */}
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.2) 0%, transparent 50%)',
          }}
        />
      )}
      
      {/* Multi-layer shimmer effect for primary */}
      {variant === "primary" && (
        <>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, delay: 0.3 }}
          />
        </>
      )}

      {/* Glossy top reflection */}
      {variant === "primary" && (
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl" />
      )}
      
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}
