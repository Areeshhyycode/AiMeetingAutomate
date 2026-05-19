import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM ?? "AI Meeting <onboarding@resend.dev>";

export async function sendFollowUp(args: {
  to: string[];
  subject: string;
  body: string;
}): Promise<{ id: string | null; skipped: boolean }> {
  if (!resend) {
    return { id: null, skipped: true };
  }
  if (args.to.length === 0) {
    return { id: null, skipped: true };
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: args.to,
    subject: args.subject,
    text: args.body,
  });

  if (error) throw new Error(error.message);
  return { id: data?.id ?? null, skipped: false };
}
