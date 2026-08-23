# InsightSync — AI-Powered Meeting Intelligence Platform

A high-throughput meeting intelligence engine that transforms raw audio recordings into deterministic executive summaries, formalized consensus points, and prioritized action items.

---

## Architecture Decisions & Tech Stack Rationale

| Layer | Technology Selected | Technical Justification & Alternatives Considered |
| :--- | :--- | :--- |
| **Speech-to-Text (ASR)** | **Groq Whisper Large-v3** | Hosted on Groq custom LPU (Language Processing Unit) architecture, delivering up to 200x real-time transcription speeds with sub-second processing latency compared to standard hosted Whisper endpoints. |
| **Insight Extraction (LLM)** | **Google Gemini 2.5 Flash** | Optimized for massive context handling, fast token generation, and strict deterministic JSON schema parsing without hallucinating raw markdown code fences. |
| **Backend Runtime** | **Node.js & Express (ESM)** | Lightweight, non-blocking asynchronous event loop optimized for I/O-bound AI orchestration, handling concurrent multipart file streaming and parallel API roundtrips with minimal RAM consumption. |
| **Database & Persistence** | **MongoDB Atlas (Mongoose)** | Meeting intelligence records are naturally polymorphic and document-oriented (nested arrays for action items and string lists for decisions). Native BSON document storage avoids multi-table relational joins. |
| **Frontend Architecture** | **React 18 + Vite + Tailwind CSS** | Single-page reactive state machine (`idle` -> `processing` -> `completed` -> `error`) with responsive UI updates, client-side search filtering, and clean dark-mode typography. |

---

## Engineering Constraints & System Resilience

### 1. 25MB Audio Payload Limit
* **Upstream Provider Constraint**: The Groq audio transcription endpoint (`/v1/audio/transcriptions`) enforces a strict single-request ceiling of 25 MB.
* **Gateway & Memory Protection**: Multi-tier validation at both the client level (React) and the gateway layer (Multer) rejects oversized payloads early, protecting Node.js memory buffers and saving bandwidth.
* **Duration Coverage**: Under standard speech bitrates (64-128 kbps in MP3/M4A), a 25MB allocation accommodates 25 to 50 minutes of continuous meeting speech.
* **Scalability Roadmap**: For longer enterprise recordings, the architecture supports an asynchronous `ffmpeg` audio-chunking worker queue to segment, transcribe in parallel, and concatenate transcripts.

### 2. DNS Fallback Resilience for MongoDB Atlas
On restricted networks and specific Windows socket environments, native Node.js `getaddrinfo` occasionally times out resolving Atlas `mongodb+srv://` seed records. An automated DNS fallback layer is implemented in the database configuration layer:

```javascript
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Graceful fallback if DNS modification is restricted
}
```

---

## System Architecture Pipeline

```
[ Client Browser / React ]
        │ 
        │ (1) Multipart Audio Stream (.mp3, .wav, .m4a | max 25MB)
        ▼
[ Express API Gateway / Multer ]
        │
        ├────────► [ Groq Whisper Large-v3 ] ──► (Speech-to-Text Transcription)
        │                                                  │
        │ ◄────────────────────────────────────────────────┘ (Raw Transcript Text)
        │
        ├────────► [ Google Gemini 2.5 Flash ] ──► (JSON Schema Structured Extraction)
        │                                                  │
        │ ◄────────────────────────────────────────────────┘ (Title, Summary, Decisions, Actions)
        │
        ├────────► [ MongoDB Atlas (Mongoose) ] ──► (Atomic Document Persistence & Indexing)
        │
        ▼
[ Reactive Dashboard Display + Real-time History Sync ]
```

---

## Features

* **High-Speed Transcription**: Fast speech-to-text processing for `.mp3`, `.wav`, and `.m4a` files via Groq Whisper Large-v3.
* **Structured Insights**: Deterministic parsing of Executive Summaries, Key Decisions, and Action Items (with priority flags and assignees).
* **Enterprise Dashboard**: Dark-mode interface built with Tailwind CSS, Lucide icons, and zero visual clutter.
* **Persistent History Panel**: Slide-over drawer with real-time text filtering, historical record loading, and deletion.
* **Markdown Export**: One-click summary export formatted for Notion, Slack, or documentation archives.

---

## API Specifications

### 1. Process Meeting Audio
* **Endpoint**: `POST /api/meetings/process`
* **Content-Type**: `multipart/form-data`
* **Payload**: `audio` (Binary file, max 25MB)
* **Response**: `200 OK`

```json
{
  "_id": "66c891e4f9b2c3a1d0e54321",
  "fileName": "board-meeting.mp3",
  "title": "Quarterly Product Planning",
  "overview": "The team reviewed sprint performance and finalized infrastructure initiatives...",
  "key_decisions": [
    "Approved transition to managed cloud database instances."
  ],
  "action_items": [
    {
      "task": "Configure database access roles and network security rules",
      "assignee": "DevOps Lead",
      "priority": "High"
    }
  ],
  "transcript": "Raw speech transcript text...",
  "createdAt": "2026-08-23T15:30:00.000Z"
}
```

### 2. Retrieve All Meetings
* **Endpoint**: `GET /api/meetings`
* **Response**: `200 OK` (Array of meeting metadata objects sorted by creation date descending)

### 3. Fetch Single Meeting by ID
* **Endpoint**: `GET /api/meetings/:id`
* **Response**: `200 OK` (Complete meeting document including full transcript and action items)

### 4. Delete Meeting Record
* **Endpoint**: `DELETE /api/meetings/:id`
* **Response**: `200 OK` (`{ "message": "Meeting deleted successfully" }`)

---

## Local Installation & Setup

### Prerequisites
* Node.js (v18 or higher)
* MongoDB Atlas connection string
* Groq API Key
* Google Gemini API Key

### 1. Repository Setup
```bash
git clone [https://github.com/](https://github.com/)<your-username>/meeting-summarizer.git
cd meeting-summarizer
```

### 2. Backend Configuration
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/meeting_summarizer_db?retryWrites=true&w=majority
```

Install backend dependencies and run the server:
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Configuration
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

---

## License
Distributed under the MIT License.
