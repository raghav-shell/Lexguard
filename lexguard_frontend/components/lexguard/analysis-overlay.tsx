"use client";

import { useEffect, useRef, useState } from "react";
import { FileSearch } from "lucide-react";

export function AnalysisOverlay({ onCancel }: { onCancel: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancel.current?.focus();
    const started = Date.now();
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
      if (event.key === "Tab") {
        event.preventDefault();
        cancel.current?.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      clearInterval(timer);
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onCancel]);

  return (
    <div className="review-overlay">
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="analysis-title"
        aria-describedby="analysis-description"
        className="review-dialog"
      >
        <div className="review-spinner" aria-hidden="true">
          <FileSearch size={27} strokeWidth={1.5} />
        </div>
        <p
          className="eyebrow"
          style={{ justifyContent: "center", marginBottom: 12 }}
        >
          A LITTLE CLARITY IS ON ITS WAY
        </p>
        <h2 id="analysis-title">Reviewing your contract</h2>
        <p id="analysis-description" role="status">
          Reading the document, checking contract terms, and verifying quoted
          evidence. Longer documents can take more time.
        </p>
        <div className="elapsed-time">
          <span className="status-dot" /> {elapsed} seconds elapsed
        </div>
        <button
          ref={cancel}
          type="button"
          onClick={onCancel}
          className="button button-secondary"
        >
          Cancel review
        </button>
        <p className="review-note">
          You can cancel at any time. This app does not save report history.
        </p>
      </div>
    </div>
  );
}
