# LEXGUARD robustness implementation plan

This plan follows `PROJECT_ANALYSIS.md`. Work is ordered by dependency. A task is complete only after its relevant regression checks pass. The application will retain its Next.js/FastAPI architecture and avoid storing uploaded contracts or adding accounts without a deliberate retention design.

## 1. Trustworthy analysis boundary

- [x] Replace automatic mock fallback with actionable extraction, configuration, provider, and timeout errors.
- [x] Define bounded, validated response/error models and a generated client contract with runtime validation.
- [x] Separate clause severity, risk magnitude, and model confidence; handle zero correctly.
- [x] Parse valid JSON without modifying quoted content; reject malformed or incomplete outputs.
- [x] Require source-grounded quotations and return stable clause IDs and source offsets.
- [x] Make demo mode explicit and consistently label provenance.

## 2. Document processing and coverage

- [x] Support actual PDF/DOCX formats; clearly reject legacy DOC, corrupt, encrypted, and scanned files.
- [x] Bound upload reads, multipart body size, pages, extracted text, ZIP expansion, parsing time, and concurrency.
- [x] Move extraction off the event loop and terminate timed-out parser processes.
- [x] Preserve every accepted passage, including short clauses; reject oversized documents instead of silently truncating.
- [x] Analyze bounded batches, merge/deduplicate findings, and expose extraction coverage and page locations.

## 3. Provider and server reliability

- [x] Replace unsupported Gemini SDK and blocking provider HTTP with cancellable async HTTP calls.
- [x] Isolate system instructions from untrusted documents and carry reviewer/jurisdiction context.
- [x] Reserve bounded primary/secondary time budgets and retry only transient errors within those budgets.
- [x] Remove shared fake progress and orphaned animation tasks.
- [x] Add request IDs, redacted diagnostics, readiness checks, and no-cache response headers.
- [x] Restrict CORS, add usage/concurrency limits, and protect production backend access with a server-only key/proxy.
- [x] Document the single-instance limit of in-process admission controls and the distributed deployment gate.

## 4. Safe and useful client flow

- [x] Render document text with React nodes; remove HTML injection and fuzzy quote replacement.
- [x] Validate upload selection/drop, show backend errors clearly, and support cancellation and cleanup.
- [x] Use honest request-local loading with accessible focus handling and reduced motion.
- [x] Display provider, context, coverage, warnings, and source links.
- [x] Add search/severity/category filtering and accessible clause expansion.
- [x] Repair navigation and demo controls; remove unimplemented account/pricing promises.
- [x] Provide real downloadable reports instead of sharing an unusable homepage link.
- [x] Label negotiation email as an editable template populated with clause-specific suggestions.
- [x] Make print output independent of tabs, expansion, and animation state.
- [x] Correct unsupported accuracy, privacy, legal-certainty, and timing claims.

## 5. Engineering and delivery

- [x] Restore strict build checks, install/configure lint, and add meaningful backend/frontend regression tests.
- [x] Pin backend dependencies, record runtime versions, and supply environment examples.
- [x] Add CI for schema generation, tests, type checking, lint, and production build.
- [x] Remove inactive agent paths/unused styles and tracked compiler output after checking imports.
- [x] Rewrite setup/deployment documentation around the implemented behavior and security configuration.
- [x] Verify successful and failed upload paths with controlled provider responses; record live/browser limits accurately.

## Acceptance criteria

Real uploads never receive sample findings. Documents cannot inject HTML. Accepted extracted text is fully submitted for analysis. Every returned finding is grounded in source text and has bounded scores. Failures remain failures. Concurrent users have independent UI state. Public usage has configured resource limits. The user can review, filter, navigate, export, and understand the limitations of a report. Tests, lint, types, and build pass.

## Product boundaries

Accounts, cloud report history/sharing, collaboration, OCR, legal retrieval/citations, e-signatures, and measured legal accuracy require separate product/data/infrastructure decisions. This implementation will clearly describe those boundaries rather than simulate those capabilities. A labeled evaluation fixture set and documented live-provider evaluation procedure will establish a starting point for measuring quality.

## Execution log

- Completed the strict analysis contract, honest failure handling, source grounding, bounded extraction, full-text batching, async providers, protected proxy, request limits, and cancellation cleanup.
- Replaced unsafe rendering and simulated product controls with source-linked findings, context, filtering, explicit sample mode, editable email templates, and complete downloadable/print reports.
- Added generated client validation, 27 backend tests, 15 frontend/proxy/page tests, CI, pinned dependencies, environment examples, current deployment instructions, and evaluation fixtures.
- Patched dependency advisories. Both npm audit and the pinned Python dependency scan reported zero known vulnerabilities on 27 October 2026.
- Verified synthetic PDF/DOCX uploads and honest failures through a built Next.js proxy and real FastAPI/parser stack, with controlled provider responses. Interactive browser, live-provider quality, and hosted deployment checks remain release gates, documented in docs/VERIFICATION.md.
- Production builds use Webpack because this environment denies the socket operation used by Turbopack's CSS worker. Strict TypeScript build checking is enabled.

## Deployment configuration required

Set matching server-only ANALYSIS_API_KEY values on the backend and frontend, set ENVIRONMENT=production on the backend, and set BACKEND_API_URL on the frontend. Read DEPLOYMENT.md before release. The browser limit is 4 MiB to fit the Vercel proxy body limit; the backend independently supports up to 10 MiB. No live deployment or credential changes were performed.
