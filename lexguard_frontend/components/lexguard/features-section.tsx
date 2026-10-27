const features = [
  ["Source-linked findings", "Read the quoted wording alongside plain-language explanations, potential impacts, and negotiation suggestions."],
  ["Five review domains", "Review employment, privacy, financial exposure, intellectual property, and contractual fairness where relevant."],
  ["Context that matters", "Specify your reviewing role, contract type, and governing jurisdiction to help focus the review."],
  ["Portable reports", "Download a readable report or JSON, print the complete findings, and prepare an editable negotiation email."],
]

export function FeaturesSection() {
  return (
    <div className="relative px-6 pb-20 max-w-6xl mx-auto">
      <section id="features" className="scroll-mt-8 py-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-7">Understand the terms before you negotiate</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {features.map(([title, description]) => <article key={title} className="bg-white/80 border border-violet-100 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3><p className="mt-3 text-slate-600">{description}</p>
          </article>)}
        </div>
      </section>
      <section id="how-it-works" className="scroll-mt-8 py-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-5">How it works</h2>
        <ol className="list-decimal pl-6 space-y-4 text-slate-700">
          <li>Upload one searchable PDF or DOCX and optionally add review context.</li>
          <li>Extracted text is reviewed in bounded sections by a configured AI provider. Quotes are checked against the source.</li>
          <li>Inspect findings, follow source links, and adapt negotiation suggestions. Check important terms with qualified counsel.</li>
        </ol>
      </section>
      <section id="privacy" className="scroll-mt-8 py-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-5">Your document and privacy</h2>
        <p className="text-slate-700 leading-8">Uploaded files are processed for the current request. Extracted text goes to the configured provider, and a fallback provider may be used. The app has no report-history database; the report remains in the current browser view until you leave or reload. Downloads contain contract text and findings—store them appropriately. Provider retention and data handling follow their own terms.</p>
        <p className="text-slate-700 leading-8 mt-3">The review covers extractable text, not images or original document layout. Scans require OCR. AI may miss risks or misinterpret language; risk and confidence scores are estimates and do not establish legal enforceability.</p>
      </section>
    </div>
  )
}
