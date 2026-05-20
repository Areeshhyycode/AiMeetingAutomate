"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteMeetingButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!window.confirm("Delete this meeting permanently? This cannot be undone.")) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/meetings/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      toast.success("Meeting deleted.");
      router.push("/meetings");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="btn-ghost border-syrah/50 text-syrah hover:border-syrah hover:text-syrah"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Delete
    </button>
  );
}
