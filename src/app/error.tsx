"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error in the console for debugging.
    console.error(error);
  }, [error]);

  return (
    <div className="card flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <AlertTriangle className="h-10 w-10 text-syrah" />
      <div>
        <h2 className="text-xl font-semibold text-ambernight">Something went wrong</h2>
        <p className="mt-1 max-w-md text-sm text-skyway/80">
          {error.message || "An unexpected error occurred while rendering this page."}
        </p>
      </div>
      <button onClick={() => reset()} className="btn-primary">
        <RotateCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
