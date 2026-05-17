"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, X, Sparkles, Cloud, Zap, CheckCircle } from "lucide-react"
import { useState, useCallback } from "react"
import { GlassButton } from "./glass-card"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  onFileUpload: (file: File) => void
  isAnalyzing: boolean
}

export function UploadZone({ onFileUpload, isAnalyzing }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".pdf") || droppedFile.name.endsWith(".docx") || droppedFile.name.endsWith(".doc"))) {
      setFile(droppedFile)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }, [])

  const handleAnalyze = () => {
    if (file) {
      onFileUpload(file)
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  return (
    <section id="upload" className="relative px-6 py-24">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-14"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 mb-8 relative"
          >
            {/* Pulsing glow */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(168, 139, 250, 0.3) 0%, transparent 70%)',
                filter: 'blur(15px)',
              }}
            />
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Cloud className="w-10 h-10 text-violet-500 relative z-10" />
            </motion.div>
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-5">
            Upload Your Contract
          </h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Drop your contract file and let our AI analyze it for risks and recommendations
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Upload zone */}
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            animate={isDragOver ? { scale: 1.02 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "relative rounded-3xl p-14 transition-all duration-500",
              "bg-white/60 backdrop-blur-xl",
              "border-2 border-dashed",
              isDragOver 
                ? "border-violet-400 shadow-[0_0_80px_rgba(168,139,250,0.3)]" 
                : "border-slate-200/80 hover:border-violet-300/80",
              isAnalyzing && "pointer-events-none"
            )}
          >
            {/* Animated gradient border on hover/drag */}
            <AnimatePresence>
              {isDragOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(168, 139, 250, 0.15) 0%, transparent 70%)"
                  }}
                />
              )}
            </AnimatePresence>

            {/* Corner accents */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-violet-300/50 rounded-tl-xl" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-violet-300/50 rounded-tr-xl" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-violet-300/50 rounded-bl-xl" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-violet-300/50 rounded-br-xl" />

            {/* Rising particles when analyzing */}
            {isAnalyzing && (
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [150, -350],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2.5 + Math.random(),
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeOut"
                    }}
                    className="absolute bottom-0 rounded-full"
                    style={{ 
                      left: `${5 + i * 4.5}%`,
                      width: 4 + (i % 4) * 2,
                      height: 4 + (i % 4) * 2,
                      background: i % 3 === 0 
                        ? 'rgba(168, 139, 250, 0.6)' 
                        : i % 3 === 1 
                          ? 'rgba(244, 114, 182, 0.5)'
                          : 'rgba(34, 211, 238, 0.5)',
                      boxShadow: `0 0 8px ${
                        i % 3 === 0 ? 'rgba(168, 139, 250, 0.5)' :
                        i % 3 === 1 ? 'rgba(244, 114, 182, 0.4)' :
                        'rgba(34, 211, 238, 0.4)'
                      }`,
                    }}
                  />
                ))}
              </div>
            )}

            <div className="relative z-10 text-center">
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={isDragOver 
                        ? { scale: 1.15, y: -15, rotate: 5 } 
                        : { scale: 1, y: 0, rotate: 0 }
                      }
                      transition={{ type: "spring", stiffness: 300 }}
                      className={cn(
                        "w-28 h-28 mx-auto mb-10 rounded-3xl flex items-center justify-center relative",
                        "bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100",
                        "shadow-[0_8px_40px_rgba(168,139,250,0.25)]",
                        isDragOver && "shadow-[0_16px_60px_rgba(168,139,250,0.4)]"
                      )}
                    >
                      {/* Animated rings around icon */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-3xl border-2 border-violet-300/30"
                      />
                      <Upload className={cn(
                        "w-12 h-12 transition-colors duration-300 relative z-10",
                        isDragOver ? "text-violet-600" : "text-violet-400"
                      )} />
                    </motion.div>

                    <h3 className="text-2xl md:text-3xl font-semibold text-slate-700 mb-4">
                      {isDragOver ? "Drop it here!" : "Drag and drop your contract"}
                    </h3>
                    <p className="text-slate-400 mb-4">
                      or click to browse files
                    </p>
                    
                    {/* Supported formats badges */}
                    <div className="flex items-center justify-center gap-2 mb-10">
                      {["PDF", "DOC", "DOCX"].map((format) => (
                        <span 
                          key={format}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500"
                        >
                          {format}
                        </span>
                      ))}
                    </div>

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <GlassButton variant="secondary">
                        <FileText className="w-4 h-4" />
                        Browse Files
                      </GlassButton>
                    </label>
                  </motion.div>
                ) : (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="space-y-6"
                  >
                    {/* File preview with animations */}
                    <motion.div 
                      className="inline-flex items-center gap-5 px-7 py-5 rounded-2xl bg-white/80 border border-white/60 shadow-[0_8px_30px_rgba(168,139,250,0.15)] relative overflow-hidden"
                      initial={{ y: 15 }}
                      animate={{ y: 0 }}
                    >
                      {/* Success indicator */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="absolute top-3 right-3"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      </motion.div>

                      <motion.div 
                        className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center"
                        animate={{ rotate: [0, 3, -3, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <FileText className="w-8 h-8 text-violet-500" />
                      </motion.div>
                      <div className="text-left">
                        <div className="text-slate-700 font-semibold truncate max-w-[220px]">
                          {file.name}
                        </div>
                        <div className="text-sm text-slate-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      {!isAnalyzing && (
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={removeFile}
                          className="p-2 rounded-xl hover:bg-slate-100 transition-colors ml-2"
                        >
                          <X className="w-5 h-5 text-slate-400" />
                        </motion.button>
                      )}
                    </motion.div>

                    {/* Analyze button with glow */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <GlassButton 
                        size="lg" 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Zap className="w-5 h-5" />
                            </motion.div>
                            Analyzing Contract...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Start AI Analysis
                          </>
                        )}
                      </GlassButton>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
