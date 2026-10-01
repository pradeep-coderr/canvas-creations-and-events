import "server-only";
import { Resend } from "resend";
import { site } from "@/data/site";
import { formatDateTime } from "@/lib/datetime";
import type { Review } from "@/lib/review";
import { getEmailConfig } from "./config";

/*
 * "New review" email to the business (same Resend settings as enquiries).
 * Best effort: never throws, never affects the stored review. Every
 * submitted value is untrusted: HTML is escaped, the subject is one line.
 * Logs carry the review id only.
 */

const colour = { text: "#302a29", muted: "#756a67", accent: "#9b605a", surface: "#fbf5ec", rule: "#e8dccb" };
const fontSerif = "Georgia, 'Times New Roman', serif";
const fontSans = "Arial, Helvetica, sans-serif";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
const singleLine = (value: string) => value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
export const starsText = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);

export function buildReviewNotification(id: string, review: Review, receivedAt: Date, adminUrl: string) {
  const kind = review.canPublish ? "review" : "private feedback";
  const subject = `New ${kind} from ${singleLine(review.name)} (${review.rating}/5)`;
  const rows: [string, string][] = [
    ["Rating", `${starsText(review.rating)} (${review.rating} of 5)`],
    ["Name", review.name],
    ...(review.email ? [["Email", review.email] as [string, string]] : []),
    ...(review.eventType ? [["Event", review.eventType] as [string, string]] : []),
    ["On the website?", review.canPublish ? "Allowed — waiting for your approval" : "No — private feedback for the team"],
  ];
  const received = formatDateTime(receivedAt);
  const text = [
    site.name,
    `New ${kind}`,
    "",
    `Received: ${received} (Adelaide time)`,
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    review.message,
    "",
    review.canPublish ? `Approve or hide it: ${adminUrl}` : `See it in the admin: ${adminUrl}`,
  ].join("\n");
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${colour.surface};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colour.surface};"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;">
<tr><td style="padding:32px 32px 8px;">
<p style="margin:0;font:600 12px/1.4 ${fontSans};letter-spacing:2px;text-transform:uppercase;color:${colour.accent};">${escapeHtml(site.name)}</p>
<h1 style="margin:12px 0 0;font:500 30px/1.2 ${fontSerif};color:${colour.text};">New ${escapeHtml(kind)}</h1>
<p style="margin:12px 0 0;font:14px/1.6 ${fontSans};color:${colour.muted};">Received: ${escapeHtml(received)} (Adelaide time)</p>
</td></tr>
<tr><td style="padding:16px 32px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows
    .map(
      ([label, value]) =>
        `<tr><th scope="row" align="left" valign="top" style="padding:10px 16px 10px 0;border-top:1px solid ${colour.rule};font:600 13px/1.5 ${fontSans};color:${colour.muted};white-space:nowrap;">${escapeHtml(label)}</th><td valign="top" style="padding:10px 0;border-top:1px solid ${colour.rule};font:15px/1.5 ${fontSans};color:${colour.text};word-break:break-word;">${escapeHtml(value)}</td></tr>`,
    )
    .join("")}</table></td></tr>
<tr><td style="padding:16px 32px 32px;">
<blockquote style="margin:0;padding:12px 16px;border-left:3px solid ${colour.accent};background:${colour.surface};font:15px/1.6 ${fontSans};color:${colour.text};white-space:pre-wrap;word-break:break-word;">${escapeHtml(review.message)}</blockquote>
<p style="margin:24px 0 0;font:14px/1.6 ${fontSans};"><a href="${escapeHtml(adminUrl)}" style="color:${colour.accent};">${review.canPublish ? "Approve or hide it in the admin" : "See it in the admin"}</a></p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}

export async function sendReviewNotification(id: string, review: Review) {
  const config = getEmailConfig();
  if (!config) {
    console.info(`[review] email skipped ${id} (email not configured)`);
    return;
  }
  const { absoluteUrl } = await import("@/lib/site-url");
  const built = buildReviewNotification(id, review, new Date(), absoluteUrl("/admin/reviews"));
  try {
    const { error } = await new Resend(config.apiKey).emails.send(
      {
        from: config.from,
        to: config.to,
        ...(review.email ? { replyTo: review.email } : {}),
        subject: built.subject,
        html: built.html,
        text: built.text,
      },
      { idempotencyKey: `review-notification/${id}` },
    );
    if (error) console.error(`[review] email failed ${id}`, { code: error.name, message: error.message });
    else console.info(`[review] email sent ${id}`);
  } catch (error) {
    console.error(`[review] email failed ${id}`, { message: error instanceof Error ? error.message : String(error) });
  }
}
