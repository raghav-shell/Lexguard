"use client"

import { motion } from "framer-motion"
import { Sparkles, Shield, Scale, FileSearch, Zap, Lock } from "lucide-react"
import { GlassCard } from "./glass-card"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: FileSearch,
    title: "Deep Contract Analysis",
    description: "Our AI reads and understands complex legal documents, identifying every clause that could affect you.",
    color: "lavender",
  },
  {
    icon: Shield,
    title: "Risk Detection",
    description: "Automatically flags liability exposure, unfair terms, and potentially exploitative clauses.",
    color: "pink",
  },
  {
    icon: Scale,
    title: "Fairness Assessment",
    description: "Evaluates arbitration clauses, jurisdiction terms, and whether the contract is balanced.",
    color: "cyan",
  },
  {
    icon: Sparkles,
    title: "Plain English Explanations",
    description: "Translates complex legal jargon into clear, understandable language anyone can follow.",
    color: "emerald",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get comprehensive analysis in seconds, not hours. Review contracts before important meetings.",
    color: "amber",
  },
  {
    icon: Lock,
    title: "Private & Secure",
    description: "Your documents are encrypted and never stored. Analysis happens in real-time, then deleted.",
    color: "lavender",
  },
]

const colorClasses = {
  lavender: {
    iconBg: "bg-violet-100",
    iconColor: "text-violet-500",
    glow: "lavender" as const,
  },
  pink: {
    iconBg: "bg-pink-100",
    iconColor: "text-pink-500",
    glow: "pink" as const,
  },
  cyan: {
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-500",
    glow: "cyan" as const,
  },
  emerald: {
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-500",
    glow: "emerald" as const,
  },
  amber: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500",
    glow: "amber" as const,
  },
}

export function FeaturesSection() {
  return (
    <section id="features" className="relative px-6 py-28">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-20"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_4px_20px_rgba(168,139,250,0.15)] mb-8"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-pink-500" />
            </motion.div>
            <span className="text-sm font-medium text-slate-600">Powered by Advanced AI</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-6">
            Understand Every Contract
          </h2>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            LEXGUARD combines cutting-edge AI with legal expertise to give you unprecedented insight into any contract.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const colors = colorClasses[feature.color as keyof typeof colorClasses]
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: [0.23, 1, 0.32, 1]
                }}
              >
                <GlassCard 
                  className="p-7 h-full" 
                  glowColor={colors.glow}
                >
                  <motion.div 
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-5",
                      colors.iconBg
                    )}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <feature.icon className={cn("w-7 h-7", colors.iconColor)} />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
