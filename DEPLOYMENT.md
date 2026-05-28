# 🛡️ LEXGUARD — Complete Production Deployment Guide

This guide details the fresh, foolproof steps to deploy the **LEXGUARD AI Contract Intelligence System** with the backend hosted on **Render** and the frontend hosted on **Vercel**. 

---

## 🏗️ 1. Architecture Overview & AI Pipeline Flow

LEXGUARD is a stateless web application that couples a high-fidelity dynamic Next.js frontend with a fast FastAPI backend.

```
       [ Client Browser ]
               │
               ▼ (HTTPS Requests)
   ┌───────────────────────┐
   │    Vercel Frontend    │
   │  (Next.js 16 + tw v4) │
   └───────────────────────┘
               │
               ▼ (API Calls / CORS Checked)
   ┌───────────────────────┐
   │    Render Backend     │
   │   (FastAPI + Python)  │
   └───────────────────────┘
               │
               ├─► [1] Google Gemini 2.5 Flash (Primary)
               ├─► [2] OpenRouter Claude 3.5 Sonnet (Secondary Fallback)
               └─► [3] Cinematic Hardcoded JSON (Tertiary Safety Net)
```

### 🧠 Dynamic AI Fallback Pipeline
The backend is designed for high availability using a cascade of three intelligence providers:
1. **Google Gemini 2.5 Flash**: Primary provider for high-speed structured JSON parsing.
2. **OpenRouter (Claude 3.5 Sonnet)**: Automatically triggered if Gemini fails or hits a rate limit.
3. **Cinematic Fallback Mock**: Automatically triggered if both APIs are down or if the client request times out (90-second safety threshold). This guarantees the user interface never breaks.

---

## 📦 2. GitHub Repository Setup

Before deploying, make sure your project is committed to a GitHub repository:

1. Create a **private or public** repository on GitHub (e.g., `github.com/your-username/lexguard`).
2. Initialize and push your local codebase to the repository:
   ```bash
   git init
   git add .
   git commit -m "feat: harden CORS, standard API env config & health check"
   git branch -M main
   git remote add origin https://github.com/your-username/lexguard.git
   git push -u origin main
   ```

---

## 🐍 3. Render Backend Deployment

Render hosts the FastAPI Python server.

### Step-by-Step Setup:
1. Log into your account on **[Render.com](https://render.com/)**.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub account and select your `lexguard` repository.
4. Configure the Web Service with the following exact settings:
   * **Name**: `lexguard-backend`
   * **Region**: Select the one closest to you (e.g., `Oregon (US West)`)
   * **Branch**: `main`
   * **Root Directory**: `lexguard_backend` ⚠️ *Crucial: Point to the backend folder!*
   * **Runtime**: `Python`
   * **Plan**: `Free`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Configure Environment Variables on Render:
Navigate to the **Environment** tab of your Render service and add these keys:

| Environment Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `your_actual_gemini_key` | Your Google AI Studio API Key |
| `OPENROUTER_API_KEY` | `your_openrouter_key` | Secondary fallback Claude API Key |
| `OPENROUTER_MODEL` | `anthropic/claude-3.5-sonnet` | Model utilized by the secondary provider |
| `FRONTEND_URL` | `https://your-vercel-app.vercel.app` | Comma-separated Vercel URLs (production & dev) |
| `DEBUG` | `False` | Turn off developer debug logs |

> [!NOTE]
> **Free-Tier Cold Starts**: Render's free tier spins down your server after 15 minutes of inactivity. When a user first lands on your frontend and uploads a document, the first request may take ~50 seconds to wake the server. Subsequent requests will be near-instant.

---

## ⚛️ 4. Vercel Frontend Deployment

Vercel hosts the responsive, glassmorphic Next.js frontend.

### Step-by-Step Setup:
1. Log into your account on **[Vercel.com](https://vercel.com/)**.
2. Click **Add New** $\rightarrow$ **Project**.
3. Select your `lexguard` repository from the GitHub imports list.
4. Configure the project details:
   * **Project Name**: `lexguard-frontend`
   * **Framework Preset**: `Next.js`
   * **Root Directory**: `lexguard_frontend` ⚠️ *Crucial: Point to the frontend folder!*
5. Expand the **Build and Development Settings** and ensure they are set to default (`npm run build` / `npm run start`).

### Configure Environment Variables on Vercel:
Expand the **Environment Variables** section and add the following variable:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://lexguard-backend-w5k1.onrender.com` | Your live Render backend URL (no trailing slash) |

> [!IMPORTANT]
> **Consistent Variable Naming**: Make sure to use **`NEXT_PUBLIC_API_URL`**! The frontend has been hardened to look for this variable to know where the Render backend resides. If omitted, the frontend defaults to `http://127.0.0.1:8000` (which fails in production).

6. Click **Deploy**. Vercel will build the production bundle of Next.js and launch it within 2 minutes.

---

## 🔒 5. CORS Hardening Explanation

CORS (Cross-Origin Resource Sharing) is a browser security protocol that blocks requests from domains that aren't explicitly whitelisted. 

To prevent CORS issues when Vercel generates dynamic preview links or when you want to use multiple frontend test domains, the LEXGUARD backend has been hardened to support:
* **Regex Whitelisting**: Automatically accepts requests from *any* subdomain ending in `.vercel.app` (e.g., Vercel previews and production deployments).
* **Comma-Separated Whitelisting**: The `FRONTEND_URL` variable on Render accepts a list of comma-separated domains (e.g. `https://customdomain.com,http://localhost:3000`).
* **Local Development**: Always accepts local ports `localhost:3000` and `127.0.0.1:3000`.

---

## 🧪 6. Post-Deployment Verification & Diagnostics

Follow this verification checklist after both deployments succeed:

### 1. Backend Health Check
Open your browser and navigate to:
```
https://your-render-backend-url.onrender.com/health
```
You should instantly receive a clean JSON response:
```json
{
  "status": "healthy",
  "service": "LEXGUARD Backend",
  "version": "2.0.0"
}
```

### 2. Frontend Communication Test
1. Load your Vercel website `https://your-vercel-app.vercel.app`.
2. Drag and drop any short sample contract PDF under 10MB.
3. Observe the dynamic glassmorphic scanner overlay.
4. If it successfully finishes in the **Results Dashboard**, your pipeline is fully operational!

---

## 🛠️ 7. Troubleshooting Checklist

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| **"Unable to reach the LEXGUARD backend" (Offline Screen)** | Backend is booting up, or frontend URL variable is wrong. | Wait 60 seconds (free-tier wake up). Check Vercel Environment Variables $\rightarrow$ ensure `NEXT_PUBLIC_API_URL` matches your exact Render URL (starting with `https://`, no trailing `/`). |
| **CORS errors in Browser Console** | Frontend origin is blocked by Backend CORS settings. | Ensure the frontend domain ends with `.vercel.app` or is explicitly added to `FRONTEND_URL` in the Render dashboard (separated by commas). |
| **Upload results always use the Mock Fallback** | AI APIs are missing or key string is `your_gemini_api_key_here`. | Ensure `GEMINI_API_KEY` is set correctly in the Render Dashboard and does not contain spaces or quotes. Check Render logs to verify. |
| **Render Service Deployment Fails** | Root directory or plan configurations are incorrect. | Check that "Root Directory" is set to `lexguard_backend` and the start command has the double hyphen (`--host 0.0.0.0 --port $PORT`). |
