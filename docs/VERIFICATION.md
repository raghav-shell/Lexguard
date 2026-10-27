# Implementation verification

Verified locally on 27 October 2026. This records the implemented revision, not the original baseline in PROJECT_ANALYSIS.md.

## Results

| Check | Result |
| --- | --- |
| Backend regression suite | 27 tests passed in an isolated environment installed from the pinned application dependencies |
| Frontend/component/proxy/page suite | 15 tests passed |
| Generated client schema | Current; generator check passed |
| ESLint | Passed |
| Independent TypeScript check | Passed |
| Production build | Passed with strict type checking, using Webpack |
| Clean frontend install | npm ci from the final lockfile passed |
| npm dependency advisory check | Zero known vulnerabilities after direct/transitive patches |
| Pinned Python dependency advisory check | Zero known vulnerabilities after upgrading python-multipart |
| Render Blueprint | Validated against the current public JSON schema; not synced or deployed |
| CI configuration | YAML parsed; workflow added, but GitHub-hosted execution was not performed |
| Patch whitespace check | Passed |

The local host runs Node 26.7.0 and Python 3.14.3. Project runtime targets are Node 24 LTS and Python 3.13, with those versions configured in CI/runtime files. Execution on those exact target versions remains part of CI/release validation.

## Verified flow

Synthetic PDF and DOCX files were sent over real loopback HTTP through the **built production Next.js proxy**, a service-key-protected FastAPI endpoint, the real extraction subprocess, controlled provider responses, backend schema/evidence validation, and the returned report. The actual returned report also passed the generated frontend schema and source-evidence checks.

The flow verified:

- Successful PDF and DOCX source extraction and review context.
- Real extracted text and source offsets in the report, with no sample substitution.
- No-store response headers and frontend security headers.
- Corrupt PDF and empty-file errors (422), legacy DOC rejection (415), and unauthorized direct backend rejection (401).
- Correct origin validation when Next normalizes an internal URL differently from the browser's public Host.

These were integration tests with a deliberately controlled provider, not live AI quality tests. No uploaded user contract was sent to an external provider and no paid model call was made.

## Regression coverage

Backend tests cover strict score/schema validation, zero-confidence preservation, JSON-string preservation, negation-sensitive quotation matching, stable source spans, all-text batching with boundary overlaps, real PDF/DOCX extraction, expanded archive/text limits, tracked-change/entity rejection, parser process deadlines, provider fallback and retries, provider request structure, independent concurrent contexts, admission release, service-key enforcement, CORS, and extraction/provider cleanup on disconnect.

Frontend tests cover upload/context submission, unsupported/empty/oversized input, raw-HTML injection prevention, Unicode source offsets, invalid source evidence, report and email exports, filters, complete print-report DOM despite active screen filters, accessible expansion, editable drafts, proxy limits/auth/error forwarding, page success/error states, cancellation, and ignored late responses.

## Release gates requiring external/runtime verification

- Run the CI workflow on Linux with Node 24 and Python 3.13.
- Configure matching server-only ANALYSIS_API_KEY values and the correct BACKEND_API_URL; set ENVIRONMENT=production on the backend.
- Exercise the actual configured Gemini/OpenRouter models. The fallback model was checked in the public catalog for structured-output support, but no live completion or model-quality claim was verified.
- Review the evaluation cases with qualified reviewers and expand the labeled corpus before publishing accuracy claims.
- Check interactive browser/mobile rendering, keyboard behavior, and visual print pagination. The browser-tool inventory was empty in this session, so these checks could not be performed.
- Verify production secrets, ingress controls, provider spend limits, health, and served versions after deploying the matching frontend/backend revision.

In-process admission controls require one backend worker/instance. A distributed quota/concurrency system is a prerequisite for horizontal scaling or durable usage accounting; see DEPLOYMENT.md.

## Toolchain notes

Turbopack's CSS worker could not bind its IPC socket in this restricted execution environment, including the permission retry. The build script therefore uses Next.js's supported Webpack build path and passes without disabling type checking. Google Fonts build-time downloads were removed in favor of system fonts.

Local runs emit upstream deprecation notices from Node 26/test tooling and Starlette's HTTPX-based test client. ESLint 9 is pinned to satisfy the current Next.js React/import/accessibility plugin peer ranges; the tested installation has no peer conflicts. These notices do not fail the checks above.
