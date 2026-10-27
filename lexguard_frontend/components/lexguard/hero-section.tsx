"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  ScanText,
  ShieldCheck,
} from "lucide-react";

export function HeroSection({
  onUploadClick,
  onDemoClick,
}: {
  onUploadClick: () => void;
  onDemoClick: () => void;
}) {
  return (
    <section className="hero shell">
      <div className="hero-copy reveal-in">
        <p className="eyebrow">
          <span className="status-dot" /> CLARITY BEFORE COMMITMENT
        </p>
        <h1>
          The fine print.
          <br />
          <em>Finally, clear.</em>
        </h1>
        <p className="hero-description">
          Understand what you’re agreeing to. Turn complex contracts into clear
          insights, source-linked risks, and a better starting point for
          negotiation.
        </p>
        <div className="hero-actions">
          <button
            type="button"
            className="button button-dark"
            onClick={onUploadClick}
          >
            Review your contract <ArrowUpRight size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="button button-text"
            onClick={onDemoClick}
          >
            Explore a sample <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
        <div className="hero-assurance">
          <span>
            <Check size={14} aria-hidden="true" /> No account needed
          </span>
          <span>
            <Check size={14} aria-hidden="true" /> PDF & DOCX
          </span>
          <span>
            <Check size={14} aria-hidden="true" /> Evidence you can inspect
          </span>
        </div>
      </div>
      <div
        className="hero-preview reveal-in"
        aria-label="Illustrative contract review preview"
      >
        <div className="preview-orbit" aria-hidden="true" />
        <div className="document-preview">
          <div className="preview-toolbar">
            <span>
              <FileText size={15} aria-hidden="true" /> Services agreement
            </span>
            <span className="preview-format">PDF</span>
          </div>
          <div className="preview-paper">
            <div className="preview-paper-top">
              <span>AGREEMENT / 001</span>
              <ShieldCheck size={19} aria-hidden="true" />
            </div>
            <h2>
              Good agreements
              <br />
              start with clarity.
            </h2>
            <p className="preview-legal">
              This agreement outlines the terms between the Client and the
              Supplier for the delivery of professional services.
            </p>
            <div className="document-rule" />
            <h3>7.2 &nbsp; Limitation of liability</h3>
            <p className="preview-highlight">
              The Supplier’s liability shall be unlimited, including any
              indirect or consequential losses.
            </p>
            <div className="preview-lines" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
        <div className="preview-insight">
          <div className="insight-icon">
            <ScanText size={19} aria-hidden="true" />
          </div>
          <div>
            <p className="mini-label">WORTH A CLOSER LOOK</p>
            <h3>Uncapped financial exposure</h3>
            <p>
              This wording may leave the supplier responsible for losses beyond
              the contract value.
            </p>
            <div className="insight-tags">
              <span className="risk-label risk-high">High risk</span>
              <span>Financial</span>
              <span className="source-verified">
                <Check size={12} aria-hidden="true" /> Source linked
              </span>
            </div>
          </div>
        </div>
        <p className="preview-caption">
          ILLUSTRATIVE PREVIEW · YOUR DOCUMENT, YOUR CONTEXT
        </p>
      </div>
      <div className="hero-bottom">
        <p>A clearer view of your next agreement.</p>
        <div>
          <span>Employment offers</span>
          <span>Service agreements</span>
          <span>NDAs & more</span>
        </div>
      </div>
    </section>
  );
}
