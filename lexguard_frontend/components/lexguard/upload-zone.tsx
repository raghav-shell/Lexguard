"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ArrowUpRight, Check, FileText, Info, Upload, X } from "lucide-react";
import { uploadError } from "@/lib/config";
import type { ReviewContext } from "@/lib/analysis-contract";

interface Props {
  onFileUpload: (file: File, context: ReviewContext) => void;
  isAnalyzing: boolean;
}

export function UploadZone({ onFileUpload, isAnalyzing }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [party, setParty] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [contractType, setContractType] = useState("General agreement");
  function choose(value?: File) {
    if (!value || isAnalyzing) return;
    const problem = uploadError(value);
    setError(problem || "");
    setFile(problem ? null : value);
    if (problem && input.current) input.current.value = "";
  }
  function select(event: ChangeEvent<HTMLInputElement>) {
    choose(event.target.files?.[0]);
  }
  function drop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (isAnalyzing) return;
    if (event.dataTransfer.files.length !== 1) {
      setError("Upload one document at a time.");
      setFile(null);
      if (input.current) input.current.value = "";
      return;
    }
    choose(event.dataTransfer.files[0]);
  }
  return (
    <section id="upload" className="upload-section shell">
      <div className="upload-heading">
        <p className="eyebrow">YOUR NEXT STEP, SIMPLIFIED</p>
        <h2>Let’s read between the lines.</h2>
        <p>
          Bring your agreement. We’ll help you understand the terms,
          <br className="hidden sm:block" /> spot potential risks, and prepare
          your next questions.
        </p>
      </div>
      <form
        className="upload-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (file && !isAnalyzing && !uploadError(file))
            onFileUpload(file, {
              reviewing_party: party.trim() || "Not specified",
              jurisdiction: jurisdiction.trim() || "Not specified",
              contract_type: contractType,
            });
        }}
      >
        <div className="upload-columns">
          <div>
            <p className="form-step">
              <span className="step-number">01</span> Add your document{" "}
              <span>PDF or DOCX</span>
            </p>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                if (!isAnalyzing) setDragging(true);
              }}
              onDragLeave={(event) => {
                const next = event.relatedTarget;
                if (
                  !(next instanceof Node) ||
                  !event.currentTarget.contains(next)
                )
                  setDragging(false);
              }}
              onDrop={drop}
              className={"upload-drop" + (dragging ? " dragging" : "")}
            >
              <div className="upload-icon">
                {file ? (
                  <Check size={24} strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Upload size={22} strokeWidth={1.5} aria-hidden="true" />
                )}
              </div>
              <h3>
                {file ? "Your document is ready." : "Drop your agreement here"}
              </h3>
              <p>
                {file
                  ? "Add context, then start your review."
                  : "or choose a file from your device"}
              </p>
              <label htmlFor="contract-file" className="sr-only">
                Contract document
              </label>
              <input
                ref={input}
                id="contract-file"
                type="file"
                tabIndex={-1}
                accept=".pdf,.docx"
                disabled={isAnalyzing}
                onChange={select}
                aria-describedby="file-help upload-error"
                aria-invalid={Boolean(error)}
                className="sr-only"
              />
              <button
                type="button"
                className="button button-secondary"
                disabled={isAnalyzing}
                onClick={() => input.current?.click()}
              >
                {file ? "Choose a different file" : "Choose document"}{" "}
                <ArrowUpRight size={14} aria-hidden="true" />
              </button>
              <p id="file-help" className="file-help">
                Searchable PDF or DOCX · Up to 4 MiB
                <br />
                80 PDF pages · 80,000 extracted characters · Scans need OCR
              </p>
            </div>
            {file && (
              <div className="selected-file">
                <FileText size={20} aria-hidden="true" />
                <div>
                  <p>{file.name}</p>
                  <span>
                    {file.size < 1024 * 1024
                      ? (file.size / 1024).toFixed(1) + " KiB"
                      : (file.size / 1024 / 1024).toFixed(2) + " MiB"}{" "}
                    · Ready to review
                  </span>
                </div>
                <button
                  type="button"
                  className="remove-file"
                  aria-label="Remove document"
                  disabled={isAnalyzing}
                  onClick={() => {
                    setFile(null);
                    setError("");
                    if (input.current) input.current.value = "";
                  }}
                >
                  <X size={17} aria-hidden="true" />
                </button>
              </div>
            )}
            <p
              id="upload-error"
              role="alert"
              className={error ? "upload-error" : "sr-only"}
            >
              {error}
            </p>
          </div>
          <div>
            <p className="form-step">
              <span className="step-number">02</span> Make the review yours{" "}
              <span>Optional</span>
            </p>
            <fieldset className="context-fields" disabled={isAnalyzing}>
              <legend className="sr-only">Review context (optional)</legend>
              <label className="field-label field-wide">
                Your role or reviewing party
                <input
                  className="field"
                  value={party}
                  onChange={(event) => setParty(event.target.value)}
                  maxLength={120}
                  placeholder="e.g. Employee, freelancer, or supplier"
                  autoComplete="off"
                />
              </label>
              <label className="field-label">
                Governing jurisdiction
                <input
                  className="field"
                  value={jurisdiction}
                  onChange={(event) => setJurisdiction(event.target.value)}
                  maxLength={120}
                  placeholder="e.g. India — Karnataka"
                  autoComplete="off"
                />
              </label>
              <label className="field-label">
                Contract type
                <select
                  className="field"
                  value={contractType}
                  onChange={(event) => setContractType(event.target.value)}
                >
                  {[
                    "General agreement",
                    "Employment agreement",
                    "Freelance / services agreement",
                    "Non-disclosure agreement",
                    "Lease",
                    "Software / subscription agreement",
                  ].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
            </fieldset>
            <p className="context-hint">
              <Info size={14} aria-hidden="true" />A little context helps focus
              the review. Leave anything you’re unsure about blank.
            </p>
          </div>
        </div>
        <div className="upload-form-bottom">
          <p className="upload-disclosure">
            Extracted text goes to the configured AI provider; a fallback
            provider may be used. Provider data handling follows their terms.
            This app doesn’t save report history. Only upload documents you’re
            authorized to process. AI-assisted review is not legal advice.
          </p>
          <button
            disabled={!file || isAnalyzing}
            type="submit"
            className="button button-dark"
          >
            Start contract review <ArrowUpRight size={17} aria-hidden="true" />
          </button>
        </div>
      </form>
    </section>
  );
}
