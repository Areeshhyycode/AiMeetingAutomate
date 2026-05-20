import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="card flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <SearchX className="h-10 w-10 text-tawny-port" />
      <div>
        <h2 className="text-xl font-semibold text-ambernight">Page not found</h2>
        <p className="mt-1 text-sm text-skyway/80">
          The meeting or page you’re looking for doesn’t exist.
        </p>
      </div>
      <Link href="/" className="btn-primary">
        Back to dashboard
      </Link>
    </div>
  );
}
