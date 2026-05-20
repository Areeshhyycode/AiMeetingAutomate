import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Meeting } from "@/models/Meeting";
import { formatDuration } from "@/lib/utils";
import { SendEmailButton } from "@/components/send-email-button";
import { DeleteMeetingButton } from "@/components/delete-meeting-button";
import { ArrowLeft, CheckCircle2, AlertTriangle, ListChecks, FileText, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

function priorityClass(p: string) {
  if (p === "high") return "border-rytmic-red/60 text-rytmic-red";
  if (p === "low") return "border-skyway/40 text-skyway";
  return "border-toffee/60 text-ambernight";
}

export default async function MeetingDetail({ params }: { params: { id: string } }) {
  if (!mongoose.isValidObjectId(params.id)) notFound();
  await connectDB();
  const m = await Meeting.findById(params.id).lean();
  if (!m) notFound();

  const sent = m.followUpEmail?.sentAt;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/meetings" className="inline-flex items-center gap-1 text-xs text-skyway hover:text-ambernight">
          <ArrowLeft className="h-3 w-3" /> Back to history
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-ambernight">{m.title}</h2>
            <p className="text-xs text-skyway/70">
              {m.audioFileName} · {formatDuration(m.durationSeconds)} ·{" "}
              {new Date(m.createdAt as unknown as string).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge border-ambernight/40 text-ambernight">{m.status}</span>
            <DeleteMeetingButton id={params.id} />
          </div>
        </div>
      </div>

      {m.status === "failed" && (
        <div className="card border-syrah/60 bg-syrah/10 p-4 text-sm text-ambernight">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4 text-syrah" /> Processing failed
          </div>
          <p className="mt-1 text-skyway/80">{m.error}</p>
        </div>
      )}

      {m.summary && (
        <section className="card p-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ambernight">
            <FileText className="h-4 w-4 text-skyway" /> Summary
          </div>
          <p className="text-sm leading-relaxed text-ambernight/90">{m.summary}</p>
        </section>
      )}

      {m.keyDecisions && m.keyDecisions.length > 0 && (
        <section className="card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ambernight">
            <CheckCircle2 className="h-4 w-4 text-ambernight" /> Key decisions
          </div>
          <ul className="space-y-2 text-sm text-ambernight/90">
            {m.keyDecisions.map((d, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ambernight" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {m.actionItems && m.actionItems.length > 0 && (
        <section className="card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ambernight">
            <ListChecks className="h-4 w-4 text-rytmic-red" /> Action items
          </div>
          <div className="space-y-2">
            {m.actionItems.map((a, i) => (
              <div key={i} className="rounded-xl border border-blue-coal/60 bg-ink/40 p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-ambernight">{a.task}</div>
                  <span className={`badge ${priorityClass(a.priority ?? "medium")}`}>
                    {a.priority ?? "medium"}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-skyway/80">
                  {a.assignee && <span>👤 {a.assignee}</span>}
                  {a.deadline && <span>⏱ {a.deadline}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {m.risks && m.risks.length > 0 && (
        <section className="card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ambernight">
            <AlertTriangle className="h-4 w-4 text-tawny-port" /> Risks & blockers
          </div>
          <ul className="space-y-2 text-sm text-ambernight/90">
            {m.risks.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-tawny-port" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {m.followUpEmail?.body && (
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-ambernight">
              <Mail className="h-4 w-4 text-skyway" /> Follow-up email
            </div>
            {sent ? (
              <span className="badge border-ambernight/40 text-ambernight">
                sent {new Date(sent as unknown as string).toLocaleString()}
              </span>
            ) : (
              <SendEmailButton id={params.id} disabled={(m.followUpEmail.to?.length ?? 0) === 0} />
            )}
          </div>
          {m.followUpEmail.to && m.followUpEmail.to.length > 0 && (
            <div className="mb-2 text-xs text-skyway/80">
              To: {m.followUpEmail.to.join(", ")}
            </div>
          )}
          <div className="mb-2 text-sm font-medium text-ambernight">{m.followUpEmail.subject}</div>
          <pre className="whitespace-pre-wrap rounded-xl bg-ink/60 p-3 text-xs text-ambernight/90">
{m.followUpEmail.body}
          </pre>
        </section>
      )}

      {m.transcript && (
        <section className="card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ambernight">
            <FileText className="h-4 w-4 text-skyway" /> Transcript
          </div>
          {m.segments && m.segments.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {m.segments.map((s, i) => (
                <div key={i} className="text-sm">
                  {s.speaker && (
                    <span className="mr-2 font-medium text-rytmic-red">{s.speaker}:</span>
                  )}
                  <span className="text-ambernight/90">{s.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm text-ambernight/90 max-h-[400px] overflow-y-auto pr-2">
              {m.transcript}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
