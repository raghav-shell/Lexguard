"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, X, Sparkles, Cloud } from "lucide-react"
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 mb-6"
          >
            <Cloud className="w-8 h-8 text-violet-500" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            Upload Your Contract
          </h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Drop your contract file and let our AI analyze it for risks and recommendations
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Upload zone */}
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            animate={isDragOver ? { scale: 1.02 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "relative rounded-3xl p-12 transition-all duration-500",
              "bg-white/60 backdrop-blur-xl",
              "border-2 border-dashed",
              isDragOver 
                ? "border-violet-400 shadow-[0_0_60px_rgba(168,139,250,0.25)]" 
                : "border-slate-200/80 hover:border-violet-300/80",
              isAnalyzing && "pointer-events-none"
            )}
          >
            {/* Animated background glow */}
            <AnimatePresence>
              {isDragOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(168, 139, 250, 0.15) 0%, transparent 70%)"
                  }}
                />
              )}
            </AnimatePresence>

            {/* Rising particles when analyzing */}
            {isAnalyzing && (
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [100, -300],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeOut"
                    }}
                    className="absolute bottom-0 rounded-full"
                    style={{ 
                      left: `${8 + i * 7.5}%`,
                      width: 4 + (i % 3) * 2,
                      height: 4 + (i % 3) * 2,
                      background: i % 3 === 0 
                        ? 'rgba(168, 139, 250, 0.6)' 
                        : i % 3 === 1 
                          ? 'rgba(244, 114, 182, 0.5)'
                          : 'rgba(34, 211, 238, 0.5)',
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
                      animate={isDragOver ? { scale: 1.1, y: -10, rotate: 5 } : { scale: 1, y: 0, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={cn(
                        "w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center",
                        "bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100",
                        "shadow-[0_8px_30px_rgba(168,139,250,0.2)]",
                        isDragOver && "shadow-[0_12px_40px_rgba(168,139,250,0.35)]"
                      )}
                    >
                      <Upload className={cn(
                        "w-10 h-10 transition-colors duration-300",
                        isDragOver ? "text-violet-600" : "text-violet-400"
                      )} />
                    </motion.div>

                    <h3 className="text-xl md:text-2xl font-semibold text-slate-700 mb-3">
                      {isDragOver ? "Drop it here!" : "Drag and drop your contract"}
                    </h3>
                    <p className="text-slate-400 mb-8">
                      or click to browse files
                    </p>
                    <p className="text-sm text-slate-300 mb-8">
                      PDF, DOC, DOCX supported
                    </p>

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
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="space-y-6"
                  >
                    {/* File preview */}
                    <motion.div 
                      className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/80 border border-white/60 shadow-[0_4px_20px_rgba(168,139,250,0.1)]"
                      initial={{ y: 10 }}
                      animate={{ y: 0 }}
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                        <FileText className="w-7 h-7 text-violet-500" />
                      </div>
                      <div className="text-left">
                        <div className="text-slate-700 font-medium truncate max-w-[200px]">
                          {file.name}
                        </div>
                        <div className="text-sm text-slate-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      {!isAnalyzing && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={removeFile}
                          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          <X className="w-4 h-4 text-slate-400" />
                        </motion.button>
                      )}
                    </motion.div>

                    {/* Analyze button */}
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
                            <Sparkles className="w-5 h-5" />
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
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
