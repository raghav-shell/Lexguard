# Implementation verification

Local baseline verified on 27 October 2026; production and regression checks updated on 28 October 2026 for application fix `018d5f1`. This records the implemented revision, not the original baseline in PROJECT_ANALYSIS.md.

## Results

| Check | Result |
| --- | --- |
| Backend regression suite | 30 tests passed, including provider diagnostics/redaction and simplified Gemini grammar with strict runtime validation |
| Frontend/component/proxy/page suite | 15 tests passed |
| Generated client schema | Current; generator check passed |
| ESLint | Passed |
| Independent TypeScript check | Passed |
| Production build | Passed with strict type checking, using Webpack |
| Clean frontend install | npm ci from the final lockfile passed |
| npm dependency advisory check | Zero known vulnerabilities after direct/transitive patches |
| Pinned Python dependency advisory check | Zero known vulnerabilities after upgrading python-multipart |
| Render Blueprint | Validated against the current public JSON schema; existing service updated manually without Blueprint sync |
| GitHub-hosted CI | [Quality checks passed for `018d5f1`](https://github.com/raghav-shell/Lexguard/actions/runs/40563606291), using the workflow's Node 24/Python 3.13 targets |
| Patch whitespace check | Passed |

The local host runs Node 26.7.0 and Python 3.14.3. Project runtime targets are Node 24 LTS and Python 3.13, exercised by the successful hosted CI run. Dependency-advisory and clean-install results above are from the 27 October baseline; dependency versions were not changed by the provider fixes.

## Production verification — 28 October 2026

The public Vercel alias was verified to serve the rebuilt production deployment. Render is connected to the correct account/workspace, the shared service key is configured privately on both services, and the backend runs with `ENVIRONMENT=production`.

| Check | Observed result |
| --- | --- |
| Public frontend and static JavaScript assets | HTTP 200 |
| Backend `/health` and `/ready` | HTTP 200; liveness and configured-key checks respectively |
| Direct backend upload without service key | HTTP 401 |
| Unsupported TXT through public frontend | HTTP 415, `unsupported_format` |
| Synthetic DOCX through public frontend | HTTP 200 in 20.93 seconds; Gemini; 4 findings; 1,049/1,049 extracted characters reviewed; `is_demo=false` |
| Synthetic one-page PDF through public frontend | HTTP 200 in 15.53 seconds; Gemini; 4 findings; 201/201 extracted characters reviewed; `is_demo=false` |
| Evidence and context | Every returned quotation exactly matched its source offsets; reviewing party, jurisdiction, and contract type preserved |
| Actual returned reports in frontend functions | Generated runtime schema/source validation, complete Markdown findings, negotiation suggestions, and JSON round trips passed for both formats |

The original missing Vercel service key was fixed. Live testing then exposed Gemini's rejection of the complex generation schema; the compatibility fix simplifies only the provider grammar while retaining canonical Pydantic validation and exact source grounding. OpenRouter's unavailable model configuration was corrected, but its account currently returns HTTP 402 for quota/billing. Primary Gemini analysis works; fallback availability is not established until that account issue is resolved.

These were small fictional documents, not a representative legal-quality or load benchmark. No user contract was uploaded. The temporary local copy of the newly generated shared service key was removed after configuration.

## Verified flow

Synthetic PDF and DOCX files were sent over real loopback HTTP through the **built production Next.js proxy**, a service-key-protected FastAPI endpoint, the real extraction subprocess, controlled provider responses, backend schema/evidence validation, and the returned report. The actual returned report also passed the generated frontend schema and source-evidence checks.

The flow verified:

- Successful PDF and DOCX source extraction and review context.
- Real extracted text and source offsets in the report, with no sample substitution.
- No-store response headers and frontend security headers.
- Corrupt PDF and empty-file errors (422), legacy DOC rejection (415), and unauthorized direct backend rejection (401).
- Correct origin validation when Next normalizes an internal URL differently from the browser's public Host.

Those initial loopback integration tests used a deliberately controlled provider. The subsequent production checks above used actual Gemini requests with fictional documents; neither set establishes legal accuracy.

## Regression coverage

Backend tests cover strict score/schema validation, zero-confidence preservation, JSON-string preservation, negation-sensitive quotation matching, stable source spans, all-text batching with boundary overlaps, real PDF/DOCX extraction, expanded archive/text limits, tracked-change/entity rejection, parser process deadlines, provider fallback and retries, provider request structure, independent concurrent contexts, admission release, service-key enforcement, CORS, and extraction/provider cleanup on disconnect.

Frontend tests cover upload/context submission, unsupported/empty/oversized input, raw-HTML injection prevention, Unicode source offsets, invalid source evidence, report and email exports, filters, complete print-report DOM despite active screen filters, accessible expansion, editable drafts, proxy limits/auth/error forwarding, page success/error states, cancellation, and ignored late responses.

## Release gates requiring external/runtime verification

- Resolve the OpenRouter account's quota/billing rejection and verify a successful fallback completion if fallback availability is required.
- Review the evaluation cases with qualified reviewers and expand the labeled corpus before publishing accuracy claims.
- Check interactive browser/mobile rendering, keyboard behavior, and visual print pagination. Browser automation became unavailable during this follow-up; UI interaction and download/print dialogs were not fully verified. Report-generation functions and component/proxy/page regression tests passed.
- Verify production secrets, ingress controls, provider spend limits, health, and served versions after deploying the matching frontend/backend revision.

In-process admission controls require one backend worker/instance. A distributed quota/concurrency system is a prerequisite for horizontal scaling or durable usage accounting; see DEPLOYMENT.md.

## Toolchain notes

Turbopack's CSS worker could not bind its IPC socket in this restricted execution environment, including the permission retry. The build script therefore uses Next.js's supported Webpack build path and passes without disabling type checking. Google Fonts build-time downloads were removed in favor of system fonts.

Local runs emit upstream deprecation notices from Node 26/test tooling and Starlette's HTTPX-based test client. ESLint 9 is pinned to satisfy the current Next.js React/import/accessibility plugin peer ranges; the tested installation has no peer conflicts. These notices do not fail the checks above.
