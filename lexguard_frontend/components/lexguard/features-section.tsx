"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { Sparkles, Shield, Scale, FileSearch, Zap, Lock, Brain, Eye, ChevronRight } from "lucide-react"
import { GlassCard } from "./glass-card"
import { cn } from "@/lib/utils"
import { useRef } from "react"

const features = [
  {
    icon: FileSearch,
    title: "Deep Contract Analysis",
    description: "Our AI reads and understands complex legal documents, identifying every clause that could affect you.",
    color: "lavender",
    stat: "24+ clause types",
  },
  {
    icon: Shield,
    title: "Risk Detection",
    description: "Automatically flags liability exposure, unfair terms, and potentially exploitative clauses.",
    color: "pink",
    stat: "98% accuracy",
  },
  {
    icon: Scale,
    title: "Fairness Assessment",
    description: "Evaluates arbitration clauses, jurisdiction terms, and whether the contract is balanced.",
    color: "cyan",
    stat: "Real-time scoring",
  },
  {
    icon: Brain,
    title: "Plain English Explanations",
    description: "Translates complex legal jargon into clear, understandable language anyone can follow.",
    color: "emerald",
    stat: "Instant clarity",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get comprehensive analysis in seconds, not hours. Review contracts before important meetings.",
    color: "amber",
    stat: "< 30 seconds",
  },
  {
    icon: Lock,
    title: "Private & Secure",
    description: "Your documents are encrypted and never stored. Analysis happens in real-time, then deleted.",
    color: "lavender",
    stat: "Zero storage",
  },
]

const colorClasses = {
  lavender: {
    iconBg: "bg-gradient-to-br from-violet-100 to-violet-50",
    iconColor: "text-violet-500",
    glow: "lavender" as const,
    glowColor: "rgba(168, 139, 250, 0.3)",
    statBg: "bg-violet-50",
    statText: "text-violet-600",
  },
  pink: {
    iconBg: "bg-gradient-to-br from-pink-100 to-pink-50",
    iconColor: "text-pink-500",
    glow: "pink" as const,
    glowColor: "rgba(244, 114, 182, 0.3)",
    statBg: "bg-pink-50",
    statText: "text-pink-600",
  },
  cyan: {
    iconBg: "bg-gradient-to-br from-cyan-100 to-cyan-50",
    iconColor: "text-cyan-500",
    glow: "cyan" as const,
    glowColor: "rgba(34, 211, 238, 0.3)",
    statBg: "bg-cyan-50",
    statText: "text-cyan-600",
  },
  emerald: {
    iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-50",
    iconColor: "text-emerald-500",
    glow: "emerald" as const,
    glowColor: "rgba(52, 211, 153, 0.3)",
    statBg: "bg-emerald-50",
    statText: "text-emerald-600",
  },
  amber: {
    iconBg: "bg-gradient-to-br from-amber-100 to-amber-50",
    iconColor: "text-amber-500",
    glow: "amber" as const,
    glowColor: "rgba(251, 191, 36, 0.3)",
    statBg: "bg-amber-50",
    statText: "text-amber-600",
  },
}

export function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  return (
    <section id="features" ref={containerRef} className="relative px-6 py-32 overflow-hidden">
      {/* Floating background elements with parallax */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 pointer-events-none"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-10 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 139, 250, 0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(244, 114, 182, 0.2) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </motion.div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-20"
        >
          {/* Animated badge */}
          <motion.div 
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_4px_24px_rgba(168,139,250,0.2)] mb-10 relative overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-pink-500" />
            </motion.div>
            <span className="text-sm font-medium text-slate-600 relative z-10">Powered by Advanced AI</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-6">
            Understand Every{" "}
            <span className="text-gradient-pastel">Contract</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            LEXGUARD combines cutting-edge AI with legal expertise to give you unprecedented insight into any contract.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const colors = colorClasses[feature.color as keyof typeof colorClasses]
            const Icon = feature.icon
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.6,
                  ease: [0.23, 1, 0.32, 1]
                }}
              >
                <GlassCard 
                  className="p-7 h-full group relative overflow-hidden" 
                  glowColor={colors.glow}
                  tilt
                >
                  {/* Ambient glow on hover */}
                  <motion.div
                    className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${colors.glowColor} 0%, transparent 70%)`,
                      filter: 'blur(20px)',
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <motion.div 
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center relative",
                          colors.iconBg
                        )}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {/* Icon glow */}
                        <motion.div
                          animate={{ opacity: [0.3, 0.5, 0.3] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: `radial-gradient(circle, ${colors.glowColor} 0%, transparent 70%)`,
                            filter: 'blur(8px)',
                          }}
                        />
                        <Icon className={cn("w-7 h-7 relative z-10", colors.iconColor)} />
                      </motion.div>
                      
                      {/* Stat badge */}
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          colors.statBg, colors.statText
                        )}
                      >
                        {feature.stat}
                      </motion.div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">
                      {feature.description}
                    </p>

                    {/* Learn more link */}
                    <motion.div
                      className="flex items-center gap-1 text-sm font-medium text-slate-400 group-hover:text-violet-500 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <span>Learn more</span>
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-16"
        >
          <GlassCard className="inline-flex items-center gap-4 px-6 py-4" hover={false}>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Eye className="w-5 h-5 text-violet-500" />
            </motion.div>
            <span className="text-slate-600">
              Trusted by <span className="font-semibold text-slate-800">10,000+</span> professionals
            </span>
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-pink-100 border-2 border-white flex items-center justify-center text-xs font-medium text-violet-500"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
