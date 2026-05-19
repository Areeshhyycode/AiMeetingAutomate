import { UploadForm } from "@/components/upload-form";
import { Mic, FileText, ListChecks, Mail } from "lucide-react";

const PIPELINE = [
  { icon: Mic, title: "Record / Upload", color: "text-ambernight" },
  { icon: FileText, title: "Transcribe", color: "text-skyway" },
  { icon: ListChecks, title: "Extract action items", color: "text-rytmic-red" },
  { icon: Mail, title: "Send follow-up", color: "text-tawny-port" },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
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
