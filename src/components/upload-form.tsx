"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Loader2, FileAudio, Video, Link2 } from "lucide-react";
import { formatBytes } from "@/lib/utils";

const ACCEPT = ".mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm";
const MAX_MB = 25;

type Source = "file" | "loom";

export function UploadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<Source>("file");
  const [file, setFile] = useState<File | null>(null);
  const [loomUrl, setLoomUrl] = useState("");
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

  const isLoomUrl = /loom\.com\/(?:share|embed|v)\/[a-zA-Z0-9]+/i.test(loomUrl);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (source === "file" && !file) {
      toast.error("Pick an audio file first.");
      return;
    }
    if (source === "loom" && !isLoomUrl) {
      toast.error("Paste a valid Loom share link (loom.com/share/...).");
      return;
    }
    setBusy(true);
    setStage("Uploading…");

    const fd = new FormData();
    if (source === "file" && file) {
      fd.append("audio", file);
      if (!title) setTitle(file.name);
      fd.append("title", title || file.name);
    } else {
      fd.append("loomUrl", loomUrl);
      fd.append("title", title || "Loom recording");
    }
    fd.append("diarize", diarize ? "true" : "false");
    fd.append("sendEmail", sendEmail ? "true" : "false");
    fd.append("recipients", recipients);

    try {
      setStage(
        source === "loom"
          ? "Fetching Loom video, transcribing & summarizing… 30–90s"
          : "Transcribing & summarizing… this can take 30–90s"
      );
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
      {/* source switch */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSource("file")}
          className={
            source === "file"
              ? "flex-1 rounded-xl bg-rytmic-red px-3 py-2 text-sm font-medium text-ambernight"
              : "flex-1 rounded-xl border border-blue-coal/60 px-3 py-2 text-sm text-skyway hover:text-ambernight"
          }
        >
          <span className="inline-flex items-center gap-2">
            <FileAudio className="h-4 w-4" /> Upload file
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSource("loom")}
          className={
            source === "loom"
              ? "flex-1 rounded-xl bg-rytmic-red px-3 py-2 text-sm font-medium text-ambernight"
              : "flex-1 rounded-xl border border-blue-coal/60 px-3 py-2 text-sm text-skyway hover:text-ambernight"
          }
        >
          <span className="inline-flex items-center gap-2">
            <Video className="h-4 w-4" /> Loom link
          </span>
        </button>
      </div>

      {source === "file" ? (
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
      ) : (
        <div className="rounded-xl border-2 border-dashed border-toffee/40 bg-ink/40 px-6 py-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-ambernight">
            <Link2 className="h-4 w-4 text-skyway" /> Paste a Loom share link
          </div>
          <input
            value={loomUrl}
            onChange={(e) => setLoomUrl(e.target.value)}
            placeholder="https://www.loom.com/share/abc123..."
            className="field-input"
          />
          <p className="mt-2 text-xs text-skyway/70">
            The video must be public (anyone-with-link) and under {MAX_MB} MB.
            {loomUrl && !isLoomUrl && (
              <span className="text-rytmic-red"> · That doesn’t look like a Loom link.</span>
            )}
            {isLoomUrl && <span className="text-ambernight"> · Looks good ✓</span>}
          </p>
        </div>
      )}

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
        <button
          type="submit"
          disabled={busy || (source === "file" ? !file : !isLoomUrl)}
          className="btn-primary"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {busy ? "Processing…" : "Process meeting"}
        </button>
      </div>
    </form>
  );
}
