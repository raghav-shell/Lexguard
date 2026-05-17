"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import { Shield, Menu, X, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState, useRef } from "react"
import { GlassButton } from "./glass-card"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.nav
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-0 left-0 right-0 z-40 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="flex items-center justify-between px-6 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_4px_30px_rgba(168,139,250,0.1)] relative overflow-hidden"
          whileHover={{ boxShadow: "0 8px 40px rgba(168, 139, 250, 0.15)" }}
          transition={{ duration: 0.3 }}
        >
          {/* Subtle animated gradient in navbar */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                "linear-gradient(90deg, rgba(168, 139, 250, 0.05) 0%, transparent 50%, rgba(244, 114, 182, 0.05) 100%)",
                "linear-gradient(90deg, rgba(244, 114, 182, 0.05) 0%, transparent 50%, rgba(168, 139, 250, 0.05) 100%)",
              ]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group relative z-10">
            <motion.div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25 relative overflow-hidden"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Shimmer on logo */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
              <Shield className="w-5 h-5 text-white relative z-10" />
            </motion.div>
            <span className="text-lg font-bold">
              <span className="text-gradient-pastel">LEX</span>
              <span className="text-slate-800">GUARD</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 relative z-10">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How it Works</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4 relative z-10">
            <motion.button 
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium px-3 py-2 rounded-xl hover:bg-white/50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>
            <GlassButton size="sm">
              <Sparkles className="w-3.5 h-3.5" />
              Get Started
            </GlassButton>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-xl hover:bg-white/50 transition-colors relative z-10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-slate-600" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600" />
              )}
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isMenuOpen 
            ? { opacity: 1, height: "auto", marginTop: 12, y: 0 } 
            : { opacity: 0, height: 0, marginTop: 0, y: -10 }
          }
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="md:hidden overflow-hidden"
        >
          <motion.div 
            className="px-6 py-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg"
          >
            <div className="flex flex-col gap-2">
              <MobileNavLink href="#features" onClick={() => setIsMenuOpen(false)}>Features</MobileNavLink>
              <MobileNavLink href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How it Works</MobileNavLink>
              <MobileNavLink href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</MobileNavLink>
              <hr className="border-slate-100 my-3" />
              <button className="text-left text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium py-2 px-3 rounded-xl hover:bg-slate-50">
                Sign In
              </button>
              <GlassButton size="sm" className="w-full justify-center mt-2">
                <Sparkles className="w-3.5 h-3.5" />
                Get Started
              </GlassButton>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const mouseX = useMotionValue(0)
  const springX = useSpring(mouseX, { damping: 25, stiffness: 200 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!linkRef.current) return
    const rect = linkRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    mouseX.set((e.clientX - centerX) * 0.1)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
  }

  return (
    <motion.a
      ref={linkRef}
      href={href}
      style={{ x: springX }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium py-2 px-1"
      whileHover={{ y: -2 }}
    >
      {children}
      <motion.div
        className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full origin-left"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      />
    </motion.a>
  )
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.a
      href={href}
      onClick={onClick}
      className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium py-3 px-4 rounded-xl hover:bg-slate-50"
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.a>
  )
}
