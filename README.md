# LEXGUARD

LEXGUARD helps a reviewer understand contract terms, inspect source-linked risks, and prepare for negotiation. It combines a Next.js interface with a FastAPI document-analysis service.

## Project links

| Resource | Link |
| --- | --- |
| Live application | [Open LEXGUARD](https://lexguard-frontend-seven.vercel.app/) |
| Source code | [raghav-shell/Lexguard](https://github.com/raghav-shell/Lexguard) |
| Demo video | [Watch the product demo](https://drive.google.com/file/d/1AtPFyL2P54Hh2dFmx7QJNom6dRRytfBU/view?usp=drive_link) |
| Automated checks | [GitHub Actions](https://github.com/raghav-shell/Lexguard/actions) |

## Problem statement

Contracts can contain broad liability, restrictive obligations, ownership transfers, and unequal termination rights that are difficult for non-specialists to identify. Reading a long agreement without a structured review makes it easy to overlook terms that deserve a question or negotiation.

LEXGUARD helps users locate those terms, understand potential consequences, and connect each finding to the wording in their document. It supports preparation for review and negotiation; it does not establish enforceability or replace a lawyer.

## Target users

- Freelancers and consultants reviewing service agreements, payment terms, and IP ownership.
- Employees reviewing employment offers and contractual restrictions.
- Founders and small-business reviewers preparing questions about supplier or subscription agreements.

The current product is a per-document review tool. It does not offer accounts, saved contract history, or team workspaces.

## Solution

A user uploads a searchable PDF or DOCX and optionally supplies their role, jurisdiction, and contract type. The backend extracts text, reviews every accepted text section using a configured AI provider, validates the response, and checks quoted evidence against the source. The user receives searchable findings with exact source locations, estimated risks, potential impacts, and negotiation suggestions.

This is more than an API response viewer: document validation, resource limits, extraction isolation, text batching, source verification, score aggregation, provider deadlines/fallback, generated schemas, and report exports form the application workflow around the model.

## Key features

- Searchable PDF and DOCX uploads with optional reviewing-party, jurisdiction, and contract-type context.
- Five review domains: employment, privacy, financial exposure, intellectual property, and fairness.
- Bounded analysis of **all accepted extracted text**, with short boundary overlaps, source-verified quotations, page/character locations, and independently validated scores.
- Request cancellation, clear failures, an explicit sample report, finding filters, source navigation, editable negotiation email templates, Markdown/JSON downloads, and complete print reports.
- Strict generated client validation, protected backend access, bounded extraction processes, per-process quotas/concurrency controls, and redacted request diagnostics.

The analysis is one structured model review per text section, using Gemini with an optional OpenRouter fallback. It is not five independent legal agents. Real uploads never fall back to sample findings.

## Main workflows

1. **Review a contract:** upload a PDF/DOCX, add review context, and obtain a source-linked report.
2. **Inspect findings:** search or filter by domain/severity, expand explanations, and navigate to quoted contract text.
3. **Prepare negotiation:** generate an editable email template from the report's clause-specific suggestions, then copy or download it.
4. **Export the review:** download Markdown or JSON, or print/save a PDF containing all findings regardless of active screen filters.

Sample mode is explicitly labeled and uses an included example agreement. It does not analyze an uploaded file. The negotiation email is a template that the user reviews and edits, rather than a separately generated legal redline.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Python, FastAPI, Uvicorn, asynchronous HTTPX |
| Document processing | pdfplumber for PDFs; ZIP/XML parsing with defusedxml for DOCX; isolated parser processes |
| AI integration | Gemini REST API; configurable OpenRouter fallback with structured output |
| Validation | Pydantic response models and generated Zod client validation |
| Testing and quality | Python unittest, Vitest, Testing Library, ESLint, TypeScript, dependency advisory scans |
| Hosting and automation | Vercel frontend, Render backend, GitHub Actions |

## Limits and interpretation

The web interface accepts files up to **4 MiB**. This leaves multipart overhead below [Vercel's function request-body limit](https://vercel.com/docs/functions/limitations#request-body-size). The backend separately enforces a 10 MiB upload limit, 80 PDF pages, 80,000 extracted characters, a 10-second parser deadline, and a 160-second analysis deadline. It rejects oversized documents instead of silently dropping sections.

Scanned pages need OCR. Word extraction covers body/table text, with explicit warnings about other document areas; accept/reject tracked changes before uploading. Images, layout, embedded files, and legal enforceability are not established by this review. Section overlaps help local context, but cross-section references can still affect interpretation.

Risk and confidence are estimates, not measured legal accuracy. Review important terms with qualified counsel. Overall risk is the highest section/finding risk, category risk is the highest section risk, and fairness is the lowest section fairness; these conservative estimates should be interpreted alongside the findings.

## Local setup

Use Node.js 24 LTS (see frontend `.nvmrc`) and Python 3.13 (see backend `.python-version`).

Backend:

```bash
cd lexguard_backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Set GEMINI_API_KEY and/or OPENROUTER_API_KEY in .env.
python main.py
```

Frontend, in another terminal:

```bash
cd lexguard_frontend
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The sample report works without provider credentials. Real analysis returns a configuration error when no provider is configured.

The browser calls the same-origin Next.js proxy, which calls `BACKEND_API_URL`. `ANALYSIS_API_KEY` stays on the servers; never put it in a `NEXT_PUBLIC_*` variable. When using a service key locally, set the same value in both environment files.

## Verification

From the repository root:

```bash
python3 -m unittest discover -s lexguard_backend/tests -v
python3 lexguard_backend/scripts/generate_contract.py --check
cd lexguard_frontend
npm test
npm run typecheck
npm run lint
npm run build
```

After changing backend response models, run `python3 lexguard_backend/scripts/generate_contract.py` and commit the generated Zod contract. The CI workflow checks for drift. Production builds explicitly use Webpack; Turbopack's CSS worker requires socket permissions unavailable in some restricted environments.

## Architecture

```text
Browser → Next.js /api/analyze-contract → authenticated FastAPI endpoint
       → bounded parser process → complete extracted-text batches
       → async Gemini / OpenRouter → strict schema + evidence validation
       → merged source-linked report → client runtime validation → results
```

The provider adapters use documented [Gemini structured generation](https://ai.google.dev/api/generate-content) and [OpenRouter structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs) over [async HTTPX](https://www.python-httpx.org/async/). Configured OpenRouter models must support strict structured outputs.

Key files:

| Area | Location |
| --- | --- |
| Response models / generated client | `lexguard_backend/models/schemas.py`, `lexguard_frontend/lib/analysis-contract.ts` |
| Upload / API / resource controls | `lexguard_backend/routes/analyze.py`, `security.py`, `config.py` |
| Extraction / batching / evidence | `services/pdf_parser.py`, `services/chunking.py`, `utils/helpers.py` |
| Analysis / providers | `services/unified_analysis.py`, `services/providers.py` |
| Browser flow / server proxy | `lexguard_frontend/app/page.tsx`, `app/api/analyze-contract/route.ts` |
| Viewer / report / exports | `components/lexguard/`, `lib/analysis.ts` |

## Data handling

There is no report-history database. Uploads are processed for the current request; multipart handling may use temporary files, which are closed when processing finishes. Extracted text is transmitted to the configured AI provider and can go to the fallback provider. Provider retention is governed by their terms. Application logs record request IDs, status, timing, and provider names, not contract bodies or provider error bodies. Reports remain in the current browser view until navigation/reload, and downloaded files contain contract content. Analytics are not enabled by this application.

## Deployment and next steps

The public application is available at [lexguard-frontend-seven.vercel.app](https://lexguard-frontend-seven.vercel.app/). Deployment requires matching server-only `ANALYSIS_API_KEY` values on the frontend/backend, `BACKEND_API_URL` on Vercel, and configured AI provider credentials on the backend. Environment changes take effect in a new deployment; opening the landing page alone does not verify the upload workflow.

**Live verification, 28 October 2026:** synthetic DOCX and searchable PDF uploads through the public app both returned genuine Gemini reports with complete extracted-text coverage and exact source-linked findings. Both responses passed the frontend validator, Markdown report generation, negotiation-template generation, and JSON round-trip checks. The deployed schema compatibility fix preserves strict server-side validation. The OpenRouter fallback currently requires billing/credit attention; the Gemini primary path is working. See [verification details and remaining manual checks](docs/VERIFICATION.md).

See [DEPLOYMENT.md](DEPLOYMENT.md) for required production secrets, single-worker constraints, and release checks. See [docs/VERIFICATION.md](docs/VERIFICATION.md) for recorded validation and its scope.

[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) tracks this hardening work. [PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md) records the original baseline, not the current implementation. [docs/EVALUATION.md](docs/EVALUATION.md) describes model-quality checks.

Accounts, persistent cloud sharing/history, collaboration, OCR, retrieval/citations, and signatures are separate future features. The application does not simulate them. No license grant has been added; the repository owner should choose and add a license before distributing it under one.
