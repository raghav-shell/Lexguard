"use client"

import { motion } from "framer-motion"
import { Shield, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { GlassButton } from "./glass-card"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-0 left-0 right-0 z-40 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-6 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_4px_24px_rgba(168,139,250,0.1)]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div 
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-lg font-bold">
              <span className="text-gradient-pastel">LEX</span>
              <span className="text-slate-800">GUARD</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How it Works</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <motion.button 
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>
            <GlassButton size="sm">
              Get Started
            </GlassButton>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-slate-600" />
            ) : (
              <Menu className="w-5 h-5 text-slate-600" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isMenuOpen ? { opacity: 1, height: "auto", marginTop: 12 } : { opacity: 0, height: 0, marginTop: 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg">
            <div className="flex flex-col gap-3">
              <MobileNavLink href="#features" onClick={() => setIsMenuOpen(false)}>Features</MobileNavLink>
              <MobileNavLink href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How it Works</MobileNavLink>
              <MobileNavLink href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</MobileNavLink>
              <hr className="border-slate-100 my-2" />
              <button className="text-left text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium py-2">
                Sign In
              </button>
              <GlassButton size="sm" className="w-full justify-center">
                Get Started
              </GlassButton>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.a
      href={href}
      className="relative text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
      whileHover={{ y: -1 }}
    >
      {children}
      <motion.div
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.a>
  )
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium py-2"
    >
      {children}
    </a>
  )
}
