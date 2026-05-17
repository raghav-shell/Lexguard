"use client"

import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion"
import { Shield, Sparkles, ArrowRight, Play, FileSearch, Brain, Zap, Eye } from "lucide-react"
import { GlassButton } from "./glass-card"
import { useRef, useEffect } from "react"

interface HeroSectionProps {
  onUploadClick: () => void
}

const letterVariants = {
  hidden: { opacity: 0, y: 50, rotateX: -90 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: 0.4 + i * 0.05,
      duration: 0.8,
      ease: [0.23, 1, 0.32, 1],
    },
  }),
}

const floatingPanels = [
  { icon: Shield, label: "Liability", value: "Protected", color: "emerald", delay: 0.8 },
  { icon: Eye, label: "Clauses", value: "12 Found", color: "violet", delay: 1.0 },
  { icon: Zap, label: "Risk Score", value: "72/100", color: "amber", delay: 1.2 },
]

export function HeroSection({ onUploadClick }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 })
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 })
  
  // Magnetic button effect
  const buttonRef = useRef<HTMLDivElement>(null)
  const buttonX = useMotionValue(0)
  const buttonY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 200 }
  const buttonXSpring = useSpring(buttonX, springConfig)
  const buttonYSpring = useSpring(buttonY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        mouseX.set(x * 3)
        mouseY.set(y * -3)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  const handleButtonMouseMove = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      buttonX.set((e.clientX - centerX) * 0.15)
      buttonY.set((e.clientY - centerY) * 0.15)
    }
  }

  const handleButtonMouseLeave = () => {
    buttonX.set(0)
    buttonY.set(0)
  }

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden">
      {/* Animated AI orb in background */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Outer glow rings */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              width: 400 + i * 100,
              height: 400 + i * 100,
              left: -(200 + i * 50),
              top: -(200 + i * 50),
              background: `radial-gradient(circle, rgba(168, 139, 250, ${0.08 - i * 0.015}) 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Floating badge with shimmer */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_4px_24px_rgba(168,139,250,0.2)] mb-12 relative overflow-hidden"
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Brain className="w-4 h-4 text-violet-500" />
          </motion.div>
          <span className="text-sm font-medium text-slate-600 relative z-10">AI-Powered Legal Intelligence</span>
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
          </motion.div>
        </motion.div>

        {/* Main title with cinematic letter animation */}
        <div className="mb-8 overflow-hidden perspective-1000">
          <motion.h1 className="text-7xl md:text-8xl lg:text-[10rem] font-bold tracking-tight leading-none">
            {/* LEX with gradient shimmer */}
            <span className="inline-block">
              {"LEX".split("").map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={letterVariants}
                  className="inline-block animate-shimmer-text"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
            {/* GUARD in solid color */}
            <span className="inline-block">
              {"GUARD".split("").map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i + 3}
                  initial="hidden"
                  animate="visible"
                  variants={letterVariants}
                  className="inline-block text-slate-800"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </motion.h1>
        </div>

        {/* Animated subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="mb-5"
        >
          <p className="text-2xl md:text-3xl lg:text-4xl text-slate-500 font-light">
            AI Contract Intelligence{" "}
            <span className="text-gradient-pastel font-medium">Before You Sign</span>
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className="text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-14"
        >
          Understand liability exposure, detect exploitative clauses, and get negotiation recommendations — all powered by advanced AI.
        </motion.p>

        {/* CTA Buttons with magnetic effect */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <motion.div
            ref={buttonRef}
            style={{ x: buttonXSpring, y: buttonYSpring }}
            onMouseMove={handleButtonMouseMove}
            onMouseLeave={handleButtonMouseLeave}
          >
            <GlassButton size="lg" onClick={onUploadClick}>
              <Sparkles className="w-5 h-5" />
              Analyze Contract
              <ArrowRight className="w-5 h-5" />
            </GlassButton>
          </motion.div>
          
          <GlassButton variant="secondary" size="lg">
            <Play className="w-4 h-4" />
            Watch Demo
          </GlassButton>
        </motion.div>

        {/* Floating holographic preview panels */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.1, ease: [0.23, 1, 0.32, 1] }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Main preview card with parallax */}
          <motion.div 
            className="relative rounded-3xl overflow-hidden bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_60px_rgba(168,139,250,0.15)] p-8"
            style={{
              transform: useMotionTemplate`perspective(1000px) rotateX(${smoothMouseY}deg) rotateY(${smoothMouseX}deg)`,
            }}
          >
            {/* Animated scanning overlay */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              {/* Horizontal scan lines */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: ["-100%", "200%"] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 1.3,
                    ease: "linear"
                  }}
                  className="absolute inset-x-0 h-32"
                  style={{
                    background: `linear-gradient(to bottom, transparent, rgba(168, 139, 250, ${0.06 - i * 0.015}), transparent)`
                  }}
                />
              ))}
              
              {/* Corner scan effect */}
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-violet-400/30 rounded-tl-3xl"
              />
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-violet-400/30 rounded-tr-3xl"
              />
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-violet-400/30 rounded-bl-3xl"
              />
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-violet-400/30 rounded-br-3xl"
              />
            </div>

            {/* Glowing border animation */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              animate={{ 
                boxShadow: [
                  "inset 0 0 30px rgba(168, 139, 250, 0.05)",
                  "inset 0 0 60px rgba(168, 139, 250, 0.1)",
                  "inset 0 0 30px rgba(168, 139, 250, 0.05)",
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Preview content */}
            <div className="relative z-10 grid md:grid-cols-3 gap-6">
              <PreviewCard 
                title="Liability Exposure" 
                value="High Risk" 
                color="rose"
                delay={1.3}
                percentage={72}
              />
              <PreviewCard 
                title="Arbitration Clause" 
                value="Unfair Terms" 
                color="amber"
                delay={1.4}
                percentage={85}
              />
              <PreviewCard 
                title="Overall Fairness" 
                value="One-Sided" 
                color="lavender"
                delay={1.5}
                percentage={34}
              />
            </div>

            {/* Bottom status bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                />
                <span className="text-sm text-slate-400">AI Analysis Active</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <FileSearch className="w-4 h-4 text-violet-400" />
                <span>24 clauses analyzed</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating side panels with depth */}
          {floatingPanels.map((panel, index) => {
            const Icon = panel.icon
            const isLeft = index === 0
            const isRight = index === 2
            const position = isLeft 
              ? { left: -60, top: '20%' } 
              : isRight 
                ? { right: -60, top: '40%' }
                : { right: -40, top: '10%' }
            
            return (
              <motion.div
                key={panel.label}
                initial={{ opacity: 0, x: isLeft ? -40 : 40, rotate: isLeft ? -8 : 8 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  rotate: isLeft ? -4 : 4,
                  y: [0, -15, 0],
                }}
                transition={{ 
                  opacity: { duration: 0.8, delay: panel.delay },
                  x: { duration: 0.8, delay: panel.delay },
                  rotate: { duration: 0.8, delay: panel.delay },
                  y: { duration: 4 + index, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }
                }}
                className="absolute hidden lg:block"
                style={position}
              >
                <motion.div 
                  className="w-44 h-36 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_40px_rgba(168,139,250,0.15)] p-5 relative overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent" />
                  
                  <motion.div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                      panel.color === 'emerald' ? 'bg-gradient-to-br from-emerald-100 to-emerald-50' :
                      panel.color === 'violet' ? 'bg-gradient-to-br from-violet-100 to-purple-50' :
                      'bg-gradient-to-br from-amber-100 to-amber-50'
                    }`}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className={`w-6 h-6 ${
                      panel.color === 'emerald' ? 'text-emerald-500' :
                      panel.color === 'violet' ? 'text-violet-500' :
                      'text-amber-500'
                    }`} />
                  </motion.div>
                  <div className="text-xs text-slate-400 mb-1">{panel.label}</div>
                  <div className="text-base font-semibold text-slate-700">{panel.value}</div>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

function PreviewCard({ 
  title, 
  value, 
  color,
  delay,
  percentage
}: { 
  title: string
  value: string
  color: "rose" | "amber" | "lavender"
  delay: number
  percentage: number
}) {
  const colorClasses = {
    rose: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-600",
      dot: "bg-rose-400",
      bar: "from-rose-400 to-rose-500",
      glow: "shadow-[0_0_12px_rgba(251,113,133,0.4)]",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-600",
      dot: "bg-amber-400",
      bar: "from-amber-400 to-amber-500",
      glow: "shadow-[0_0_12px_rgba(251,191,36,0.4)]",
    },
    lavender: {
      bg: "bg-violet-50",
      border: "border-violet-200",
      text: "text-violet-600",
      dot: "bg-violet-400",
      bar: "from-violet-400 to-violet-500",
      glow: "shadow-[0_0_12px_rgba(168,139,250,0.4)]",
    },
  }

  const classes = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
      className="text-left p-4 rounded-2xl bg-white/50 border border-white/60"
    >
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
        <motion.div 
          className={`w-2 h-2 rounded-full ${classes.dot} ${classes.glow}`}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {title}
      </div>
      <div className={`inline-flex px-3 py-1.5 rounded-xl text-sm font-semibold border mb-3 ${classes.bg} ${classes.border} ${classes.text}`}>
        {value}
      </div>
      
      {/* Animated progress bar */}
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, delay: delay + 0.3, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r rounded-full ${classes.bar}`}
        />
      </div>
    </motion.div>
  )
}
