import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Meeting } from "@/models/Meeting";
import { transcribe } from "@/services/transcription";
import { summarize } from "@/services/summarization";
import { sendFollowUp } from "@/services/email";
import { fetchLoomVideo } from "@/services/loom";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_BYTES = 25 * 1024 * 1024;

export async function GET() {
  await connectDB();
  const meetings = await Meeting.find({}, {
    title: 1,
    status: 1,
    audioFileName: 1,
    durationSeconds: 1,
    createdAt: 1,
    "followUpEmail.sentAt": 1,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return NextResponse.json({ meetings });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("audio");
  const loomUrl = (formData.get("loomUrl") as string | null)?.trim() ?? "";
  const title = (formData.get("title") as string | null) ?? "Untitled meeting";
  const diarize = formData.get("diarize") === "true";
  const recipientsRaw = (formData.get("recipients") as string | null) ?? "";
  const sendEmail = formData.get("sendEmail") === "true";

  const hasFile = file instanceof File && file.size > 0;
  if (!hasFile && !loomUrl) {
    return NextResponse.json(
      { error: "Provide an audio file or a Loom link" },
      { status: 400 }
    );
  }
  if (hasFile && file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (${file.size} bytes, max ${MAX_BYTES})` },
      { status: 413 }
    );
  }

  const recipients = recipientsRaw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.includes("@"));

  await connectDB();

  // Resolve the source into an audio/video buffer before persisting size.
  let buffer: Buffer;
  let sourceName: string;
  try {
    if (loomUrl) {
      const loom = await fetchLoomVideo(loomUrl);
      buffer = loom.buffer;
      sourceName = loom.fileName;
    } else {
      buffer = Buffer.from(await (file as File).arrayBuffer());
      sourceName = (file as File).name;
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load the recording" },
      { status: 400 }
    );
  }

  const created = await Meeting.create({
    title,
    audioFileName: sourceName,
    audioSizeBytes: buffer.length,
    status: "transcribing",
    followUpEmail: { to: recipients, subject: "", body: "" },
  });
  const id = created._id.toString();

  try {
    const transcription = await transcribe(buffer, sourceName, { diarize });
    await Meeting.findByIdAndUpdate(id, {
      $set: {
        transcript: transcription.text,
        segments: transcription.segments,
        durationSeconds: transcription.durationSeconds,
        status: "summarizing",
      },
    });

    const summary = await summarize(transcription.text);

    let sentAt: Date | null = null;
    if (sendEmail && recipients.length > 0) {
      const result = await sendFollowUp({
        to: recipients,
        subject: summary.followUpEmail.subject,
        body: summary.followUpEmail.body,
      });
      if (!result.skipped) sentAt = new Date();
    }

    await Meeting.findByIdAndUpdate(id, {
      $set: {
        summary: summary.summary,
        keyDecisions: summary.keyDecisions,
        risks: summary.risks,
        actionItems: summary.actionItems,
        "followUpEmail.subject": summary.followUpEmail.subject,
        "followUpEmail.body": summary.followUpEmail.body,
        ...(sentAt ? { "followUpEmail.sentAt": sentAt } : {}),
        status: "completed",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await Meeting.findByIdAndUpdate(id, { $set: { status: "failed", error: msg } });
    return NextResponse.json({ id, error: msg }, { status: 500 });
  }

  return NextResponse.json({ id }, { status: 201 });
}
