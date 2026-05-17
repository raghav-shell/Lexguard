"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, FileSearch, AlertTriangle, Shield, CheckCircle, Brain, Zap, Eye, Scale, Lock } from "lucide-react"
import { useEffect, useState, useRef } from "react"

interface AnalysisOverlayProps {
  isVisible: boolean
  statusMessage: string
  onComplete?: () => void // Optional now, since we control completion from parent
}

const analysisSteps = [
  { text: "Parsing contract structure...", icon: FileSearch, color: "violet" },
  { text: "Scanning liability exposure...", icon: AlertTriangle, color: "rose" },
  { text: "Evaluating arbitration fairness...", icon: Scale, color: "amber" },
  { text: "Detecting exploitative clauses...", icon: Eye, color: "pink" },
  { text: "Analyzing intellectual property transfer...", icon: Lock, color: "cyan" },
  { text: "Assessing contract fairness score...", icon: Zap, color: "emerald" },
  { text: "Generating negotiation insights...", icon: Sparkles, color: "violet" },
  { text: "Preparing comprehensive report...", icon: CheckCircle, color: "emerald" },
]

export function AnalysisOverlay({ isVisible, statusMessage, onComplete }: AnalysisOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  // Typing effect for status messages
  useEffect(() => {
    if (!isVisible || !statusMessage) return
    
    const fullText = statusMessage
    let index = 0
    setDisplayText("")
    
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(typingInterval)
      }
    }, 20) // faster typing

    return () => clearInterval(typingInterval)
  }, [statusMessage, isVisible])

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0)
      setProgress(0)
      return
    }

    const stepDuration = 900
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
          setTimeout(onComplete, 600)
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
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Premium frosted backdrop */}
          <motion.div 
            className="absolute inset-0 backdrop-blur-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(250, 249, 255, 0.97) 0%, rgba(245, 243, 255, 0.97) 50%, rgba(253, 242, 248, 0.97) 100%)'
            }}
          />

          {/* Animated gradient mesh background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Large breathing gradient orbs */}
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, 100, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(168, 139, 250, 0.4) 0%, transparent 70%)',
                filter: 'blur(100px)',
                left: '10%',
                top: '10%',
              }}
            />

            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.25, 0.45, 0.25],
                x: [0, -80, 0],
                y: [0, 60, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute w-[500px] h-[500px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(244, 114, 182, 0.35) 0%, transparent 70%)',
                filter: 'blur(80px)',
                right: '10%',
                bottom: '20%',
              }}
            />

            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute w-[400px] h-[400px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)',
                filter: 'blur(70px)',
                left: '30%',
                bottom: '10%',
              }}
            />
          </div>

          {/* Scanning light sweeps */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: ["-100%", "200%"] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "linear"
                }}
                className="absolute inset-x-0 h-48"
                style={{
                  background: `linear-gradient(to bottom, transparent, rgba(168, 139, 250, ${0.1 - i * 0.02}), transparent)`
                }}
              />
            ))}
            
            {/* Horizontal scan sweep */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-1/2 -translate-y-1/2 w-64 h-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(168, 139, 250, 0.08), transparent)',
                transform: 'skewX(-15deg)',
              }}
            />
          </div>

          {/* Floating neural particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -window.innerHeight * 1.2],
                opacity: [0, 0.8, 0.8, 0],
                scale: [0.5, 1, 1, 0.5],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "linear"
              }}
              className="absolute rounded-full"
              style={{
                width: 3 + Math.random() * 5,
                height: 3 + Math.random() * 5,
                left: `${Math.random() * 100}%`,
                bottom: -20,
                background: i % 4 === 0 
                  ? 'rgba(168, 139, 250, 0.7)' 
                  : i % 4 === 1
                    ? 'rgba(244, 114, 182, 0.6)'
                    : i % 4 === 2
                      ? 'rgba(34, 211, 238, 0.6)'
                      : 'rgba(52, 211, 153, 0.5)',
                boxShadow: `0 0 ${8 + i % 5}px ${
                  i % 4 === 0 ? 'rgba(168, 139, 250, 0.5)' :
                  i % 4 === 1 ? 'rgba(244, 114, 182, 0.4)' :
                  i % 4 === 2 ? 'rgba(34, 211, 238, 0.4)' :
                  'rgba(52, 211, 153, 0.4)'
                }`,
              }}
            />
          ))}

          {/* Main content */}
          <motion.div 
            className="relative z-10 text-center max-w-xl px-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* AI Core Animation - The centerpiece */}
            <motion.div className="relative w-36 h-36 mx-auto mb-12">
              {/* Outer energy rings */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2"
                  style={{
                    borderColor: `rgba(168, 139, 250, ${0.2 - i * 0.04})`,
                    transform: `scale(${1 + i * 0.3})`,
                  }}
                  animate={{
                    scale: [1 + i * 0.3, 1.2 + i * 0.3, 1 + i * 0.3],
                    opacity: [0.3, 0.6, 0.3],
                    rotate: i % 2 === 0 ? [0, 360] : [360, 0],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}
              
              {/* Pulsing glow background */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(168, 139, 250, 0.4) 0%, transparent 70%)',
                  filter: 'blur(25px)',
                }}
              />
              
              {/* Inner glowing core */}
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-4 rounded-3xl bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 flex items-center justify-center border border-white/60 shadow-[0_8px_50px_rgba(168,139,250,0.35)]"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="w-14 h-14 text-violet-500" />
                </motion.div>
              </motion.div>

              {/* Orbiting particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: i % 2 === 0 
                      ? 'linear-gradient(135deg, #a78bfa, #c4b5fd)' 
                      : 'linear-gradient(135deg, #f472b6, #fb7185)',
                    boxShadow: i % 2 === 0 
                      ? '0 0 12px rgba(168, 139, 250, 0.6)' 
                      : '0 0 12px rgba(244, 114, 182, 0.6)',
                    left: '50%',
                    top: '50%',
                    marginLeft: -6,
                    marginTop: -6,
                  }}
                  animate={{
                    rotate: [i * 60, i * 60 + 360],
                  }}
                  transition={{
                    duration: 6 + i,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <motion.div
                    style={{
                      position: 'absolute',
                      left: 60 + i * 8,
                    }}
                    className="w-3 h-3 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 1 + i * 0.2,
                      repeat: Infinity,
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-slate-800 mb-4"
            >
              Analyzing Your Contract
            </motion.h2>

            {/* Animated status message with typing effect */}
            <div className="h-12 mb-10 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="flex items-center justify-center gap-3"
                >
                  {(() => {
                    const step = analysisSteps[currentStep]
                    const Icon = step.icon
                    const colorClass = 
                      step.color === 'violet' ? 'text-violet-500' :
                      step.color === 'rose' ? 'text-rose-500' :
                      step.color === 'amber' ? 'text-amber-500' :
                      step.color === 'pink' ? 'text-pink-500' :
                      step.color === 'cyan' ? 'text-cyan-500' :
                      'text-emerald-500'
                    
                    return (
                      <>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon className={`w-5 h-5 ${colorClass}`} />
                        </motion.div>
                        <span className="text-lg text-slate-600">
                          {displayText}
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="inline-block w-0.5 h-5 bg-violet-400 ml-0.5 align-middle"
                          />
                        </span>
                      </>
                    )
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Premium progress bar */}
            <div className="relative mb-6">
              <div className="relative h-3 rounded-full bg-slate-100/80 overflow-hidden shadow-inner">
                {/* Animated gradient progress */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #a78bfa, #c084fc, #f472b6, #fb7185)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{
                    width: `${progress}%`,
                    backgroundPosition: ['0% 0%', '100% 0%'],
                  }}
                  transition={{
                    width: { ease: "linear" },
                    backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
                  }}
                />
                
                {/* Multiple shimmer layers */}
                <motion.div
                  animate={{ x: ["-150%", "250%"] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                />
                <motion.div
                  animate={{ x: ["-150%", "250%"] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.4 }}
                  className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </div>
              
              {/* Glow effect under progress */}
              <motion.div
                className="absolute -bottom-2 left-0 h-4 rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, rgba(168, 139, 250, 0.3), rgba(244, 114, 182, 0.3))',
                  filter: 'blur(8px)',
                }}
              />
            </div>

            {/* Progress percentage with animation */}
            <motion.div 
              className="text-sm text-slate-400 mb-10"
            >
              <motion.span 
                className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-500"
                key={progress}
              >
                {progress}%
              </motion.span>
              <span className="ml-2">Complete</span>
            </motion.div>

            {/* Step indicators with active glow */}
            <div className="flex justify-center gap-2">
              {analysisSteps.map((_, index) => (
                <motion.div
                  key={index}
                  className="relative"
                >
                  {/* Glow behind active step */}
                  {index === currentStep && (
                    <motion.div
                      layoutId="stepGlow"
                      className="absolute inset-0 rounded-full bg-violet-400"
                      style={{ filter: 'blur(6px)' }}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                  <motion.div
                    className={`relative w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                      index <= currentStep 
                        ? "bg-gradient-to-r from-violet-500 to-pink-500" 
                        : "bg-slate-200"
                    }`}
                    animate={index === currentStep ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.5, repeat: index === currentStep ? Infinity : 0 }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
