# Deployment and operating guide

The production frontend and backend have been redeployed with the current API contract and matching private service keys. Synthetic PDF and DOCX reviews through the public URL succeeded on 28 October 2026; see [the verification record](docs/VERIFICATION.md).

## Current production deployment

| Component | Configuration / verified result |
| --- | --- |
| Frontend | [lexguard-frontend-seven.vercel.app](https://lexguard-frontend-seven.vercel.app/), Vercel project `lexguard-frontend`, production target |
| Backend | [lexguard-backend-w5k1.onrender.com](https://lexguard-backend-w5k1.onrender.com), Render service `srv-d88q80mgvqtc73bcdhbg` |
| Server connection | Vercel `BACKEND_API_URL` points to that backend; matching server-only `ANALYSIS_API_KEY` configured on both services |
| Production guard | Render `ENVIRONMENT=production`; direct uploads without the service key return 401 |
| Primary model | `GEMINI_MODEL=gemini-2.5-flash`; live PDF/DOCX reviews returned real, source-verified reports |
| Fallback model | `OPENROUTER_MODEL=anthropic/claude-sonnet-4.6`; the previous 404 was resolved, but the account currently rejects requests with 402 (quota/billing) |

Gemini's generation schema omits numerical and length bounds that can make its decoding grammar too complex. The canonical Pydantic schema still validates every returned score, string, array limit, and required field before source grounding and delivery. Do not remove those application checks to address provider compatibility.

## Backend: Render

Use `lexguard_backend/render.yaml` as the Blueprint path, or configure the equivalent settings manually:

- Root directory: `lexguard_backend`.
- Build: `pip install -r requirements.txt`.
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1 --limit-concurrency 20`.
- Python: 3.13, recorded in `.python-version`.
- Health check: `/health` (liveness). `/ready` separately reports whether at least one provider key is configured; it does not call a provider.

Required configuration:

| Variable | Purpose |
| --- | --- |
| `ENVIRONMENT=production` | Fail startup unless a service key of at least 32 characters is configured |
| `ANALYSIS_API_KEY` | Random secret shared only with the Next.js server |
| `GEMINI_API_KEY` and/or `OPENROUTER_API_KEY` | Actual provider credentials |
| `GEMINI_MODEL` | Optional; default `gemini-2.5-flash` |
| `OPENROUTER_MODEL` | Optional; default `anthropic/claude-sonnet-4.6`, verified in the public model catalog as supporting structured outputs; validate live quality before release |
| `FRONTEND_URL` | Exact comma-separated trusted origins if direct browser access is needed; no wildcard Vercel trust |
| `MAX_CONCURRENT_ANALYSES` | Default 2; allowed 1–4 |
| `ANALYSES_PER_HOUR` | Default 10 per client identity |
| `GLOBAL_ANALYSES_PER_HOUR` | Default 60 per backend process |

Generate a random key locally with `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`, then set it privately in both services. Do not commit it. On an existing Render service, add new secrets manually: [Render does not apply new `sync: false` values during later Blueprint syncs](https://render.com/docs/blueprint-spec#prompting-for-secret-values). [Saved environment changes require the applicable deployment to take effect](https://render.com/docs/configure-environment-variables).

The local Blueprint was structurally checked against Render's public schema. The existing production service was configured through Render's environment-variable API using merged updates; no Blueprint sync, service creation, or plan change was performed.

## Frontend: Vercel

- Root directory: `lexguard_frontend`.
- Node.js: 24 LTS.
- Install: `npm ci`; build: `npm run build`.
- Set **server-only** `BACKEND_API_URL=https://lexguard-backend-w5k1.onrender.com` for this deployment.
- Set **server-only** `ANALYSIS_API_KEY` to the same secret as the backend.
- Remove reliance on the former `NEXT_PUBLIC_API_URL`; browser requests now use `/api/analyze-contract`.
- The route has a 210-second function duration and request cancellation enabled in `vercel.json`.

The browser and proxy limit uploads to 4 MiB to stay below [the Vercel Functions 4.5 MB body limit](https://vercel.com/docs/functions/limitations#request-body-size), including multipart overhead. The backend's independent limit is 10 MiB. For larger browser uploads, design a separate authenticated direct-upload flow rather than increasing the Vercel proxy limit.

CORS is not authentication. The backend requires its service key; the public Next.js route remains a public entry point protected by backend admission limits. Vercel supplies the proxy's forwarding header; the proxy overwrites `X-Client-IP` rather than trusting a browser-provided value. For self-hosting behind another proxy, explicitly configure a trusted client-IP source or retain the shared per-proxy client quota.

## Capacity and abuse protection

Run exactly **one backend worker on one instance** with this implementation. Quotas and active counters live in that process, contain hashed client identities only, and reset on restart. They are bounded admission controls, not durable billing quotas. A global request cap still applies when clients rotate IPs.

Before scaling horizontally or increasing provider budgets, add a distributed quota/concurrency service and enforce abuse protection at the hosting ingress. Configure provider-side spend limits and platform request-rate rules for the public proxy. Do not treat the private backend key as end-user authentication. Accounts and paid-user entitlements are not implemented.

The existing Render plan is preserved. Validate parser memory and concurrency under representative PDFs before changing capacity. Extraction is serialized per backend process, with a 256 MiB parser address-space cap on Linux and byte/page/time bounds on all supported platforms. Backend provider calls use a shared async HTTP client; timed-out and disconnected analysis tasks are cancelled. Parser processes are terminated on deadline/cancellation. There are no detached model jobs.

## Privacy and diagnostics

Keep request bodies and provider response bodies out of platform tracing/log capture. Error responses contain stable public messages and a request ID. Application logs include IDs, path, status, duration, and provider attempt failures without exception text. Provider failures include only the HTTP status, exception type, and a fixed reason label such as `invalid_schema` or `quota_or_billing`. Reports are served with `Cache-Control: no-store`. No report database or analytics is enabled.

Do not promise provider-side zero retention unless the actual provider account/configuration supports it. Provide users with the applicable provider terms and authorization requirements.

## Release verification

1. Run backend tests, generated-contract check, frontend tests, lint, type check, and production build.
2. Verify `/health` responds and `/ready` reports configured. Confirm direct unauthenticated backend uploads return 401.
3. Through the frontend, upload a synthetic PDF and DOCX. Confirm real source text, context, coverage, and source-linked findings.
4. Try a broken PDF, legacy DOC, empty file, over-limit file, and missing-provider configuration. Each must show a clear error without sample results.
5. Check sample mode is visibly labeled, cancel an active review, navigate source links, filter findings, edit the email template, and download reports.
6. Print with a filter active and details collapsed. The print report must still include every finding.
7. Check keyboard focus and narrow/mobile layouts, and compare live-provider findings against the evaluation fixtures.
8. Verify the serving versions and production environment after deploy; passing local tests does not establish production health.

If a release fails, restore the matching prior frontend/backend pair. Retain the new production key requirement and review migration compatibility before rolling back.
