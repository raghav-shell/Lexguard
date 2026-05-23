"use client"

import { motion } from "framer-motion"
import { FileText } from "lucide-react"
import { GlassCard } from "./glass-card"
import type { ClauseData } from "./clause-card"
import { cn } from "@/lib/utils"

interface ContractViewerProps {
  extractedText: string
  clauses: ClauseData[]
  activeClauseId: string | null
}

export function ContractViewer({ extractedText, clauses, activeClauseId }: ContractViewerProps) {
  // A simple function to highlight the text based on the original clauses
  // For the hackathon MVP, we will render paragraphs and highlight matching substrings
  
  const renderHighlightedText = () => {
    if (!extractedText) return <p className="text-slate-500 italic">No text extracted.</p>

    let highlightedHTML = extractedText
    
    // Sort clauses by length descending so longer matches replace first
    const sortedClauses = [...clauses].sort((a, b) => b.original_clause.length - a.original_clause.length)
    
    sortedClauses.forEach((clause) => {
      if (clause.original_clause) {
        // Create a unique placeholder to avoid nested replacements
        const isCritical = clause.severity === 'critical'
        const isHigh = clause.severity === 'high'
        
        // Define color classes based on severity
        let highlightClass = "bg-amber-100 text-amber-900 border-b-2 border-amber-300" // default medium/low
        if (isCritical) highlightClass = "bg-rose-200 text-rose-900 border-b-2 border-rose-400 font-medium"
        if (isHigh) highlightClass = "bg-rose-100 text-rose-800 border-b-2 border-rose-300"
        
        const isActive = activeClauseId === clause.clause_id
        if (isActive) {
           highlightClass += " ring-2 ring-violet-500 ring-offset-2 rounded-sm shadow-sm"
        }

        // We use a simple replace. In a robust app, we'd use a proper text tokenizer.
        // For MVP, string replacement is acceptable.
        try {
            // Escape special regex characters
            const escapedText = clause.original_clause.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const regex = new RegExp(escapedText, 'g')
            highlightedHTML = highlightedHTML.replace(
                regex, 
                `<span class="transition-all duration-300 cursor-pointer px-1 rounded-sm ${highlightClass}" data-clause-id="${clause.clause_id}">${clause.original_clause}</span>`
            )
        } catch (e) {
            console.warn("Could not highlight clause", e)
        }
      }
    })

    // Advanced heuristic PDF text visual-reconstruction algorithm
    const rawLines = highlightedHTML.split('\n')
    const paragraphs: string[] = []
    let currentParagraph = ""

    rawLines.forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed) {
        if (currentParagraph) {
          paragraphs.push(currentParagraph)
          currentParagraph = ""
        }
        return
      }

      // Heuristics to detect if this line is a heading/block boundary:
      const isShort = trimmed.length < 45
      const isTerminal = /[.:;?!"]$/.test(trimmed)
      const isHeader = /^[A-Z\s\d\W]+$/.test(trimmed) || /^\d+(\.\d+)*\s+[A-Z]/.test(trimmed)

      if (currentParagraph) {
        const prevTrimmed = currentParagraph.replace(/<[^>]*>/g, '').trim() // Strip HTML tags for heuristic matching
        const prevIsShort = prevTrimmed.length < 45
        const prevIsTerminal = /[.:;?!"]$/.test(prevTrimmed)
        
        if (isHeader || prevIsShort || prevIsTerminal) {
          paragraphs.push(currentParagraph)
          currentParagraph = line
        } else {
          // Line wrap: check if current line looks like a list item
          const isListItem = /^\s*[-*•\d+\.]/.test(trimmed)
          if (isListItem) {
            currentParagraph += "<br />" + line
          } else {
            currentParagraph += " " + line
          }
        }
      } else {
        currentParagraph = line
      }
    })

    if (currentParagraph) {
      paragraphs.push(currentParagraph)
    }

    return paragraphs.map((p, i) => {
      const trimmedText = p.replace(/<[^>]*>/g, '').trim() // Strip HTML tags to measure raw content
      
      // If the paragraph is short, starts with uppercase, and has no ending punctuation, treat as heading
      const isParagraphHeader = trimmedText.length < 45 && 
                                !/[.:;?!"]$/.test(trimmedText) && 
                                !/^\s*[-*•]/.test(trimmedText)

      return (
        <p 
          key={i} 
          className={cn(
            "text-slate-700 leading-relaxed font-serif transition-all duration-300",
            isParagraphHeader 
              ? "font-bold text-slate-900 mt-6 mb-2.5 text-base md:text-lg tracking-tight border-b border-slate-100 pb-1" 
              : "mb-4 text-sm md:text-base"
          )}
          dangerouslySetInnerHTML={{ __html: p }}
        />
      )
    })
  }

  return (
    <GlassCard 
      className="h-full max-h-[800px] flex flex-col overflow-hidden border border-white/40 shadow-[0_8px_32px_rgba(168,139,250,0.1)]" 
      contentClassName="h-full flex flex-col flex-1 overflow-hidden"
      hover={false}
    >
      <div className="p-5 border-b border-white/20 bg-white/40 backdrop-blur-md flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-50 flex items-center justify-center shadow-inner">
            <FileText className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Original Document</h3>
            <p className="text-xs text-slate-500">AI-Highlighted Clauses</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar relative">
         {/* Ambient glow behind text */}
         <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-20 left-20 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(168, 139, 250, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="relative z-10">
            {renderHighlightedText()}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 139, 250, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 139, 250, 0.5);
        }
      `}} />
    </GlassCard>
  )
}
