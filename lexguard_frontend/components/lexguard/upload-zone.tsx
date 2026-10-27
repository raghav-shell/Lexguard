"use client"

import { useRef, useState, type ChangeEvent, type DragEvent } from "react"
import { uploadError } from "@/lib/config"
import type { ReviewContext } from "@/lib/analysis-contract"

interface Props {
  onFileUpload: (file: File, context: ReviewContext) => void
  isAnalyzing: boolean
}

export function UploadZone({ onFileUpload, isAnalyzing }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const [party, setParty] = useState("")
  const [jurisdiction, setJurisdiction] = useState("")
  const [contractType, setContractType] = useState("General agreement")

  function choose(value?: File) {
    if (!value) return
    const problem = uploadError(value)
    setError(problem || "")
    setFile(problem ? null : value)
  }
  function select(event: ChangeEvent<HTMLInputElement>) { choose(event.target.files?.[0]) }
  function drop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    if (event.dataTransfer.files.length !== 1) {
      setError("Upload one document at a time.")
      return
    }
    choose(event.dataTransfer.files[0])
  }

  return (
    <section id="upload" className="relative px-6 py-20 scroll-mt-24">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Review a contract</h2>
        <p className="mt-3 text-slate-600">Upload a searchable PDF or DOCX, up to 4 MiB, 80 PDF pages, and 80,000 extracted characters. Scanned documents need OCR first.</p>
        <form className="mt-8 rounded-3xl bg-white/80 border border-violet-100 p-6 md:p-8 space-y-6"
          onSubmit={event => {
            event.preventDefault()
            if (file && !uploadError(file)) onFileUpload(file, {
              reviewing_party: party.trim() || "Not specified",
              jurisdiction: jurisdiction.trim() || "Not specified",
              contract_type: contractType,
            })
          }}>
          <div onDragOver={event => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)} onDrop={drop}
            className={"border-2 border-dashed rounded-2xl p-7 " + (dragging ? "border-violet-600 bg-violet-50" : "border-slate-300")}>
            <label htmlFor="contract-file" className="block font-semibold text-slate-800 mb-3">Contract document</label>
            <input ref={input} id="contract-file" type="file" accept=".pdf,.docx" disabled={isAnalyzing} onChange={select}
              aria-describedby="file-help upload-error" className="w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-100 file:px-4 file:py-2 file:font-semibold file:text-violet-900" />
            <p id="file-help" className="text-xs text-slate-500 mt-3">Choose a file above or drop it here. Legacy .doc files must be converted.</p>
            {file && <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-700">
              <span className="break-all">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MiB</span>
              <button type="button" onClick={() => { setFile(null); setError(""); if (input.current) input.current.value = "" }} className="text-violet-800 underline">Remove</button>
            </div>}
            <p id="upload-error" role="alert" className="text-sm text-rose-800 mt-2">{error}</p>
          </div>
          <fieldset className="grid sm:grid-cols-2 gap-4">
            <legend className="font-semibold text-slate-800 mb-3">Review context <span className="font-normal text-slate-500">(optional)</span></legend>
            <label className="text-sm text-slate-700">Your role or reviewing party
              <input value={party} onChange={event => setParty(event.target.value)} maxLength={120} placeholder="For example, employee or supplier"
                className="mt-2 w-full border border-slate-300 rounded-lg p-3 bg-white" />
            </label>
            <label className="text-sm text-slate-700">Governing jurisdiction
              <input value={jurisdiction} onChange={event => setJurisdiction(event.target.value)} maxLength={120} placeholder="For example, India — Karnataka"
                className="mt-2 w-full border border-slate-300 rounded-lg p-3 bg-white" />
            </label>
            <label className="text-sm text-slate-700 sm:col-span-2">Contract type
              <select value={contractType} onChange={event => setContractType(event.target.value)} className="mt-2 w-full border border-slate-300 rounded-lg p-3 bg-white">
                {["General agreement", "Employment agreement", "Freelance / services agreement", "Non-disclosure agreement", "Lease", "Software / subscription agreement"].map(type => <option key={type}>{type}</option>)}
              </select>
            </label>
          </fieldset>
          <p className="text-xs leading-6 text-slate-600">Extracted contract text is sent to the configured AI provider and may be sent to a fallback provider if needed. This app does not save report history. Provider data handling follows their terms. Only upload documents you are authorized to process. AI-assisted review can miss issues and is not legal advice.</p>
          <button disabled={!file || isAnalyzing} type="submit" className="w-full rounded-xl bg-violet-700 text-white px-6 py-4 font-semibold disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600">Start contract review</button>
        </form>
      </div>
    </section>
  )
}
