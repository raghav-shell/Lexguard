"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, FileSearch, AlertTriangle, Shield, CheckCircle, Brain } from "lucide-react"
import { useEffect, useState } from "react"

interface AnalysisOverlayProps {
  isVisible: boolean
  onComplete: () => void
}

const analysisSteps = [
  { text: "Parsing contract structure...", icon: FileSearch },
  { text: "Analyzing liability exposure...", icon: AlertTriangle },
  { text: "Evaluating arbitration fairness...", icon: Shield },
  { text: "Detecting exploitative clauses...", icon: AlertTriangle },
  { text: "Generating negotiation insights...", icon: Sparkles },
  { text: "Preparing comprehensive report...", icon: CheckCircle },
]

export function AnalysisOverlay({ isVisible, onComplete }: AnalysisOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0)
      setProgress(0)
      return
    }

    const stepDuration = 1200
    const totalSteps = analysisSteps.length

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < totalSteps - 1) {
          return prev + 1
        }
        return prev
      })
    }, stepDuration)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1
        if (newProgress >= 100) {
          clearInterval(progressInterval)
          clearInterval(stepInterval)
          setTimeout(onComplete, 500)
          return 100
        }
        return newProgress
      })
    }, 70)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
    }
  }, [isVisible, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Frosted backdrop */}
          <motion.div 
            className="absolute inset-0 backdrop-blur-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(250, 249, 255, 0.95) 0%, rgba(245, 243, 255, 0.95) 50%, rgba(253, 242, 248, 0.95) 100%)'
            }}
          />

          {/* Animated gradient orbs */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.6, 0.4],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(168, 139, 250, 0.4) 0%, transparent 70%)',
              filter: 'blur(80px)',
              left: '20%',
              top: '20%',
            }}
          />

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(244, 114, 182, 0.35) 0%, transparent 70%)',
              filter: 'blur(70px)',
              right: '15%',
              bottom: '25%',
            }}
          />

          {/* Scanning light effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: ["-100%", "200%"] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 1,
                  ease: "linear"
                }}
                className="absolute inset-x-0 h-40"
                style={{
                  background: `linear-gradient(to bottom, transparent, rgba(168, 139, 250, ${0.08 - i * 0.02}), transparent)`
                }}
              />
            ))}
          </div>

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -window.innerHeight],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "linear"
              }}
              className="absolute rounded-full"
              style={{
                width: 3 + Math.random() * 4,
                height: 3 + Math.random() * 4,
                left: `${Math.random() * 100}%`,
                bottom: -20,
                background: i % 3 === 0 
                  ? 'rgba(168, 139, 250, 0.6)' 
                  : i % 3 === 1
                    ? 'rgba(244, 114, 182, 0.5)'
                    : 'rgba(34, 211, 238, 0.5)',
              }}
            />
          ))}

          {/* Content */}
          <motion.div 
            className="relative z-10 text-center max-w-lg px-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* AI Icon with breathing glow */}
            <motion.div
              className="relative w-28 h-28 mx-auto mb-10"
            >
              {/* Outer glow rings */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-400/30 to-pink-400/30"
                style={{ filter: 'blur(20px)' }}
              />
              <motion.div
                animate={{
                  scale: [1.1, 1.3, 1.1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-400/20 to-cyan-400/20"
                style={{ filter: 'blur(30px)' }}
              />
              
              {/* Main icon container */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 flex items-center justify-center border border-white/60 shadow-[0_8px_40px_rgba(168,139,250,0.3)]"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="w-12 h-12 text-violet-500" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-slate-800 mb-3"
            >
              Analyzing Your Contract
            </motion.h2>

            {/* Current step */}
            <div className="h-10 mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="flex items-center justify-center gap-3 text-slate-500"
                >
                  {(() => {
                    const Icon = analysisSteps[currentStep].icon
                    return (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="w-5 h-5 text-violet-500" />
                      </motion.div>
                    )
                  })()}
                  <span className="text-lg">{analysisSteps[currentStep].text}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden mb-4 shadow-inner">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
              />
              
              {/* Shimmer effect */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            </div>

            {/* Progress percentage */}
            <motion.div 
              className="text-sm text-slate-400 mb-8"
              key={progress}
            >
              <span className="font-medium text-violet-500">{progress}%</span> Complete
            </motion.div>

            {/* Step indicators */}
            <div className="flex justify-center gap-2">
              {analysisSteps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                    index <= currentStep 
                      ? "bg-gradient-to-r from-violet-500 to-pink-500 shadow-[0_0_8px_rgba(168,139,250,0.5)]" 
                      : "bg-slate-200"
                  }`}
                  animate={index === currentStep ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.5 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
