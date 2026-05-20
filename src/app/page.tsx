import { UploadForm } from "@/components/upload-form";
import { connectDB } from "@/lib/db";
import { Meeting } from "@/models/Meeting";
import { Mic, FileText, ListChecks, Mail, CalendarCheck, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

const PIPELINE = [
  { icon: Mic, title: "Record / Upload", color: "text-ambernight" },
  { icon: FileText, title: "Transcribe", color: "text-skyway" },
  { icon: ListChecks, title: "Extract action items", color: "text-rytmic-red" },
  { icon: Mail, title: "Send follow-up", color: "text-tawny-port" },
];

/** Aggregate dashboard counters. Returns zeros if the DB is unreachable. */
async function getStats() {
  try {
    await connectDB();
    const [total, completed, actionAgg] = await Promise.all([
      Meeting.countDocuments(),
      Meeting.countDocuments({ status: "completed" }),
      Meeting.aggregate([
        { $group: { _id: null, n: { $sum: { $size: { $ifNull: ["$actionItems", []] } } } } },
      ]),
    ]);
    return { total, completed, actionItems: actionAgg[0]?.n ?? 0 };
  } catch {
    return { total: 0, completed: 0, actionItems: 0 };
  }
}

export default async function HomePage() {
  const stats = await getStats();

  const cards = [
    { label: "Meetings", value: stats.total, icon: CalendarCheck, color: "text-skyway" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-ambernight" },
    { label: "Action items", value: stats.actionItems, icon: ListChecks, color: "text-rytmic-red" },
  ];

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-3 p-4">
            <div className="rounded-xl bg-ink/60 p-2 ring-1 ring-blue-coal/60">
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div>
              <div className="text-2xl font-semibold text-ambernight">{c.value}</div>
              <div className="text-xs text-skyway/70">{c.label}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="card p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PIPELINE.map((s, i) => (
            <div key={s.title} className="flex items-center gap-3">
              <div className="rounded-xl bg-ink/60 p-2 ring-1 ring-blue-coal/60">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-xs text-skyway/70">Step {i + 1}</div>
                <div className="text-sm text-ambernight">{s.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <UploadForm />
    </div>
  );
}
