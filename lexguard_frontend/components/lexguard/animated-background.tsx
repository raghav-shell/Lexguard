"use client"

import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion"
import { useEffect, useRef, useState } from "react"

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Smooth mouse tracking without triggering React state re-renders
  const mouseX = useMotionValue(50)
  const mouseY = useMotionValue(50)
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 100 })
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 100 })

  useEffect(() => {
    if (isMobile) return
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      mouseX.set(x)
      mouseY.set(y)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY, isMobile])

  if (isMobile) {
    return (
      <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Base gradient - warm and inviting, zero GPU/CPU cost */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #faf9ff 0%, #f5f3ff 25%, #fdf2f8 50%, #f0fdfa 75%, #fef3c7 100%)'
          }}
        />
        {/* Subtle noise texture for depth */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Vignette effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(250, 249, 255, 0.3) 100%)'
          }}
        />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient - warm and inviting */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #faf9ff 0%, #f5f3ff 25%, #fdf2f8 50%, #f0fdfa 75%, #fef3c7 100%)'
        }}
      />
      
      {/* Animated mesh gradient that responds to mouse */}
      <motion.div 
        className="absolute inset-0 opacity-80"
        style={{
          background: useMotionTemplate`
            radial-gradient(ellipse 80% 60% at ${smoothX}% ${smoothY}%, rgba(168, 139, 250, 0.2), transparent 50%),
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(244, 114, 182, 0.15), transparent 50%),
            radial-gradient(ellipse 50% 40% at 20% 80%, rgba(34, 211, 238, 0.12), transparent 50%),
            radial-gradient(ellipse 70% 50% at 70% 70%, rgba(251, 191, 36, 0.08), transparent 50%),
            radial-gradient(ellipse 40% 30% at 30% 30%, rgba(52, 211, 153, 0.1), transparent 50%)
          `
        }}
      />

      {/* Large morphing blobs with breathing animation */}
      <motion.div
        className="absolute w-[700px] h-[700px] animate-blob-morph"
        style={{
          top: '5%',
          left: '10%',
          background: 'radial-gradient(circle, rgba(196, 181, 253, 0.35) 0%, rgba(196, 181, 253, 0) 70%)',
        }}
      />
      
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[800px] h-[800px]"
        style={{
          top: '30%',
          right: '5%',
          background: 'radial-gradient(circle, rgba(244, 114, 182, 0.3) 0%, rgba(244, 114, 182, 0) 70%)',
        }}
      />
      
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[600px] h-[600px]"
        style={{
          bottom: '5%',
          left: '25%',
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.25) 0%, rgba(34, 211, 238, 0) 70%)',
        }}
      />

      <motion.div
        animate={{
          scale: [1, 0.9, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[500px] h-[500px]"
        style={{
          top: '60%',
          left: '0%',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0) 70%)',
        }}
      />

      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[450px] h-[450px]"
        style={{
          top: '0%',
          right: '20%',
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0) 70%)',
        }}
      />

      {/* Moving ambient light beams */}
      <motion.div
        animate={{ 
          x: ['-100%', '200%'],
          opacity: [0, 0.15, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/4 w-[300px] h-[800px] rotate-12"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(168, 139, 250, 0.1), transparent)',
        }}
      />
      
      <motion.div
        animate={{ 
          x: ['200%', '-100%'],
          opacity: [0, 0.1, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
          delay: 4
        }}
        className="absolute top-1/2 w-[200px] h-[600px] -rotate-12"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(244, 114, 182, 0.08), transparent)',
        }}
      />

      {/* Floating light particles - premium feel */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 5 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
          className="absolute rounded-full"
          style={{
            width: 4 + (i % 4) * 2,
            height: 4 + (i % 4) * 2,
            left: `${5 + i * 4.5}%`,
            top: `${15 + (i % 5) * 18}%`,
            background: i % 4 === 0 
              ? 'rgba(168, 139, 250, 0.5)' 
              : i % 4 === 1
                ? 'rgba(244, 114, 182, 0.4)'
                : i % 4 === 2
                  ? 'rgba(34, 211, 238, 0.4)'
                  : 'rgba(52, 211, 153, 0.35)',
            boxShadow: i % 3 === 0 ? '0 0 10px rgba(168, 139, 250, 0.5)' : 'none',
          }}
        />
      ))}

      {/* Subtle animated grid overlay */}
      <motion.div 
        className="absolute inset-0 opacity-[0.025]"
        animate={{
          backgroundPosition: ['0px 0px', '60px 60px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 139, 250, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 139, 250, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Top ambient light diffusion */}
      <div 
        className="absolute top-0 left-0 right-0 h-[500px] opacity-50"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, transparent 100%)'
        }}
      />

      {/* Subtle noise texture for depth */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(250, 249, 255, 0.3) 100%)'
        }}
      />
    </div>
  )
}
