import "server-only";
import { getSettings } from "./catalog";
import { env } from "./env";

/** Admin notification recipients: settings.adminEmails ∪ ADMIN_EMAILS env. */
export async function adminRecipients(): Promise<string[]> {
  const settings = await getSettings();
  return [...new Set([...settings.adminEmails, ...env.adminEmails])];
}
