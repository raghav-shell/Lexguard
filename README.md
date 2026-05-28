# 🛡️ LEXGUARD — AI Contract Risk Intelligence System

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v2.0-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.2-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini 2.5](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![Vercel](https://img.shields.io/badge/Vercel-Hosted-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-Hosted-46E3B7?style=for-the-badge&logo=render)](https://render.com/)

**LEXGUARD** is a world-class, production-grade legal intelligence suite that democratizes contract review. By orchestrating a simulated team of specialized legal AI agents, LEXGUARD scans PDF and DOCX documents to instantly expose hidden liabilities, grade overall fairness, highlight critical clauses, and provide real-world consequence models alongside actionable negotiation tips. 

Designed for founders, developers, and legal professionals, the application couples a gorgeous, responsive, glassmorphic Next.js 16 frontend with a highly available, robust FastAPI Python backend.

---

## 🚀 Try It Live

Deployments are active and fully synchronized. Test the production suite directly using the following live links:

*   **🌐 Live App Interface:** [https://lexguard-frontend-seven.vercel.app/](https://lexguard-frontend-seven.vercel.app/)
*   **🔌 Live Backend API Service:** [https://lexguard-backend.onrender.com/](https://lexguard-backend.onrender.com/)
*   **🩺 API Health Check:** [https://lexguard-backend.onrender.com/health](https://lexguard-backend.onrender.com/health)

---

## 📁 Table of Contents
1. [Core Features](#-core-features)
2. [AI Multi-Agent Simulation Pipeline](#-ai-multi-agent-simulation-pipeline)
3. [100% Uptime Cascade Design](#-100-uptime-cascade-design)
4. [Tech Stack](#-tech-stack)
5. [Local Development Setup](#-local-development-setup)
6. [Environment Configurations](#-environment-configurations)
7. [Production Deployment Guide](#-production-deployment-guide)
8. [CORS Security & Hardening](#-cors-security--hardening)

---

## ✨ Core Features

*   **🔍 High-Fidelity Side-by-Side Contract Viewer:** Read your original document inline with interactive, color-coded markers that highlight high, medium, and low-risk clauses as you click them.
*   **📊 Dynamic Risk Analytics Radar:** Powered by Recharts, visualizes your contract's safety profile across five core dimensions (Employment, Privacy, Finance, Intellectual Property, and Fairness).
*   **🚀 Premium Glassmorphic Scanning Experience:** Engaging scanning animations stream state transitions as virtual legal experts analyze the document in real time.
*   **📁 Smart Multi-Format Parsing:** Seamlessly processes `.pdf`, `.doc`, and `.docx` legal files under 10MB using text extraction algorithms.
*   **🤝 Actionable Negotiation Playbooks:** Provides affected-party indicators, plain-English impact explanations, and ready-to-use counter-clauses or negotiation tips for every flagged risk.

---

## 🧠 AI Multi-Agent Simulation Pipeline

Rather than relying on a single generic LLM pass, LEXGUARD models a professional law firm review. It dynamically executes **five distinct sub-agents**, each specialized in auditing a key legal vertical:

```
                          ┌─────────────────────────┐
                          │ Uploaded Legal Document │
                          └────────────┬────────────┘
                                       │ (Text Parsing & Smart Chunking)
                                       ▼
                     ┌───────────────────────────────────┐
                     │   LEXGUARD Orchestration Agent    │
                     └─────────────────┬─────────────────┘
                                       │
         ┌───────────────┬─────────────┼───────────────┬───────────────┐
         ▼               ▼             ▼               ▼               ▼
   💼 Employment   🔒 Privacy &   💸 Financial    💡 Intellectual ⚖️ Fairness
    Law Agent      Compliance     Liability Agent Property Agent   Evaluation
   (Wage & Terms)  (GDPR/CCPA)    (Indemnity/Fees) (Ownership/IP) (Bilateral Balance)
         │               │             │               │               │
         └───────────────┼─────────────┴───────────────┼───────────────┘
                         │
                         ▼ (Structured Synthesis)
                     ┌───────────────────────────────────┐
                     │   Interactive Results Dashboard   │
                     │  (Scores, Verdicts & Highlights)  │
                     └───────────────────────────────────┘
```

*   **💼 Employment Law Agent:** Audits non-compete reasonableness, misclassification triggers, wage structures, termination notice periods, and working hours.
*   **🔒 Privacy & Compliance Agent:** Scans for telemetry consent, tracking mechanisms, third-party data sharing, GDPR/CCPA disclosures, and breach notice clauses.
*   **💸 Financial Liability Agent:** Evaluates payment terms, automatic renewals, late-payment penalty caps, and unlimited mutual or unilateral indemnity triggers.
*   **💡 Intellectual Property Agent:** Protects creators by identifying assignment of pre-existing work, reverse-engineering bans, and scope limits on work-for-hire transfers.
*   **⚖️ Fairness Evaluation Agent:** Acts as a neutral referee, checking if key provisions (termination, dispute resolution, fee-shifting) are mutual or unfairly biased toward one party.

---

## 🛡️ 100% Uptime Cascade Design

To guarantee that the user interface never breaks in production—even under API outages, rate limits, or network timeouts—the backend implements a robust **three-tier provider cascade**:

```
                       ┌─────────────────────────┐
                       │  Initiate Contract Scan │
                       └────────────┬────────────┘
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │  [1] Google Gemini 2.5    │ ─── (Success) ───► [Return UI]
                      │          (Primary)        │
                      └─────────────┬─────────────┘
                                    │ (Outage, Latency, or Rate Limit)
                                    ▼
                      ┌───────────────────────────┐
                      │  [2] OpenRouter Claude    │ ─── (Success) ───► [Return UI]
                      │        (Secondary)        │
                      └─────────────┬─────────────┘
                                    │ (Timeout >90s or Both Offline)
                                    ▼
                      ┌───────────────────────────┐
                      │  [3] Cinematic Mock Local │ ─────────────────► [Return UI]
                      │         (Safety Net)      │
                      └───────────────────────────┘
```

1.  **Google Gemini 2.5 Flash (Primary):** Selected for high-speed, native, structured JSON parsing using schemas.
2.  **OpenRouter Claude 3.5 Sonnet (Secondary Fallback):** Automatically triggered with identical schema instructions if Gemini times out or throws an error.
3.  **Cinematic Mock Local JSON (Tertiary Safety Net):** If both external API endpoints are down, or the analysis hits a strict 90-second execution threshold, the backend generates a high-fidelity mock response. This guarantees a smooth dashboard presentation and allows mock-driven walk-throughs to succeed under any conditions.

---

## 🛠️ Tech Stack

### Frontend Service
*   **Framework:** Next.js 16.2.6 (App Router)
*   **Runtime:** React 19.0.0
*   **Styling:** Tailwind CSS v4.2.0 (Dynamic variables + Glassmorphism system)
*   **Animations:** Framer Motion & CSS Animations (`tw-animate-css`)
*   **Visualizations:** Recharts (Interactive Radar and Area components)
*   **Icons & Components:** Radix UI primitives & Lucide React

### Backend Service
*   **Framework:** FastAPI 0.110.0+ (Asynchronous Python)
*   **Server Engine:** Uvicorn
*   **Document Parsers:** PyPDF2 (PDF extraction) & python-docx (Microsoft Word extraction)
*   **AI Integration:** Google Generative AI SDK, HTTPX (Asynchronous OpenRouter communication)
*   **Configuration:** Dotenv (Environment mapping)

---

## 💻 Local Development Setup

Follow these steps to run the complete environment locally:

### Prerequisites
*   [Node.js v18+](https://nodejs.org/)
*   [Python 3.11+](https://www.python.org/)
*   `pnpm` or `npm` package manager

---

### 1. Backend Server Setup

Navigate into the backend folder, initialize a virtual environment, install dependencies, and launch:

```bash
cd lexguard_backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required libraries
pip install -r requirements.txt

# Create .env from template
cp .env.example .env   # Or edit existing .env with your keys

# Run development server (runs on port 8000 by default with hot-reloading)
python main.py
```

---

### 2. Frontend Client Setup

Navigate into the frontend folder, install the packages, and boot up:

```bash
cd lexguard_frontend

# Install dependencies using pnpm (recommended) or npm
pnpm install
# or
npm install

# Setup local environment variables
cp .env.example .env.local  # Ensure API URL points to http://127.0.0.1:8000

# Start Next.js development server (runs on port 3000 by default)
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the suite!

---

## ⚙️ Environment Configurations

### Backend `.env`
Add these keys to `lexguard_backend/.env` for local operation:

```env
GEMINI_API_KEY=AIzaSy...your_gemini_key_here
PORT=8000
HOST=0.0.0.0
DEBUG=True
OPENROUTER_API_KEY=sk-or-...your_openrouter_key_here
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
FRONTEND_URL=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend `.env.local`
Add these variables to `lexguard_frontend/.env.local` to bind it to the API:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## 🚀 Production Deployment Guide

Deploying to production is completely automated. Follow these quick specs:

### FastAPI Backend on Render
1.  **Build Command:** `pip install -r requirements.txt`
2.  **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
3.  **Root Directory:** `lexguard_backend`
4.  **Environment Variables:** Add `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, and `FRONTEND_URL` (pointing to your Vercel domain).

### Next.js Frontend on Vercel
1.  **Framework Preset:** `Next.js`
2.  **Root Directory:** `lexguard_frontend`
3.  **Environment Variables:** Add `NEXT_PUBLIC_API_URL` pointing to your active Render web service (e.g., `https://lexguard-backend.onrender.com`).

*For deep details, step-by-step screenshots, and troubleshooting diagnostics, review the full [📋 DEPLOYMENT.md](file:///Users/raghavsharma/Desktop/Lexguard/DEPLOYMENT.md).*

---

## 🔒 CORS Security & Hardening

CORS errors are the number one headache when coupling separate hosting providers. LEXGUARD provides security configurations out of the box:

*   **Dynamic Comma-Separated Whitelisting:** The backend environment variable `FRONTEND_URL` parses lists of domains (e.g., `https://production.com,http://localhost:3000`).
*   **Automatic Vercel Wildcard Matching:** The API uses regular expression matching (`allow_origin_regex=r"https://.*\.vercel\.app"`) to ensure Vercel's dynamic build preview links are seamlessly authorized without any manual domain registering.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
