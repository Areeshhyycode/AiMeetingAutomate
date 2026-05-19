import Groq from "groq-sdk";
import OpenAI from "openai";
import { toFile } from "openai/uploads";

export type TranscriptSegment = {
  speaker: string | null;
  start: number | null;
  end: number | null;
  text: string;
};

export type TranscriptionResult = {
  text: string;
  segments: TranscriptSegment[];
  durationSeconds: number | null;
};

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function transcribeWithGroq(
  audio: Buffer,
  fileName: string
): Promise<TranscriptionResult> {
  if (!groq) throw new Error("GROQ_API_KEY missing");

  const file = await toFile(audio, fileName);
  const res = await groq.audio.transcriptions.create({
    file,
    model: "whisper-large-v3",
    response_format: "verbose_json",
    temperature: 0,
  });

  const segments = (res as { segments?: Array<{ start: number; end: number; text: string }> })
    .segments;

  return {
    text: res.text,
    segments:
      segments?.map((s) => ({
        speaker: null,
        start: s.start,
        end: s.end,
        text: s.text.trim(),
      })) ?? [],
    durationSeconds:
      (res as { duration?: number }).duration ?? null,
  };
}

export async function transcribeWithOpenAIDiarize(
  audio: Buffer,
  fileName: string
): Promise<TranscriptionResult> {
  if (!openai) throw new Error("OPENAI_API_KEY missing");

  const file = await toFile(audio, fileName);
  const res = await openai.audio.transcriptions.create({
    file,
    model: "gpt-4o-transcribe-diarize",
    response_format: "diarized_json",
    chunking_strategy: "auto",
  } as unknown as Parameters<typeof openai.audio.transcriptions.create>[0]);

  const segments =
    (res as unknown as {
      segments?: Array<{ speaker?: string; start: number; end: number; text: string }>;
    }).segments ?? [];

  const text =
    (res as unknown as { text?: string }).text ??
    segments.map((s) => `${s.speaker ?? "speaker"}: ${s.text}`).join("\n");

  return {
    text,
    segments: segments.map((s) => ({
      speaker: s.speaker ?? null,
      start: s.start,
      end: s.end,
      text: s.text.trim(),
    })),
    durationSeconds:
      segments.length > 0 ? segments[segments.length - 1].end : null,
  };
}

export async function transcribe(
  audio: Buffer,
  fileName: string,
  options: { diarize?: boolean } = {}
): Promise<TranscriptionResult> {
  if (options.diarize && openai) {
    return transcribeWithOpenAIDiarize(audio, fileName);
  }
  if (groq) return transcribeWithGroq(audio, fileName);
  if (openai) return transcribeWithOpenAIDiarize(audio, fileName);
  throw new Error("No transcription provider configured. Set GROQ_API_KEY or OPENAI_API_KEY.");
}
