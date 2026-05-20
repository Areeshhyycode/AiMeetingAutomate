# 🎙️ AI Meeting Automation

Upload a meeting recording — or paste a Loom link — and get a transcript, a
structured summary, extracted action items, and an auto-drafted follow-up
email. Built with Next.js, MongoDB, Groq Whisper, OpenAI and Resend.

![CI](https://github.com/Areeshhyycode/AiMeetingAutomate/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **Audio upload** — mp3 / mp4 / m4a / wav / webm, up to 25 MB
- **Loom links** — paste a public Loom share URL; the video is fetched automatically
- **Transcription** — Groq `whisper-large-v3` (fast) or OpenAI diarization for speaker labels
- **AI analysis** — GPT-4o-mini produces a summary, key decisions, risks and action items
- **Action items** — structured task / assignee / deadline / priority
- **Follow-up email** — drafted automatically, copy it or send via Resend
- **Dashboard** — meeting history, per-meeting detail, live counters

## 🧱 Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS — Pantone palette design system |
| Database | MongoDB Atlas + Mongoose |
| Transcription | Groq Whisper · OpenAI `gpt-4o-transcribe-diarize` |
| Summary | OpenAI `gpt-4o-mini` (structured JSON, Zod-validated) |
| Email | Resend |

## 🚀 Getting started

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local   # then fill in the values

# 3. Run
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `GROQ_API_KEY` | ✅ | Fast Whisper transcription |
| `OPENAI_API_KEY` | ✅ | Summary + optional diarization |
| `RESEND_API_KEY` | ➖ | Follow-up email (send is skipped if absent) |
| `RESEND_FROM` | ➖ | Verified "from" address |

## 🔄 Pipeline

```
Upload audio  /  Loom link
        ↓
Groq Whisper transcription   ← or OpenAI diarization
        ↓
GPT-4o-mini structured analysis
   → summary · decisions · risks · action items · drafted email
        ↓
MongoDB persist
        ↓
Optional: Resend follow-up email
```

## 📡 API

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/meetings` | Upload audio or a Loom URL; runs the pipeline |
| `GET` | `/api/meetings` | List recent meetings |
| `GET` | `/api/meetings/[id]` | Full meeting record |
| `POST` | `/api/meetings/[id]` | `{ "action": "send_email" }` — send the follow-up |
| `DELETE` | `/api/meetings/[id]` | Delete a meeting |
| `GET` | `/api/health` | Process + MongoDB + key-config status |

## 🗂️ Project layout

```
src/
  app/
    api/health/          — health probe
    api/meetings/        — REST endpoints
    meetings/            — history + detail pages (+ loading skeletons)
    page.tsx             — dashboard with stats + upload
    error.tsx            — error boundary
    not-found.tsx        — custom 404
  components/            — upload form, copy / delete / send buttons
  lib/                   — db, config, utils
  models/Meeting.ts      — Mongoose schema
  services/              — transcription, summarization, email, loom
```

## ☁️ Deploying to Vercel

1. Import the repo in Vercel.
2. Add the environment variables above under **Settings → Environment Variables**.
3. In MongoDB Atlas → **Network Access**, allow `0.0.0.0/0` (Vercel IPs are dynamic).
4. Deploy.

> The Vercel Hobby plan caps serverless functions at 60 s. Long recordings
> need an async worker — see the roadmap.

## 🛣️ Roadmap

- BullMQ + Redis async processing for long recordings
- `ffmpeg` audio extraction to lift the 25 MB ceiling
- Zoom OAuth + webhook ingestion
- NextAuth accounts + per-user meetings
- Vector search — "chat with your meetings"

## 📄 License

MIT — see [LICENSE](LICENSE).
