"use client"

import { useEffect, useRef, useState } from "react"

export function AnalysisOverlay({ onCancel }: { onCancel: () => void }) {
  const panel = useRef<HTMLDivElement>(null)
  const cancel = useRef<HTMLButtonElement>(null)
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    cancel.current?.focus()
    const started = Date.now()
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel()
      if (event.key === "Tab") { event.preventDefault(); cancel.current?.focus() }
    }
    document.addEventListener("keydown", keydown)
    return () => {
      clearInterval(timer)
      document.removeEventListener("keydown", keydown)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-50 bg-violet-50/95 backdrop-blur-xl flex items-center justify-center px-6">
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="analysis-title" aria-describedby="analysis-description"
        className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center">
        <div className="h-12 w-12 mx-auto mb-5 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        <h2 id="analysis-title" className="text-2xl font-bold text-slate-900">Reviewing your contract</h2>
        <p id="analysis-description" role="status" className="mt-3 text-slate-600">
          Reading the document, checking contract terms, and verifying quoted evidence. Longer documents can take more time.
        </p>
        <p className="text-sm text-slate-500 my-5">{elapsed} seconds elapsed</p>
        <button ref={cancel} type="button" onClick={onCancel} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-violet-600">Cancel review</button>
      </div>
    </div>
  )
}
