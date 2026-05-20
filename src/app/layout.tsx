import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Meeting Automation",
    template: "%s · AI Meeting Automation",
  },
  description:
    "Upload a meeting recording and get a transcript, summary, action items, and an auto-drafted follow-up email.",
  applicationName: "AI Meeting Automation",
  keywords: ["meeting notes", "AI transcription", "action items", "Whisper", "summary"],
  openGraph: {
    title: "AI Meeting Automation",
    description:
      "Transcribe, summarize and extract action items from any meeting recording.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B2028",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-6xl px-6 py-8">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <div className="pantone-strip mb-3 max-w-md" />
              <h1 className="text-2xl font-semibold text-ambernight">AI Meeting Automation</h1>
              <p className="text-sm text-skyway/80">
                Transcribe · Summarize · Extract action items · Send follow-up
              </p>
            </div>
            <nav className="flex items-center gap-2">
              <a href="/" className="btn-ghost">New meeting</a>
              <a href="/meetings" className="btn-ghost">History</a>
            </nav>
          </header>
          <main>{children}</main>
          <footer className="mt-16 text-xs text-skyway/50">
            Built with Next.js · Groq Whisper · OpenAI · MongoDB · Resend
          </footer>
        </div>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
