"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "./brand";

export function Navbar({
  onUploadClick,
  onDemoClick,
}: {
  onUploadClick: () => void;
  onDemoClick: () => void;
}) {
  return (
    <nav aria-label="Main navigation" className="site-nav">
      <div className="shell nav-inner">
        <Link href="/" aria-label="Lexguard home">
          <Brand />
        </Link>
        <div className="nav-links">
          <a href="#features">Why Lexguard</a>
          <a href="#how-it-works">How it works</a>
          <a href="#privacy">Your privacy</a>
        </div>
        <div className="nav-actions">
          <button type="button" onClick={onDemoClick} className="nav-sample">
            Sample report
          </button>
          <button
            type="button"
            onClick={onUploadClick}
            className="button button-dark button-small"
          >
            Review a contract <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
}
