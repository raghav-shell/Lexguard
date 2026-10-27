# End-term submission readiness audit

Updated on **28 October 2026** against application fix `018d5f1` and the supplied **End-Term Software Project — Project Submission Guidelines**.

**Verdict: the implementation fits the project requirements and the core deployed upload/review workflow now succeeds.** The original frontend configuration failure and Gemini schema rejection have been fixed. Browser/mobile/visual print verification, demo playback/content, and actual form submission remain unconfirmed. The optional OpenRouter fallback currently requires quota/billing attention; primary Gemini analysis is working.

The supplied deadline was **27 October 2026, 11:59 PM IST**. This technical audit cannot confirm whether a submission was made before that deadline. A GitHub push alone does not complete submission.

## Confirmed evidence

| Check | Observed result |
| --- | --- |
| [Public repository](https://github.com/raghav-shell/Lexguard) | Publicly accessible; 62 commits at application fix `018d5f1`, including substantive engineering and deployment fixes |
| [GitHub Actions](https://github.com/raghav-shell/Lexguard/actions/runs/40563606291) | Quality checks completed successfully for `018d5f16d172ef8f09e336fe55631e43c61a043f` |
| Local regression suites | 30 backend and 15 frontend tests passed; generated client contract is current |
| [Frontend](https://lexguard-frontend-seven.vercel.app/) | HTTP 200; rebuilt production deployment serves the public alias; JavaScript assets return 200 |
| [Backend health](https://lexguard-backend-w5k1.onrender.com/health) | HTTP 200, alive, version 3.0.0 |
| [Backend readiness](https://lexguard-backend-w5k1.onrender.com/ready) | HTTP 200, configured; actual provider success was tested separately below |
| Direct backend protection | Upload without private service key returns 401 |
| Invalid frontend upload | Unsupported TXT returns 415 through the same-origin proxy |
| Real DOCX review | Public frontend → protected backend → actual Gemini; HTTP 200 in 20.93 seconds; 4 findings, all 1,049 extracted characters covered, exact source offsets, correct context, no sample substitution |
| Real PDF review | Same production flow; HTTP 200 in 15.53 seconds; 4 findings, one page and all 201 extracted characters covered, exact source offsets, correct context, no sample substitution |
| Returned report handling | Both live responses pass frontend runtime validation, complete Markdown report generation, negotiation-template generation, and JSON round-trip checks |
| [Demo video](https://drive.google.com/file/d/1AtPFyL2P54Hh2dFmx7QJNom6dRRytfBU/view?usp=drive_link) | Previously opened anonymously with HTTP 200 and MP4 preview metadata. Playback, duration, and final-product content remain unverified |
| [Official form](https://forms.gle/sBy4sfqyiRG2Zpom9) | Submission fields previously inspected; the user's completed submission has not been confirmed |

The live inputs were small fictional documents. These checks establish that the deployed review pipeline works for those inputs; they do not establish legal accuracy, representative document quality, load capacity, or completed submission. See [VERIFICATION.md](VERIFICATION.md) for scope and remaining checks.

## Resolved deployment findings

1. Vercel was missing its server-only `ANALYSIS_API_KEY`, causing `proxy_not_configured`. Matching private keys and the actual `BACKEND_API_URL` are now configured, and the frontend was rebuilt.
2. Render now uses `ENVIRONMENT=production`, and unauthenticated direct review requests are rejected.
3. Live requests exposed a Gemini 400 schema rejection. The generation grammar was simplified while keeping strict canonical Pydantic validation, bounded findings/scores, and exact source grounding.
4. Explicit model names replaced the unavailable fallback-model configuration. OpenRouter now returns 402 for quota/billing, which remains an account issue. Gemini's successful primary path was verified twice.

## Requirement-by-requirement assessment

**Meets** indicates code, tests, or direct evidence supports the requirement. **Partial** means some evidence remains missing. **Conditional** means the feature is required only if the product needs it.

| Guideline | Status | Evidence / remaining gap |
| --- | --- | --- |
| Working application | Meets for verified core flow | Public PDF/DOCX uploads produce genuine source-linked reports |
| 1. Technology stack | Meets | Permitted Next.js/React/TypeScript and Python/FastAPI stack |
| 2. Meaningful actions and state changes | Meets | Upload/context → extraction → actual model analysis → validated findings/report; filters, negotiation templates, and exports implemented |
| 3. Product understanding | Meets | README states problem, target users, solution, and four main workflows |
| 4. Engineering depth | Meets | Isolated/bounded parsing, batching, evidence checks, deadlines, admission controls, provider adapters, generated schemas, tests, CI |
| 5. Logic beyond an API wrapper | Meets | Document handling, validation, source offsets, aggregation, context, filtering, and export logic surround provider calls |
| 6. Data and persistence | Acceptable for scope | Stateless per-document review with downloads; no claims of saved history or persistent sharing |
| 7. Authentication and authorization | Conditional | No user accounts or saved/shared resources. Backend service protection is implemented. End-user identity/ownership is needed if persistent private resources are added |
| 8. Usable UX and states | Partial verification | Loading, cancellation, errors, sample/results states, filters, navigation, and drafts have regression coverage; interactive/mobile/visual print checks remain |
| 9. Error handling | Meets in code and tested cases | Invalid uploads, unauthorized access, configuration/provider failure, deadlines, and cancellation handled; safe status/reason diagnostics added |
| 10. Security | Controls present; not a certification | Input/resource bounds, safe rendering, private keys, origin checks, no-store reports, redacted diagnostics; baseline secret-pattern scan found no likely secrets in the then-current tree/history |
| 11. Git and version control | Meets | Public repository with substantive development and tested fix history |
| 12. Evaluator-accessible deployment | Meets for tested uploads | Public URL works without login; actual PDF/DOCX reviews returned 200 |
| 13. README/documentation | Meets | Problem/users/solution/features/stack/architecture/setup/environment/deployment and actual app/repo/video links |
| 14. Demo video | Partial verification | Link supplied and anonymously accessible preview observed; confirm playback and final working version. Three to five minutes is recommended |
| 15. AI usage | Permitted | Real Gemini analysis plus substantial application engineering; no legal-quality or accuracy claim established |
| 16. Originality | Unverified in full | Meaningful work visible; inspection cannot establish authorship conclusively. Disclose significant external-project basis if applicable |
| 17. Excluded categories | Design and tested core fit | Functional document-analysis application with application logic and real provider integration |
| 18. Approximately 3–5 workflows | Scope fits | Four coherent workflows listed below; demonstrate them in the final video |
| 19. Evaluation rubric | Evidence supports engineering | No numerical grade predicted; presentation and comprehensive product verification still matter |
| 20. Submission fields/form | Unverified | Correct student identity, batch, narrative, and actual submission confirmation remain user-controlled |
| 21. Final checklist | Partially complete | Technical core restored; manual UX/demo and submission confirmation remain |

## Four workflows to demonstrate

1. **Review a document:** upload a searchable PDF/DOCX, supply context, obtain a genuine report.
2. **Inspect evidence:** search/filter findings, expand explanations, navigate to exact source text.
3. **Prepare negotiation:** create/edit the labeled email template using clause-specific suggestions; copy/download it.
4. **Export the review:** download Markdown/JSON or print/save the complete report, independent of screen filters.

Show an invalid-upload case briefly. Sample mode is visibly labeled and should not replace demonstration of a real review. Component tests and direct report-function checks support workflows 2–4, but their full interactive production behavior and print pagination have not been visually verified.

## Submission fields previously observed

- Full Name — required
- SST Email — required
- Batch A/B/C — required
- Github Repository URL — required
- Live URL — required
- Explain the Problem Statement and Technologies Used — required

The written guidelines also request a demo video; its link is in README. Seeing the public form does not establish a submitted response or timely completion.

## Remaining checklist

- [x] Restore production configuration and verify real PDF/DOCX uploads.
- [x] Validate returned source evidence, context, coverage, and non-demo provenance.
- [x] Validate actual responses in client/report/email/JSON functions.
- [x] Include README framing, setup, architecture, and actual app/video links.
- [x] Verify public repository and meaningful history.
- [x] Pass local regression suites and hosted CI for the application fix.
- [ ] Resolve OpenRouter quota/billing if a working secondary provider is required.
- [ ] Visually check findings/source navigation, downloads, editable draft, keyboard/mobile UX, and printed pagination on the public app.
- [ ] Verify demo playback/content and the final working version.
- [ ] Confirm the official form was submitted with the correct student details and final links; retain the confirmation and timestamp.
