import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Meeting } from "@/models/Meeting";
import { sendFollowUp } from "@/services/email";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await connectDB();
  const meeting = await Meeting.findById(params.id).lean();
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ meeting });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  if (body.action !== "send_email") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  await connectDB();
  const meeting = await Meeting.findById(params.id).lean();
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fu = meeting.followUpEmail;
  if (!fu?.body) {
    return NextResponse.json({ error: "No follow-up email generated yet" }, { status: 400 });
  }
  if (!fu.to || fu.to.length === 0) {
    return NextResponse.json({ error: "No recipients on this meeting" }, { status: 400 });
  }

  const result = await sendFollowUp({
    to: fu.to,
    subject: fu.subject,
    body: fu.body,
  });
  if (result.skipped) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 400 });
  }
  await Meeting.findByIdAndUpdate(params.id, {
    $set: { "followUpEmail.sentAt": new Date() },
  });
  return NextResponse.json({ ok: true, id: result.id });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await connectDB();
  await Meeting.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
