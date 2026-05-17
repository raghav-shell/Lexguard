"use client"

import { motion } from "framer-motion"
import { Shield, Sparkles, ArrowRight, Play } from "lucide-react"
import { GlassButton } from "./glass-card"

interface HeroSectionProps {
  onUploadClick: () => void
}

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.1,
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1],
    },
  }),
}

export function HeroSection({ onUploadClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center">
        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_4px_20px_rgba(168,139,250,0.15)] mb-10"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Shield className="w-4 h-4 text-violet-500" />
          </motion.div>
          <span className="text-sm font-medium text-slate-600">AI-Powered Legal Intelligence</span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
          </motion.div>
        </motion.div>

        {/* Main title with staggered animation */}
        <div className="mb-6 overflow-hidden">
          <motion.h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight">
            <motion.span
              custom={0}
              initial="hidden"
              animate="visible"
              variants={wordVariants}
              className="inline-block text-gradient-pastel"
            >
              LEX
            </motion.span>
            <motion.span
              custom={1}
              initial="hidden"
              animate="visible"
              variants={wordVariants}
              className="inline-block text-slate-800"
            >
              GUARD
            </motion.span>
          </motion.h1>
        </div>

        {/* Subtitle with fade-up */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="text-xl md:text-2xl lg:text-3xl text-slate-500 font-light max-w-2xl mx-auto mb-4"
        >
          AI Contract Intelligence Before You Sign
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-12"
        >
          Understand liability exposure, detect exploitative clauses, and get negotiation recommendations — all powered by advanced AI.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <GlassButton size="lg" onClick={onUploadClick}>
            <Sparkles className="w-5 h-5" />
            Analyze Contract
            <ArrowRight className="w-5 h-5" />
          </GlassButton>
          
          <GlassButton variant="secondary" size="lg">
            <Play className="w-4 h-4" />
            Watch Demo
          </GlassButton>
        </motion.div>

        {/* Floating glass panels preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className="mt-20 relative"
        >
          <div className="relative max-w-4xl mx-auto">
            {/* Main preview card */}
            <motion.div 
              className="relative rounded-3xl overflow-hidden bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_40px_rgba(168,139,250,0.15)] p-8"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated scanning line */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <motion.div
                  animate={{ y: ["-100%", "200%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-violet-400/10 to-transparent"
                />
              </div>

              {/* Glowing border effect */}
              <motion.div
                className="absolute inset-0 rounded-3xl opacity-50"
                animate={{ 
                  boxShadow: [
                    "inset 0 0 20px rgba(168, 139, 250, 0.1)",
                    "inset 0 0 40px rgba(168, 139, 250, 0.2)",
                    "inset 0 0 20px rgba(168, 139, 250, 0.1)",
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Preview content */}
              <div className="relative z-10 grid md:grid-cols-3 gap-6">
                <PreviewCard 
                  title="Liability Exposure" 
                  value="High Risk" 
                  color="rose"
                  delay={1.1}
                />
                <PreviewCard 
                  title="Arbitration Clause" 
                  value="Unfair Terms" 
                  color="amber"
                  delay={1.2}
                />
                <PreviewCard 
                  title="Termination Rights" 
                  value="One-Sided" 
                  color="lavender"
                  delay={1.3}
                />
              </div>
            </motion.div>

            {/* Floating side cards */}
            <motion.div
              initial={{ opacity: 0, x: -40, rotate: -5 }}
              animate={{ opacity: 1, x: 0, rotate: -3 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="absolute -left-8 top-1/2 -translate-y-1/2 hidden lg:block"
            >
              <motion.div 
                className="w-36 h-28 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(168,139,250,0.15)] p-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-2">
                  <Shield className="w-5 h-5 text-violet-500" />
                </div>
                <div className="text-xs text-slate-400">Status</div>
                <div className="text-sm font-medium text-slate-700">Protected</div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40, rotate: 5 }}
              animate={{ opacity: 1, x: 0, rotate: 3 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="absolute -right-8 top-1/3 hidden lg:block"
            >
              <motion.div 
                className="w-40 h-32 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(244,114,182,0.15)] p-4"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center mb-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-xs text-slate-400">AI Analysis</div>
                <div className="text-sm font-medium text-slate-700">98% Accurate</div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "98%" }}
                    transition={{ duration: 1.5, delay: 2 }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function PreviewCard({ 
  title, 
  value, 
  color,
  delay 
}: { 
  title: string
  value: string
  color: "rose" | "amber" | "lavender"
  delay: number
}) {
  const colorClasses = {
    rose: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-600",
      dot: "bg-rose-400",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-600",
      dot: "bg-amber-400",
    },
    lavender: {
      bg: "bg-violet-50",
      border: "border-violet-200",
      text: "text-violet-600",
      dot: "bg-violet-400",
    },
  }

  const classes = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      className="text-left"
    >
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
        <motion.div 
          className={`w-1.5 h-1.5 rounded-full ${classes.dot}`}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {title}
      </div>
      <div className={`inline-flex px-3 py-1.5 rounded-xl text-sm font-medium border ${classes.bg} ${classes.border} ${classes.text}`}>
        {value}
      </div>
    </motion.div>
  )
}
