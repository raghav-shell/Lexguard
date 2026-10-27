import {
  ArrowUpRight,
  FileSearch,
  Layers3,
  MessageSquareText,
  ScanText,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

const features = [
  {
    icon: ScanText,
    number: "01",
    title: "See the wording. Understand the risk.",
    description:
      "Every finding leads back to the exact text in your agreement. Read the explanation and inspect the evidence, side by side.",
    className: "feature-evidence",
    label: "SOURCE-LINKED INSIGHTS",
  },
  {
    icon: SlidersHorizontal,
    number: "02",
    title: "A review with your perspective.",
    description:
      "Add your role, contract type, and jurisdiction to give the review the context that matters to you.",
    className: "feature-context",
    label: "CONTEXT-AWARE REVIEW",
  },
  {
    icon: MessageSquareText,
    number: "03",
    title: "Go into the conversation prepared.",
    description:
      "Turn clause-specific suggestions into an editable negotiation email. Make it yours before you send it.",
    className: "",
    label: "PRACTICAL NEXT STEPS",
  },
  {
    icon: Layers3,
    number: "04",
    title: "Take your review with you.",
    description:
      "Download a readable report, export the data, or save the complete review as a PDF. Your next step is up to you.",
    className: "",
    label: "PORTABLE REPORTS",
  },
];

export function FeaturesSection() {
  return (
    <>
      <section id="features" className="section-space shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BUILT FOR THE MOMENT BEFORE YOU SIGN</p>
            <h2>
              Less legal overwhelm.
              <br />
              <em>More informed decisions.</em>
            </h2>
          </div>
          <p>
            From the first read to the next conversation, keep the important
            details in focus.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, ...feature }) => (
            <article
              key={feature.number}
              className={"feature-card " + feature.className}
            >
              <div className="feature-top">
                <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                <span>{feature.number}</span>
              </div>
              <p className="mini-label">{feature.label}</p>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              {feature.number === "01" && (
                <div className="feature-quote">
                  <span>
                    “...including all pre-existing intellectual property.”
                  </span>
                  <span>
                    <span className="status-dot" /> Linked to your source
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
      <section id="how-it-works" className="workflow-section section-space">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A SIMPLE WAY THROUGH</p>
              <h2>
                From document
                <br />
                <em>to understanding.</em>
              </h2>
            </div>
            <a href="#upload" className="text-link">
              Start your review <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
          <ol className="workflow-grid">
            {[
              {
                icon: FileSearch,
                title: "Bring your agreement",
                text: "Upload a searchable PDF or DOCX. Add a little context so the review reflects your perspective.",
              },
              {
                icon: ScanText,
                title: "Make sense of the terms",
                text: "Explore plain-language findings, estimated risks, and exact quotations from your document.",
              },
              {
                icon: MessageSquareText,
                title: "Choose your next step",
                text: "Prepare questions, adapt negotiation suggestions, and take your report into the conversation.",
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <li key={title}>
                <div className="workflow-number">
                  0{index + 1}
                  <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section id="privacy" className="shell privacy-section">
        <div className="privacy-panel">
          <div>
            <div className="privacy-icon">
              <ShieldCheck size={28} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <p className="eyebrow">YOUR DOCUMENT DESERVES CARE</p>
            <h2>
              Clear about the terms.
              <br />
              <em>And your data.</em>
            </h2>
          </div>
          <div className="privacy-copy">
            <h3>A review for this moment.</h3>
            <p>
              There’s no account or saved report history. Your report stays in
              the current browser view until you leave or reload. Download
              anything you want to keep.
            </p>
            <h3>Know where your text goes.</h3>
            <p>
              Extracted text is sent to the configured AI provider, and a
              fallback provider may be used. Provider data handling follows
              their terms. Only upload documents you’re authorized to process.
            </p>
            <p className="privacy-footnote">
              AI can miss issues. This is a starting point for informed review,
              not legal advice or a determination of enforceability. Check
              important terms with qualified counsel.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
