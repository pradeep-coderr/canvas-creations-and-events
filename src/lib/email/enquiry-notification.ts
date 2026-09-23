import "server-only";
import { site } from "@/data/site";
import { formatDateTime, formatEventDate } from "@/lib/datetime";
import type { Enquiry } from "@/lib/enquiry";

/*
 * Internal "new enquiry" notification for the business. Operational, not
 * promotional. Every submitted value is untrusted: HTML is escaped and the
 * subject is reduced to a single line.
 */

// Email clients can't use the site's CSS variables; these mirror the brand
// tokens in src/app/globals.css (charcoal, muted, rose-ink, ivory, gold).
const colour = {
  text: "#302a29",
  muted: "#756a67",
  accent: "#9b605a",
  surface: "#fbf5ec",
  rule: "#e8dccb",
};
const fontSerif = "Georgia, 'Times New Roman', serif";
const fontSans = "Arial, Helvetica, sans-serif";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Collapse newlines and control characters (for the subject line). */
function singleLine(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
}

export interface EnquiryNotificationInput {
  id: string;
  enquiry: Enquiry;
  receivedAt: Date;
}

export function buildEnquiryNotification({ id, enquiry, receivedAt }: EnquiryNotificationInput) {
  const received = formatDateTime(receivedAt);
  const rows: [label: string, text: string, href?: string][] = [
    ["Name", enquiry.name],
    ["Email", enquiry.email, `mailto:${enquiry.email}`],
  ];
  if (enquiry.phone) rows.push(["Phone", enquiry.phone, `tel:${enquiry.phone.replace(/[^\d+]/g, "")}`]);
  if (enquiry.eventType) rows.push(["Event type", enquiry.eventType]);
  if (enquiry.eventDate) rows.push(["Event date", formatEventDate(enquiry.eventDate)]);
  if (enquiry.venue) rows.push(["Venue", enquiry.venue]);

  const subject = `New enquiry from ${singleLine(enquiry.name)}`;

  const text = [
    site.name,
    "New enquiry",
    "",
    `Enquiry reference: ${id}`,
    `Received: ${received} (Adelaide time)`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    enquiry.message,
    "",
    "Reply to this email to respond to the enquirer directly.",
  ].join("\n");

  const detailRows = rows
    .map(([label, value, href]) => {
      const safe = escapeHtml(value);
      const content = href
        ? `<a href="${escapeHtml(href)}" style="color:${colour.accent};">${safe}</a>`
        : safe;
      return `<tr>
            <th scope="row" align="left" valign="top" style="padding:10px 16px 10px 0;border-top:1px solid ${colour.rule};font:600 13px/1.5 ${fontSans};color:${colour.muted};white-space:nowrap;">${escapeHtml(label)}</th>
            <td valign="top" style="padding:10px 0;border-top:1px solid ${colour.rule};font:15px/1.5 ${fontSans};color:${colour.text};word-break:break-word;">${content}</td>
          </tr>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:${colour.surface};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colour.surface};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;">
            <tr>
              <td style="padding:32px 32px 8px;">
                <p style="margin:0;font:600 12px/1.4 ${fontSans};letter-spacing:2px;text-transform:uppercase;color:${colour.accent};">${escapeHtml(site.name)}</p>
                <h1 style="margin:12px 0 0;font:500 30px/1.2 ${fontSerif};color:${colour.text};">New enquiry</h1>
                <p style="margin:12px 0 0;font:14px/1.6 ${fontSans};color:${colour.muted};">
                  Reference: <span style="font-family:monospace;color:${colour.text};">${escapeHtml(id)}</span><br>
                  Received: ${escapeHtml(received)} (Adelaide time)
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 8px;">
                <h2 style="margin:0 0 8px;font:600 13px/1.4 ${fontSans};letter-spacing:1px;text-transform:uppercase;color:${colour.muted};">Details</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${detailRows}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 32px;">
                <h2 style="margin:0 0 8px;font:600 13px/1.4 ${fontSans};letter-spacing:1px;text-transform:uppercase;color:${colour.muted};">Message</h2>
                <blockquote style="margin:0;padding:12px 16px;border-left:3px solid ${colour.accent};background:${colour.surface};font:15px/1.6 ${fontSans};color:${colour.text};white-space:pre-wrap;word-break:break-word;">${escapeHtml(enquiry.message)}</blockquote>
                <p style="margin:24px 0 0;font:13px/1.6 ${fontSans};color:${colour.muted};">Reply to this email to respond to the enquirer directly.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
