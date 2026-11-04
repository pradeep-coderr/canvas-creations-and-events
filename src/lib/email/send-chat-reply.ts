import "server-only";
import { Resend } from "resend";
import { site } from "@/data/site";
import { absoluteUrl } from "@/lib/site-url";
import { getEmailConfig } from "./config";
import { escapeHtml } from "./html";

/*
 * "You have a reply" email to a chat visitor who left their email address
 * and isn't on the site any more (Admin → Chats decides when). Same Resend
 * settings as the enquiry emails; replies to it go to the business inbox.
 * Best effort: never throws. Logs carry the chat id only.
 */

const colour = { text: "#302a29", muted: "#756a67", accent: "#9b605a", surface: "#fbf5ec" };
const fontSerif = "Georgia, 'Times New Roman', serif";
const fontSans = "Arial, Helvetica, sans-serif";

export function buildChatReplyEmail(input: { name: string | null; reply: string }, siteUrl: string) {
  const first = input.name?.trim().split(/\s+/)[0];
  const subject = `A reply from ${site.name}`;
  const greeting = first ? `Hi ${first},` : "Hi,";
  const text = [
    greeting,
    "",
    `The team at ${site.name} replied to your chat:`,
    "",
    input.reply,
    "",
    `Reply to this email, or continue the chat on our website: ${siteUrl}`,
    "(Open it in the same browser you chatted from to see the whole conversation.)",
  ].join("\n");
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${colour.surface};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colour.surface};"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;">
<tr><td style="padding:32px 32px 8px;">
<p style="margin:0;font:600 12px/1.4 ${fontSans};letter-spacing:2px;text-transform:uppercase;color:${colour.accent};">${escapeHtml(site.name)}</p>
<h1 style="margin:12px 0 0;font:500 28px/1.2 ${fontSerif};color:${colour.text};">You have a reply</h1>
<p style="margin:16px 0 0;font:15px/1.6 ${fontSans};color:${colour.text};">${escapeHtml(greeting)} the team replied to your chat:</p>
</td></tr>
<tr><td style="padding:12px 32px 8px;">
<blockquote style="margin:0;padding:12px 16px;border-left:3px solid ${colour.accent};background:${colour.surface};font:15px/1.6 ${fontSans};color:${colour.text};white-space:pre-wrap;word-break:break-word;">${escapeHtml(input.reply)}</blockquote>
</td></tr>
<tr><td style="padding:16px 32px 32px;">
<p style="margin:0;font:14px/1.6 ${fontSans};color:${colour.muted};">Reply to this email, or <a href="${escapeHtml(siteUrl)}" style="color:${colour.accent};">continue the chat on our website</a> (in the same browser you chatted from).</p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}

/** Sends the "You have a reply" email; true when it went. */
export async function sendChatReplyEmail(conversationId: string, input: { to: string; name: string | null; reply: string }): Promise<boolean> {
  const config = getEmailConfig();
  if (!config) {
    console.info(`[chat] reply email skipped ${conversationId} (email not configured)`);
    return false;
  }
  const built = buildChatReplyEmail(input, absoluteUrl("/"));
  try {
    const { error } = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to: [input.to],
      replyTo: config.to[0],
      subject: built.subject,
      html: built.html,
      text: built.text,
    });
    if (error) {
      console.error(`[chat] reply email failed ${conversationId}`, { code: error.name, message: error.message });
      return false;
    }
    console.info(`[chat] reply email sent ${conversationId}`);
    return true;
  } catch (error) {
    console.error(`[chat] reply email failed ${conversationId}`, { message: error instanceof Error ? error.message : String(error) });
    return false;
  }
}
