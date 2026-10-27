# Deployment and operating guide

This revision changes the API contract and browser connection path. Deploy the backend and frontend together after configuring the secrets below. Existing hosted deployments have not been modified by this implementation.

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

The local Blueprint was structurally checked against Render's public schema. No Blueprint sync, service creation, plan change, or deployment was performed.

## Frontend: Vercel

- Root directory: `lexguard_frontend`.
- Node.js: 24 LTS.
- Install: `npm ci`; build: `npm run build`.
- Set **server-only** `BACKEND_API_URL=https://your-backend.onrender.com`.
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

Keep request bodies and provider response bodies out of platform tracing/log capture. Error responses contain stable public messages and a request ID. Application logs include IDs, path, status, duration, and provider attempt failures without exception text. Reports are served with `Cache-Control: no-store`. No report database or analytics is enabled.

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
