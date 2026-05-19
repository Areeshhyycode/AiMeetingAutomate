# AI Meeting Automation

Upload a meeting recording → get a transcript, summary, action items, and an auto-generated follow-up email. Built with Next.js, MongoDB, Groq Whisper, OpenAI, and Resend.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — Pantone palette design system
- **MongoDB Atlas** + Mongoose
- **Groq Whisper** (`whisper-large-v3`) — fast transcription
- **OpenAI** `gpt-4o-transcribe-diarize` — optional speaker diarization
- **OpenAI** `gpt-4o-mini` — structured summary + action item extraction
- **Resend** — follow-up email delivery

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   Fill in:
   - `MONGODB_URI` — free Atlas cluster works
   - `GROQ_API_KEY` — from https://console.groq.com
   - `OPENAI_API_KEY` — from https://platform.openai.com
   - `RESEND_API_KEY` — from https://resend.com (optional; email send will skip if missing)
   - `RESEND_FROM` — e.g. `AI Meeting <onboarding@resend.dev>` for testing

3. **Run dev server**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000

## Flow

```
Upload audio (≤25 MB)
      ↓
Groq Whisper transcription   ← or OpenAI diarize if speaker labels needed
      ↓
GPT-4o-mini structured analysis
   → summary
   → key decisions
   → risks
   → action items (task, assignee, deadline, priority)
   → drafted follow-up email
      ↓
MongoDB persist
      ↓
Optional: Resend follow-up to recipients
```

## API

- `POST /api/meetings` — multipart upload (`audio`, `title`, `recipients`, `diarize`, `sendEmail`). Returns `{ id }`.
- `GET /api/meetings` — list (50 most recent).
- `GET /api/meetings/[id]` — full meeting.
- `POST /api/meetings/[id]` with `{ "action": "send_email" }` — send the drafted follow-up.
- `DELETE /api/meetings/[id]` — delete.

## Phase 2 (future)

- BullMQ + Redis worker for async processing
- Zoom OAuth + webhook to ingest recordings automatically
- NextAuth user accounts + per-user meeting scoping
- Pinecone vector store for "chat with your meetings"
- Meeting bot that joins live Zoom calls

## Project layout

```
src/
  app/
    api/meetings/        — REST endpoints
    meetings/            — history + detail pages
    page.tsx             — upload dashboard
    layout.tsx, globals.css
  components/            — UI (upload form, send button)
  lib/                   — db, utils
  models/Meeting.ts      — Mongoose schema
  services/              — transcription, summarization, email
```

## Pantone palette

| Color       | Hex     | Use                         |
|-------------|---------|-----------------------------|
| Ambernight  | #E5C7A1 | warm text / primary on dark |
| Skyway      | #A1B4C7 | muted text / info           |
| Toffee      | #755139 | borders / warm accent       |
| Rytmic Red  | #9B2335 | primary CTA / high priority |
| Tawny Port  | #6E2639 | hover / secondary           |
| Blue Coal   | #353D4B | surfaces / cards            |
| Syrah       | #5D2028 | destructive / errors        |
