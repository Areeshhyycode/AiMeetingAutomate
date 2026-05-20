/**
 * Loom share-link ingestion.
 *
 * A Loom "share" link (loom.com/share/<id>) is an HTML page, not a media file.
 * Loom exposes an internal endpoint that returns the raw transcoded MP4 URL for
 * a given video id; we POST to it, then download the MP4 and hand the buffer to
 * the transcription pipeline (Groq Whisper accepts mp4 directly).
 */

import { MAX_UPLOAD_BYTES } from "@/lib/config";

export function parseLoomId(url: string): string | null {
  const m = url
    .trim()
    .match(/loom\.com\/(?:share|embed|v)\/([a-zA-Z0-9]+)/i);
  return m ? m[1] : null;
}

export type LoomVideo = {
  buffer: Buffer;
  fileName: string;
};

export async function fetchLoomVideo(url: string): Promise<LoomVideo> {
  const id = parseLoomId(url);
  if (!id) {
    throw new Error(
      "Invalid Loom URL. Expected something like https://www.loom.com/share/<id>"
    );
  }

  // Step 1 — ask Loom for the raw transcoded MP4 URL.
  const metaRes = await fetch(
    `https://www.loom.com/api/campaigns/sessions/${id}/transcoded-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (AI-Meeting-Automation)",
      },
      body: JSON.stringify({}),
    }
  );

  if (metaRes.status === 404) {
    throw new Error("Loom video not found. It may be deleted or the link is wrong.");
  }
  if (metaRes.status === 403 || metaRes.status === 401) {
    throw new Error(
      "Loom video is private. Make the video link public (anyone-with-link) and try again."
    );
  }
  if (!metaRes.ok) {
    throw new Error(`Loom returned HTTP ${metaRes.status} while resolving the video.`);
  }

  const meta = (await metaRes.json().catch(() => ({}))) as { url?: string };
  if (!meta.url) {
    throw new Error(
      "Could not extract a video URL from Loom (their page format may have changed)."
    );
  }

  // Step 2 — download the MP4.
  const videoRes = await fetch(meta.url);
  if (!videoRes.ok) {
    throw new Error(`Failed to download Loom video (HTTP ${videoRes.status}).`);
  }

  const contentLength = Number(videoRes.headers.get("content-length") ?? 0);
  if (contentLength > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Loom video is ${(contentLength / 1024 / 1024).toFixed(1)} MB — over the 25 MB limit. ` +
        "Use a shorter recording, or download it and compress to audio first."
    );
  }

  const buffer = Buffer.from(await videoRes.arrayBuffer());
  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Loom video is ${(buffer.length / 1024 / 1024).toFixed(1)} MB — over the 25 MB limit. ` +
        "Use a shorter recording, or download it and compress to audio first."
    );
  }

  return { buffer, fileName: `loom-${id}.mp4` };
}
