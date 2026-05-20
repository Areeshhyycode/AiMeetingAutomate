import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Health probe. Reports whether the process is up and whether MongoDB is
 * reachable. Useful for uptime monitors and for debugging Vercel deploys
 * (e.g. confirming MONGODB_URI is set).
 */
export async function GET() {
  const checks: { service: string; ok: boolean; detail?: string }[] = [];

  try {
    await connectDB();
    checks.push({ service: "mongodb", ok: true });
  } catch (err) {
    checks.push({
      service: "mongodb",
      ok: false,
      detail: err instanceof Error ? err.message : "unknown error",
    });
  }

  checks.push({ service: "groq", ok: Boolean(process.env.GROQ_API_KEY) });
  checks.push({ service: "openai", ok: Boolean(process.env.OPENAI_API_KEY) });
  checks.push({ service: "resend", ok: Boolean(process.env.RESEND_API_KEY) });

  const healthy = checks.every((c) => c.ok || c.service === "resend");

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: healthy ? 200 : 503 }
  );
}
