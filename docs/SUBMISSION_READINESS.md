# End-term submission readiness audit

Checked on 27 October 2026 against commit `8d8e32d` and the supplied **End-Term Software Project — Project Submission Guidelines**.

**Verdict: the implementation fits the project requirements, but the submission is not ready yet.** The deployed main upload/review workflow is blocked by missing or invalid frontend server configuration. README product framing and access links have now been updated. Video verification and final form completion still need attention.

The deadline in the supplied guidelines and the public submission form is **27 October 2026, 11:59 PM IST**. A GitHub push alone does not complete submission.

## Confirmed external evidence

| Check | Observed result |
| --- | --- |
| [Public repository](https://github.com/raghav-shell/Lexguard) | HTTP 200 without authentication; GitHub metadata reports public visibility |
| Git history | 58 commits, with substantive implementation, debugging, and deployment changes before the latest hardening commit |
| [GitHub Actions](https://github.com/raghav-shell/Lexguard/actions/runs/40537330842) | `Quality checks` completed successfully for commit `8d8e32de6f5b77e0388aa35997199e991946d269` |
| [Frontend](https://lexguard-frontend-seven.vercel.app/) | HTTP 200 without authentication; current review/context/source-linked-findings UI is present |
| [Backend liveness](https://lexguard-backend-w5k1.onrender.com/health) | HTTP 200, `status: alive`, version `3.0.0` |
| [Backend readiness](https://lexguard-backend-w5k1.onrender.com/ready) | HTTP 200, `status: configured`, `provider_connectivity: not_probed`; this does not establish successful model calls |
| Live upload | A short synthetic DOCX sent through the public frontend proxy returned HTTP **503**, code **`proxy_not_configured`**, rather than an analysis |
| [Demo video](https://drive.google.com/file/d/1AtPFyL2P54Hh2dFmx7QJNom6dRRytfBU/view?usp=drive_link) | Anonymous HTTP 200; page title `Lexguard 3.mp4 - Google Drive`, MP4 preview metadata, no access-request/sign-in-to-continue page detected. Playback, duration, and content were not verified |
| [Official form](https://forms.gle/sBy4sfqyiRG2Zpom9) | Public form opened and displayed submission fields and the stated deadline; the user's submission has not been confirmed |

## Blocking deployment finding

The deployed frontend responded:

```json
{
  "error": {
    "code": "proxy_not_configured",
    "message": "The analysis service is not configured. You can still explore the sample report."
  }
}
```

The condition in [`route.ts`](../lexguard_frontend/app/api/analyze-contract/route.ts) returns this response when the production frontend's server-only `ANALYSIS_API_KEY` is absent or shorter than 32 characters. Backend liveness and a successful Vercel build do not resolve this failure.

Required remediation:

1. Configure a sufficiently long random **server-only** `ANALYSIS_API_KEY` on Vercel, matching the backend service key. Do not publish the key or place it in a `NEXT_PUBLIC_*` variable.
2. Verify `BACKEND_API_URL=https://lexguard-backend-w5k1.onrender.com` on the frontend and the backend's intended production settings.
3. Redeploy the applicable services after configuration changes.
4. Repeat a real synthetic upload and confirm an actual provider result, correct source text, grounded findings, and usable export/negotiation flows.

This audit did not change hosting configuration or attempt to bypass the key requirement. The failed request stopped at the frontend configuration check, so no live model result was obtained.

## Requirement-by-requirement assessment

Status meanings: **Meets** = implementation or direct evidence supports it; **Partial** = some required evidence is missing; **Blocked** = an observed failure prevents completion; **Unverified** = cannot establish from available evidence; **Conditional** = required only if the product needs it.

| Guideline | Status | Project evidence / remaining gap |
| --- | --- | --- |
| Working application, not static website | Blocked in deployment | Real application code and local integration tests exist, but the deployed core review request currently fails with 503 |
| 1. Technology stack | Meets | Next.js/React/TypeScript frontend and Python/FastAPI backend are permitted. The guidelines and form explicitly allow any stack |
| 2. Meaningful actions and state changes | Meets in code; live blocked | Upload/context → extraction → model analysis → validated findings → report UI; live execution needs the deployment fix |
| 3. Product understanding | Meets documentation requirements | Contract review and negotiation are a coherent use case. README now includes an explicit problem statement, named target users, solution, and four primary workflows |
| 4. Engineering depth | Meets | File validation, parser isolation, bounded extraction/batching, source verification, provider fallback, deadlines, admission controls, runtime schemas, exports, tests, and CI |
| 5. Application logic beyond an API wrapper | Meets | The model is only one step in the processing/validation pipeline; the application adds document handling, evidence checks, conservative aggregation, context, filtering, source navigation, and export logic |
| 6. Data and persistence | Acceptable for current scope | A stateless, per-document tool with explicit downloads need not have a traditional database. Do not advertise saved history, durable cloud reports, or resumable work; those would require persistence |
| 7. Authentication and authorization | Conditional; service protection implemented | The current tool has no accounts or stored/shared user resources. Backend service-key protection is not end-user identity. Add user authentication/ownership checks if private history, workspaces, or shared reports are introduced |
| 8. Usable UX and states | Partial verification | Loading, cancellation, error, empty, results, filters, navigation, and explicit sample states exist. Interactive/mobile/visual print checks remain unverified; deployed analysis is blocked |
| 9. Error handling | Meets in code; public failure confirmed | Invalid input, uploads, configuration, unauthorized backend access, provider failure, cancellation, and timeouts have explicit paths and regression tests. The live 503 is honest but still prevents the required successful workflow |
| 10. Security | Reasonable controls present; not a certification | Input/resource limits, safe text rendering, server-only secrets, restricted CORS, no-store reports, and redacted diagnostics are implemented. Known-pattern scanning found no likely keys/private keys in tracked text or the 58-commit patch history. Production configuration and full data handling still require validation |
| 11. Git and version control | Meets | Public repository, meaningful 58-commit development history, structured source/configuration/tests/docs; not a single final-upload history |
| 12. Evaluator-accessible deployment | Blocked | The URL is public and opens, but the primary upload/review action fails. A reachable landing page or sample report is insufficient |
| 13. README/documentation | Meets content requirements | README now includes explicit problem/users/solution/stack sections, actual app/repository/video links, architecture, setup, environment guidance, limits, and workflows |
| 14. Demo video | Partial verification | Link supplied and anonymous preview page accessible. Confirm playback and that it demonstrates the final working product. Three to five minutes is recommended, not an absolute duration requirement |
| 15. AI usage | Permitted | AI assistance and external models are allowed. Existing engineering around the model is substantial; deployment and output quality still need real verification |
| 16. Originality | Unverified in full | Meaningful implementation work is visible, but source inspection cannot establish authorship or originality conclusively. Disclose any significant external-project basis if applicable; using libraries/frameworks/AI alone is allowed |
| 17. Excluded project categories | Design fits; deployed completeness blocked | This is not merely static content, CRUD, or a thin API wrapper. However, an unusable major workflow would still make the final submitted product incomplete |
| 18. Approximately 3–5 complete workflows | Good scope; demonstrate live | Four coherent workflows are listed below. Complete and demonstrate those instead of adding unrelated features |
| 19. Evaluation rubric | Evidence supports engineering; no grade predicted | Strong engineering/architecture/test evidence exists. Product framing, working deployment, and demonstration are the immediate weaknesses. A numerical grade cannot be established by this audit |
| 20. Final submission fields/form | Unverified | Repository and live/video links are known. Full name, SST email, batch, final narrative, and actual form submission/confirmation remain user-controlled or unconfirmed |
| 21. Final checklist | Not complete | Core live workflow, demo content/playback, and final submission confirmation must be resolved |

## Four workflows to present

1. **Review a document:** upload a real searchable PDF/DOCX, specify role/jurisdiction/type, and obtain a genuine report.
2. **Inspect evidence:** filter/search findings, expand explanations, and navigate to exact source text.
3. **Prepare negotiation:** create and edit the clearly labeled email template using clause-specific suggestions; copy/download it.
4. **Export the review:** download Markdown/JSON and print/save a complete PDF report, independent of screen filters.

Show a relevant invalid-upload/error case briefly as evidence of reliability. Sample mode can introduce the product but must not stand in for a working live review.

## README alignment

The README has been updated with the following required content:

- **Problem statement:** contracts can contain obligations and asymmetric terms that non-specialist reviewers find difficult to identify and compare.
- **Target users:** identify the actual intended audience, such as freelancers, employees reviewing offers, and small-business reviewers. Confirm these choices rather than claiming the tool serves everyone.
- **Solution:** explain the document-to-evidence workflow and how it supports informed negotiation, with clear limits on legal accuracy/enforceability.
- **Tech stack:** one concise list covering Next.js, React, TypeScript, Tailwind/Framer Motion, FastAPI/Python, pdfplumber/DOCX extraction, HTTPX, Gemini/OpenRouter, Pydantic/generated Zod validation, Vercel/Render, tests, and CI.
- **Access links:** prominently include the real public app URL, GitHub URL, and provided demo-video link.
- **Primary workflows:** identify the four workflows above and distinguish real analysis from sample mode and email templating.

## Actual public form fields observed

The form displayed:

- Full Name — required
- SST Email (Check this again) — required
- Batch (A/B/C) — required
- Github Repository URL — required
- Live URL (Deployed Link) — required
- Explain the Problem Statement and Technologies Used — required

The supplied written guidelines additionally require a demo video and the final submission details. Even if a separate video field is not visible, ensure the evaluator can find the video in README and include its link in the narrative if appropriate. Seeing the public form does not prove a response was submitted.

## Final submission checklist

- [ ] Fix deployed frontend service configuration and verify a real upload succeeds.
- [ ] Check results, source navigation, negotiation draft, and exports on the public app.
- [x] Add the missing README product framing and actual app/video links.
- [x] Public repository access verified.
- [x] Meaningful Git history verified.
- [x] Pushed revision's GitHub Actions quality checks passed.
- [x] No likely secrets found by the specified current-tree/history pattern scan.
- [x] Public frontend and backend health/readiness URLs opened.
- [x] Demo link supplied; anonymous preview page opened.
- [ ] Verify demo playback, content, and whether it shows the final working version.
- [ ] Verify browser/mobile UX and visual print output.
- [ ] Complete the official form with the student's correct identity and final links.
- [ ] Retain submission confirmation and verify completion before **27 October 2026, 11:59 PM IST**.

The appropriate next step is deployment configuration and submission packaging, not adding a database, login system, or unrelated features purely to satisfy a checklist.
