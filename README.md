# InsightSync — AI-Powered Meeting Intelligence Platform

> Transform raw meeting audio recordings into structured executive summaries, key decisions, and prioritized action items. Powered by Groq Whisper Large-v3, Google Gemini 2.5 Flash, React, Node.js, and MongoDB Atlas.

---

## Architecture Decisions & Tech Stack Rationale

Why each component of the stack was chosen:

| Component | Technology Selected | Technical Rationale & Alternatives Considered |
| :--- | :--- | :--- |
| **Speech-to-Text (ASR)** | **Groq Whisper Large-v3** | Runs on Groq's custom LPU (Language Processing Unit) silicon, delivering up to **200x real-time transcription speeds** with near-zero latency compared to standard OpenAI Whisper APIs or self-hosted HuggingFace instances. |
| **Insight Extraction (LLM)** | **Google Gemini 2.5 Flash** | Optimized for massive context windows, ultra-fast token generation, and strict deterministic JSON schema adherence. It extracts structured decisions and action items without hallucinating unstructured markdown blocks. |
| **Backend Runtime** | **Node.js + Express (ESM)** | The application is an I/O-bound AI orchestration gateway. Node's non-blocking, asynchronous event loop handles concurrent multipart file uploads and parallel third-party API roundtrips with minimal RAM and CPU overhead. |
| **Database & Persistence** | **MongoDB Atlas (Mongoose)** | Meeting intelligence data is naturally polymorphic and document-oriented (nested arrays for `action_items` and `key_decisions` alongside large text blocks). Storing as native BSON documents eliminates expensive relational joins across 4+ tables. |
| **Frontend Architecture** | **React 18 + Vite + Tailwind CSS** | Single-page reactive state machine (`idle` → `processing` → `completed` → `error`) with instant UI updates, client-side search filtering, and clean minimal Linear-style aesthetics. |

---

##  Engineering Constraints & Trade-offs

### 1. Why Enforce a 25MB File Size Limit?
* **Upstream Provider Constraint**: Groq's `/v1/audio/transcriptions` endpoint enforces a hard single-payload limit of **25 MB**.
* **Client-Side & Gateway Protection**: Early validation at both Multer (gateway) and React (client-side) prevents massive 200MB+ audio uploads from choking the Node.js event loop or consuming unnecessary server network bandwidth.
* **Practical Coverage**: At standard speech encoding rates (64–128 kbps MP3/M4A), a 25MB file easily accommodates **25 to 50 minutes of continuous meeting audio**.

> **Future Scaling Path**: To support 2+ hour recordings (100MB+), the backend roadmap includes an `ffmpeg` chunking pipeline that splits large audio into 10-minute parallel segments, transcribes concurrently via Groq, and stitches the transcript before passing it to Gemini.

### 2. Atlas SRV DNS Fallback (Windows / Campus Networks)
On certain localized networks (such as university Wi-Fi or Windows workstations), Node.js native `getaddrinfo` occasionally times out resolving Atlas `mongodb+srv://` seed lists. We integrated an automated fallback to Google/Cloudflare public DNS servers (`dns.setServers(['8.8.8.8', '1.1.1.1'])`) within the database configuration layer for 99.9% connection reliability.

---

##  System Architecture Workflow

```
[ User Browser / React ]
        │ 
        │ (1) Multipart Audio Upload (.mp3, .wav, .m4a / max 25MB)
        ▼
[ Express API Gateway / Multer ]
        │
        ├────────► [ Groq Whisper Large-v3 ] ──► (Speech-to-Text Transcription)
        │                                                  │
        │ ◄────────────────────────────────────────────────┘ (Raw Transcript Text)
        │
        ├────────► [ Google Gemini 2.5 Flash ] ──► (JSON Schema Insight Extraction)
        │                                                  │
        │ ◄────────────────────────────────────────────────┘ (Title, Summary, Decisions, Action Items)
        │
        ├────────► [ MongoDB Atlas (Mongoose) ] ──► (Atomic Document Storage & History Indexing)
        │
        ▼
[ Real-time Dashboard Rendering ]
```

---

##  Features

* **Sub-minute Transcription**: High-speed speech transcription using Groq Whisper Large-v3.
* **Structured Insight Extraction**: Deterministic parsing of Executive Summaries, Key Decisions, and Action Items (with priorities and owners).
* **Enterprise UI**: Minimalist Linear/Raycast-inspired dark theme with zero visual noise.
* **Meeting History & Search**: Slide-over drawer with instant search filtering, historical reloading, and deletion.
* **Export Utilities**: One-click Markdown copy formatted for Notion, Slack, or Google Docs.

---

##  Getting Started

### 1. Environment Configuration
Create `backend/.env`:
```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/meeting_summarizer_db?retryWrites=true&w=majority
```

### 2. Run Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173`.
