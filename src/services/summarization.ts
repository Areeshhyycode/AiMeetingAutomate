import OpenAI from "openai";
import { z } from "zod";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export const SummarySchema = z.object({
  summary: z.string(),
  keyDecisions: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  actionItems: z
    .array(
      z.object({
        task: z.string(),
        assignee: z.string().nullable().default(null),
        deadline: z.string().nullable().default(null),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
      })
    )
    .default([]),
  followUpEmail: z.object({
    subject: z.string(),
    body: z.string(),
  }),
});

export type MeetingSummary = z.infer<typeof SummarySchema>;

const SYSTEM_PROMPT = `You are an expert meeting analyst. Given a meeting transcript, produce a structured analysis.

Rules:
- "summary" must be 3–6 sentences, in plain English, covering what was discussed and decided.
- "keyDecisions" are concrete decisions made in the meeting (not topics discussed).
- "risks" are blockers, dependencies, or things that could derail the work.
- "actionItems" must be concrete tasks. Extract assignee names if mentioned. Extract deadlines (e.g. "Friday", "next sprint", "2026-06-01") if mentioned, otherwise null. Infer priority from urgency words.
- "followUpEmail" is a follow-up message the meeting organizer can send to attendees. Subject must be specific (no "Meeting Recap"). Body is plain text, friendly, with sections for Summary, Action Items, and Decisions.
- If the transcript is short, empty, or non-English gibberish, still produce valid JSON — leave arrays empty and put a one-line explanation in summary.
- Output ONLY valid JSON matching the schema. No prose, no markdown fences.`;

export async function summarize(transcript: string): Promise<MeetingSummary> {
  if (!openai) throw new Error("OPENAI_API_KEY missing");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analyze this meeting transcript and return the JSON object.\n\nTranscript:\n"""\n${transcript}\n"""`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);
  return SummarySchema.parse(parsed);
}
