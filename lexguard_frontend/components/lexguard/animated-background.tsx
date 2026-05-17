"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base warm white gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #faf9ff 0%, #f5f3ff 30%, #fdf2f8 60%, #f0fdfa 100%)'
        }}
      />
      
      {/* Animated mesh gradient that follows mouse */}
      <div 
        className="absolute inset-0 opacity-70 transition-all duration-1000 ease-out"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at ${mousePosition.x}% ${mousePosition.y}%, rgba(168, 139, 250, 0.25), transparent 50%),
            radial-gradient(ellipse 50% 40% at 80% 20%, rgba(244, 114, 182, 0.2), transparent 50%),
            radial-gradient(ellipse 40% 30% at 20% 80%, rgba(34, 211, 238, 0.15), transparent 50%),
            radial-gradient(ellipse 45% 35% at 70% 70%, rgba(251, 191, 36, 0.12), transparent 50%)
          `
        }}
      />

      {/* Floating pastel blobs */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full animate-blob-move"
        style={{
          background: 'radial-gradient(circle, rgba(196, 181, 253, 0.4) 0%, rgba(196, 181, 253, 0) 70%)',
          filter: 'blur(60px)',
        }}
      />
      
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[40%] right-[10%] w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(244, 114, 182, 0.3) 0%, rgba(244, 114, 182, 0) 70%)',
          filter: 'blur(80px)',
        }}
      />
      
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[10%] left-[30%] w-[450px] h-[450px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.25) 0%, rgba(34, 211, 238, 0) 70%)',
          filter: 'blur(70px)',
        }}
      />

      <motion.div
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[60%] left-[5%] w-[350px] h-[350px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0) 70%)',
          filter: 'blur(50px)',
        }}
      />

      <motion.div
        animate={{
          x: [0, 25, 0],
          y: [0, -35, 0],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[5%] right-[25%] w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0) 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Floating light particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
          className="absolute rounded-full"
          style={{
            width: 6 + i * 2,
            height: 6 + i * 2,
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
            background: i % 2 === 0 
              ? 'rgba(168, 139, 250, 0.5)' 
              : 'rgba(244, 114, 182, 0.4)',
            filter: 'blur(1px)',
          }}
        />
      ))}

      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 139, 250, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 139, 250, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Ambient light effect at top */}
      <div 
        className="absolute top-0 left-0 right-0 h-[400px] opacity-40"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, transparent 100%)'
        }}
      />
    </div>
  )
}
