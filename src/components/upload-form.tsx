"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Loader2, FileAudio } from "lucide-react";
import { formatBytes } from "@/lib/utils";

const ACCEPT = ".mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm";
const MAX_MB = 25;

export function UploadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [recipients, setRecipients] = useState("");
  const [diarize, setDiarize] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<string>("");

  function onPickFile(f: File | null) {
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large. Max ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Pick an audio file first.");
      return;
    }
    setBusy(true);
    setStage("Uploading…");

    const fd = new FormData();
    fd.append("audio", file);
    fd.append("title", title || file.name);
    fd.append("diarize", diarize ? "true" : "false");
    fd.append("sendEmail", sendEmail ? "true" : "false");
    fd.append("recipients", recipients);

    try {
      setStage("Transcribing & summarizing… this can take 30–90s");
      const res = await fetch("/api/meetings", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      toast.success("Meeting processed.");
      router.push(`/meetings/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
      setStage("");
    }
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 space-y-5">
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onPickFile(e.dataTransfer.files[0] ?? null);
        }}
        className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-toffee/40 bg-ink/40 px-6 py-10 transition hover:border-rytmic-red/60"
      >
        {file ? (
          <>
            <FileAudio className="h-8 w-8 text-ambernight" />
            <div className="text-sm text-ambernight">{file.name}</div>
            <div className="text-xs text-skyway/70">{formatBytes(file.size)}</div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="mt-1 text-xs text-skyway hover:text-ambernight underline"
            >
              Choose a different file
            </button>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-skyway group-hover:text-ambernight" />
            <div className="text-sm text-ambernight">Drop audio file or click to browse</div>
            <div className="text-xs text-skyway/70">
              mp3 · mp4 · m4a · wav · webm · max {MAX_MB} MB
            </div>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">Meeting title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 planning sync"
            className="field-input"
          />
        </label>
        <label className="block">
          <span className="field-label">Recipients (comma-separated)</span>
          <input
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="ali@team.com, ahmed@team.com"
            className="field-input"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-6 text-sm text-skyway">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={diarize}
            onChange={(e) => setDiarize(e.target.checked)}
            className="h-4 w-4 accent-rytmic-red"
          />
          Speaker diarization (OpenAI, slower)
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="h-4 w-4 accent-rytmic-red"
          />
          Send follow-up email automatically
        </label>
      </div>

      <div className="flex items-center justify-between border-t border-blue-coal/60 pt-4">
        <div className="text-xs text-skyway/70">
          {busy ? stage : "Groq Whisper handles transcription. GPT-4o-mini handles summary."}
        </div>
        <button type="submit" disabled={busy || !file} className="btn-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {busy ? "Processing…" : "Process meeting"}
        </button>
      </div>
    </form>
  );
}
