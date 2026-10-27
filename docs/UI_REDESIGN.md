# Frontend redesign — 28 October 2026

The interface now uses a warm paper background, forest-green actions, serif display typography, and restrained semantic risk colors. System fonts avoid external font requests. The layout focuses on the document-review task and uses an explicitly labeled illustrative preview instead of decorative live-analysis claims.

## What changed

- New wordmark, scale symbol, favicon, navigation, landing page, document preview, feature explanations, privacy section, and footer.
- A two-step upload form with drag/drop, file selection/removal, optional review context, clear limits, inline errors, and provider disclosure.
- A report workspace with distinct risk/fairness/coverage summaries, context, domain risk bars, and a compact expandable scope note.
- Side-by-side source text and findings on desktop; a panel switch on narrow screens. Source navigation preserves exact quotation grounding and keyboard focus.
- Search, domain/severity filters, a high/critical filter, clear-filter recovery, semantic severity badges, and expandable impact/negotiation details.
- A more prominent editable negotiation template, report/JSON downloads, and the complete independent print report.
- Revised loading, cancellation, and error views; visible keyboard focus, a skip link, reduced-motion support, and mobile form sizing/touch targets.
- Removed the mouse-tracking gradients, particle layers, floating statistics, and oversized animated wordmark from the active interface.

## Verification scope

- 17 frontend regression tests pass, including upload/context submission, error/cancel states, source safety, complete print content, exports, editable drafts, and filter recovery/source selection, and safe recovery after a multi-file drop.
- TypeScript, ESLint, and the production Webpack build pass.
- The local redesigned page was reviewed in Chrome on desktop. Landing and report screenshots were inspected; sample-report loading, finding expansion, source focus, and a domain-filter empty state were observed.
- Responsive layouts are implemented at 580, 800, and 1,100 pixels. Browser automation became unreliable during the follow-up, so device emulation and visual print pagination were not fully verified.
- The backend, provider adapters, and API contract are unchanged by this redesign. The existing live Gemini PDF/DOCX verification is recorded in [VERIFICATION.md](VERIFICATION.md).
