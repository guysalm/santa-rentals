import "server-only";
import { Resend } from "resend";
import { env } from "../env";

export interface Email {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: string | Buffer; contentType?: string }[];
}

let client: Resend | null = null;

/**
 * Sends via Resend. Without RESEND_API_KEY (local dev) emails are logged instead.
 * Never throws: an email failure must not roll back a paid booking.
 */
export async function sendEmail(email: Email): Promise<boolean> {
  const to = (Array.isArray(email.to) ? email.to : [email.to]).filter(Boolean);
  if (!to.length) return false;
  if (!env.resendApiKey) {
    console.info(`[email:dev] to=${to.join(",")} subject="${email.subject}" attachments=${email.attachments?.length ?? 0}`);
    return true;
  }
  try {
    client ??= new Resend(env.resendApiKey);
    const { error } = await client.emails.send({
      from: env.emailFrom,
      to,
      subject: email.subject,
      html: email.html,
      replyTo: email.replyTo,
      attachments: email.attachments,
    });
    if (error) {
      console.error("[email] send failed", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send threw", err);
    return false;
  }
}
