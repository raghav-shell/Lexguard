# Analysis quality evaluation

Automated regression tests establish the application contract, evidence grounding, limits, and failure handling. They do not establish legal correctness or the accuracy of a model's risk/confidence estimate.

The fixtures in `evaluation_cases.json` are synthetic starting points, not real client contracts or a statistically representative legal benchmark. Expected signals identify issues a human reviewer should examine. A live provider should be evaluated with the configured model and the same prompt/schema used by the app.

For each case, record the model/version, prompt commit, jurisdiction, date, latency, input coverage, returned source evidence, expected signals found/missed, unsupported assertions, and suggested wording quality. Review negation and prompt-injection cases especially carefully. Do not score a grounded quotation as a correct explanation automatically.

A qualified reviewer should label a broader, jurisdiction-specific corpus before publishing accuracy claims. Track false positives, missed material clauses, quotation accuracy, severity calibration, and reviewer disagreement separately. Split held-out evaluation examples from prompt-tuning examples.

Run live cases manually through the app or an explicitly configured staging environment. Live calls can incur provider costs; no live calls are made by CI. Record results privately if using confidential material. Replace or change a model only after comparing the held-out cases and provider data-handling requirements.

Outstanding release work that needs external access: live model compatibility and quality checks, production environment verification, browser/mobile accessibility checks, and visual print QA. Do not label those verified based on unit tests alone.
