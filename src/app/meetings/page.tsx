import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Meeting } from "@/models/Meeting";
import { formatDuration } from "@/lib/utils";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    completed: "border-ambernight/40 text-ambernight",
    transcribing: "border-skyway/40 text-skyway",
    summarizing: "border-skyway/40 text-skyway",
    pending: "border-toffee/40 text-toffee",
    failed: "border-syrah/60 text-syrah",
  };
  return `badge ${map[status] ?? "border-skyway/40 text-skyway"}`;
}

export default async function MeetingsPage() {
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

  return (
    <div className="card divide-y divide-blue-coal/60">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-lg font-semibold text-ambernight">Meeting history</h2>
        <span className="text-xs text-skyway/70">{meetings.length} recent</span>
      </div>
      {meetings.length === 0 && (
        <div className="px-5 py-10 text-center text-sm text-skyway/70">
          No meetings yet. <Link href="/" className="text-ambernight underline">Upload your first one →</Link>
        </div>
      )}
      {meetings.map((m) => (
        <Link
          key={m._id.toString()}
          href={`/meetings/${m._id.toString()}`}
          className="flex items-center justify-between px-5 py-4 transition hover:bg-blue-coal/40"
        >
          <div className="min-w-0 flex-1 pr-4">
            <div className="truncate text-sm font-medium text-ambernight">{m.title}</div>
            <div className="truncate text-xs text-skyway/70">
              {m.audioFileName} · {formatDuration(m.durationSeconds)} ·{" "}
              {new Date(m.createdAt as unknown as string).toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {m.followUpEmail?.sentAt && (
              <span className="badge border-ambernight/40 text-ambernight">emailed</span>
            )}
            <span className={statusBadge(m.status)}>{m.status}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
