"use client"
import Link from "next/link"

export function Navbar({ onUploadClick, onDemoClick }: { onUploadClick: () => void; onDemoClick: () => void }) {
  return (
    <nav aria-label="Main navigation" className="relative z-40 px-6 py-5 bg-white/70 border-b border-violet-100">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-violet-900">LEXGUARD</Link>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
          <a href="#features" className="hover:underline">Features</a>
          <a href="#how-it-works" className="hover:underline">How it works</a>
          <a href="#privacy" className="hover:underline">Privacy</a>
          <button type="button" onClick={onDemoClick} className="font-semibold text-violet-800 underline underline-offset-4">Sample report</button>
          <button type="button" onClick={onUploadClick} className="bg-violet-700 text-white font-semibold rounded-xl px-4 py-2">Review a contract</button>
        </div>
      </div>
    </nav>
  )
}
