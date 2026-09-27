import "server-only";

/**
 * Server-only email configuration — the single place that reads the email
 * environment variables. Never throws: missing values mean "email not
 * configured", and enquiries are still stored without a notification.
 *
 *   RESEND_API_KEY              Resend API key (server-only; never NEXT_PUBLIC_)
 *   RESEND_FROM_EMAIL           Sender, e.g. "Canvas Creations <enquiries@your-verified-domain>"
 *                               Must be valid for the Resend account/domain.
 *   ENQUIRY_NOTIFICATION_EMAIL  Recipient(s) for new-enquiry notifications,
 *                               comma-separated
 */
export interface EmailConfig {
  apiKey: string;
  from: string;
  to: string[];
}

export function getEmailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const to = (process.env.ENQUIRY_NOTIFICATION_EMAIL ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  if (!apiKey || !from || to.length === 0) return null;
  return { apiKey, from, to };
}

export interface EmailStatus {
  configured: boolean;
  /** The From address (not a secret). */
  sender: string | null;
  /** Recipients, masked (e.g. "ow•••@example.com"). */
  recipients: string[];
  /** Names of the variables that are missing. */
  missing: string[];
}

/** For Admin → Settings: what's set up, without revealing the API key or full addresses. */
export function getEmailStatus(): EmailStatus {
  const env = {
    RESEND_API_KEY: process.env.RESEND_API_KEY?.trim(),
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL?.trim(),
    ENQUIRY_NOTIFICATION_EMAIL: process.env.ENQUIRY_NOTIFICATION_EMAIL?.trim(),
  };
  const mask = (address: string) => {
    const [local, domain] = address.split("@");
    return domain ? `${local.slice(0, 2)}•••@${domain}` : "•••";
  };
  return {
    configured: getEmailConfig() !== null,
    sender: env.RESEND_FROM_EMAIL || null,
    recipients: (env.ENQUIRY_NOTIFICATION_EMAIL ?? "").split(",").map((a) => a.trim()).filter(Boolean).map(mask),
    missing: Object.entries(env)
      .filter(([, value]) => !value)
      .map(([name]) => name),
  };
}
