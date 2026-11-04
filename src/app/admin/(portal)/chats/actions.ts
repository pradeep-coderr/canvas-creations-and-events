"use server";

import { after } from "next/server";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { chatMessageSchema, isEmail } from "@/lib/chat/bot";
import { QUOTE_FORM_TEXT, asQuote, asQuoteDetails, money, quoteInputSchema, quoteText, quoteTotal, type QuoteData } from "@/lib/chat/quote";
import { sendChatReplyEmail } from "@/lib/email/send-chat-reply";
import { CMS_CONTENT_TAG } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

/*
 * The team's side of the website chat. Every action re-checks the admin and
 * writes with the signed-in session, so the database's own rules (RLS) apply
 * too: admins can only add messages as "team", and only change a chat's
 * status and read state. Messages are never logged.
 */

export type ChatAdminResult = { ok: true } | { ok: false; error: string };

const id = z.uuid();
/** "You have a reply" emails: only when the visitor isn't on the site, at most every 15 minutes. */
const AWAY_MS = 2 * 60 * 1000;
const EMAIL_GAP_MS = 15 * 60 * 1000;

/**
 * Adds a team message (a reply, a quote form or a quote) and, if the visitor
 * has left the site and gave an email, emails it to them: at most one email
 * every 15 minutes, except quotes and quote forms, which always go.
 */
async function postTeamMessage(
  conversationId: string,
  message: { body: string; kind?: "quote_form" | "quote"; data?: QuoteData },
): Promise<ChatAdminResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("chat_messages")
    .insert({ conversation_id: conversationId, sender: "team", body: message.body, kind: message.kind ?? null, data: message.data ?? null });
  if (error) {
    console.error("[chat] reply failed", { conversationId, kind: message.kind ?? "reply", code: error.code });
    return { ok: false, error: "That couldn't be sent. Try again." };
  }

  const { data: chat } = await supabase
    .from("chat_conversations")
    .select("name, contact, visitor_seen_at, last_email_at")
    .eq("id", conversationId)
    .maybeSingle();
  const now = Date.now();
  const away = !chat?.visitor_seen_at || now - new Date(chat.visitor_seen_at).getTime() > AWAY_MS;
  if (chat && isEmail(chat.contact) && away) {
    // Claim the email slot in one step, so two quick replies (or two admins)
    // can't both send one inside 15 minutes.
    const claimedAt = new Date(now).toISOString();
    const cutoff = new Date(message.kind ? now + 1000 : now - EMAIL_GAP_MS).toISOString();
    const { data: claimed } = await supabase
      .from("chat_conversations")
      .update({ last_email_at: claimedAt })
      .eq("id", conversationId)
      .or(`last_email_at.is.null,last_email_at.lt.${cutoff}`)
      .select("id");
    if (claimed?.length) {
      const to = chat.contact as string;
      const reply = message.body;
      const previous = chat.last_email_at;
      after(async () => {
        if (await sendChatReplyEmail(conversationId, { to, name: chat.name, reply })) return;
        // It didn't go: don't show "Sent by email", and let the next reply try.
        await supabase.from("chat_conversations").update({ last_email_at: previous }).eq("id", conversationId).eq("last_email_at", claimedAt);
      });
    }
  }
  revalidatePath("/admin/chats");
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function replyToChat(conversationId: unknown, body: unknown): Promise<ChatAdminResult> {
  await requireAdmin();
  const c = id.safeParse(conversationId);
  const b = chatMessageSchema.safeParse(body);
  if (!c.success) return { ok: false, error: "That chat wasn't found." };
  if (!b.success) return { ok: false, error: b.error.issues[0]?.message ?? "Type a reply." };
  const result = await postTeamMessage(c.data, { body: b.data });
  return result.ok ? result : { ok: false, error: "The reply couldn't be sent. Try again." };
}

/** "Send quote form": the visitor fills in their event details inside the chat. */
export async function sendQuoteForm(conversationId: unknown): Promise<ChatAdminResult> {
  await requireAdmin();
  const c = id.safeParse(conversationId);
  if (!c.success) return { ok: false, error: "That chat wasn't found." };
  return postTeamMessage(c.data, { body: QUOTE_FORM_TEXT, kind: "quote_form" });
}

/** "Send quote": items, total and deposit as a card the visitor can accept. */
export async function sendQuote(conversationId: unknown, input: unknown): Promise<ChatAdminResult> {
  await requireAdmin();
  const c = id.safeParse(conversationId);
  const q = quoteInputSchema.safeParse(input);
  if (!c.success) return { ok: false, error: "That chat wasn't found." };
  if (!q.success) return { ok: false, error: q.error.issues[0]?.message ?? "Check the quote." };
  const data: QuoteData = { items: q.data.items, total: quoteTotal(q.data.items), deposit: q.data.deposit, note: q.data.note };
  const result = await postTeamMessage(c.data, { body: quoteText(data), kind: "quote", data });
  if (result.ok) console.info("[chat] quote sent", { conversationId: c.data, items: data.items.length });
  return result;
}

export async function setChatStatus(conversationId: unknown, status: unknown): Promise<ChatAdminResult> {
  await requireAdmin();
  const c = id.safeParse(conversationId);
  const s = z.enum(["open", "closed"]).safeParse(status);
  if (!c.success || !s.success) return { ok: false, error: "That change wasn't valid." };
  const supabase = await createClient();
  const { error } = await supabase.from("chat_conversations").update({ status: s.data }).eq("id", c.data);
  if (error) {
    console.error("[chat] status change failed", { conversationId: c.data, code: error.code });
    return { ok: false, error: "The chat couldn't be updated. Try again." };
  }
  revalidatePath("/admin/chats");
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/**
 * Opened (read = true) or "Mark unread". `upTo`: the newest message on the
 * admin's screen; a message that arrived after it keeps the chat unread.
 */
export async function setChatRead(conversationId: unknown, read: unknown, upTo?: unknown): Promise<ChatAdminResult> {
  await requireAdmin();
  const c = id.safeParse(conversationId);
  const r = z.boolean().safeParse(read);
  const u = z.iso.datetime({ offset: true }).optional().safeParse(upTo ?? undefined);
  if (!c.success || !r.success || !u.success) return { ok: false, error: "That change wasn't valid." };
  const supabase = await createClient();
  let query = supabase
    .from("chat_conversations")
    .update(r.data ? { admin_unread: 0, admin_read_at: new Date().toISOString() } : { admin_unread: 1 })
    .eq("id", c.data);
  if (r.data && u.data) query = query.lte("last_message_at", u.data);
  const { error } = await query;
  if (error) {
    console.error("[chat] read state failed", { conversationId: c.data, code: error.code });
    return { ok: false, error: "The chat couldn't be updated." };
  }
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Remove a chat and all its messages (spam, tests, or the visitor asked). */
export async function deleteChat(conversationId: unknown): Promise<ChatAdminResult> {
  await requireAdmin();
  const c = id.safeParse(conversationId);
  if (!c.success) return { ok: false, error: "That chat wasn't found." };
  const supabase = await createClient();
  const { data, error } = await supabase.from("chat_conversations").delete().eq("id", c.data).select("id");
  if (error || !data?.length) {
    console.error("[chat] delete failed", { conversationId: c.data, code: error?.code });
    return { ok: false, error: "The chat couldn't be deleted. Try again." };
  }
  console.info("[chat] deleted", { conversationId: c.data });
  revalidatePath("/admin/chats");
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Online / Away: what visitors see in the chat header. */
export async function setChatAway(away: unknown): Promise<ChatAdminResult> {
  await requireAdmin();
  const a = z.boolean().safeParse(away);
  if (!a.success) return { ok: false, error: "That change wasn't valid." };
  const supabase = await createClient();
  const { data, error } = await supabase.from("chat_settings").update({ away: a.data }).eq("id", true).select("away");
  if (error || !data?.length) {
    console.error("[chat] status change failed", { code: error?.code });
    return { ok: false, error: "The status couldn't be changed. Try again." };
  }
  // The website shows the status from its cached content: refresh it now.
  updateTag(CMS_CONTENT_TAG);
  revalidatePath("/admin/chats");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Quick replies
// ---------------------------------------------------------------------------

const quickReplyInput = z.object({
  id: z.uuid().optional(),
  label: z.string().trim().min(1, "Give it a short name.").max(40, "Keep the name under 40 characters.").regex(/^[^\r\n]*$/),
  body: z.string().trim().min(1, "Write the reply.").max(1000, "Keep it under 1000 characters."),
});

export async function saveQuickReply(input: unknown): Promise<ChatAdminResult> {
  await requireAdmin();
  const parsed = quickReplyInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the reply." };
  const { id: replyId, label, body } = parsed.data;
  const supabase = await createClient();
  let error;
  if (replyId) {
    const { data, error: updateError } = await supabase.from("chat_quick_replies").update({ label, body }).eq("id", replyId).select("id");
    error = updateError;
    if (!error && !data?.length) return { ok: false, error: "That quick reply was deleted. Add it again." };
  } else {
    const { data: last } = await supabase.from("chat_quick_replies").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    ({ error } = await supabase.from("chat_quick_replies").insert({ label, body, sort_order: (last?.sort_order ?? 0) + 1 }));
  }
  if (error) {
    console.error("[chat] quick reply save failed", { code: error.code });
    return { ok: false, error: "The quick reply couldn't be saved. Try again." };
  }
  revalidatePath("/admin/chats");
  return { ok: true };
}

export async function deleteQuickReply(replyId: unknown): Promise<ChatAdminResult> {
  await requireAdmin();
  const r = id.safeParse(replyId);
  if (!r.success) return { ok: false, error: "That reply wasn't found." };
  const supabase = await createClient();
  const { error } = await supabase.from("chat_quick_replies").delete().eq("id", r.data);
  if (error) {
    console.error("[chat] quick reply delete failed", { code: error.code });
    return { ok: false, error: "The quick reply couldn't be deleted." };
  }
  revalidatePath("/admin/chats");
  return { ok: true };
}

/** Move a quick reply one place up or down the list. */
export async function moveQuickReply(replyId: unknown, direction: unknown): Promise<ChatAdminResult> {
  await requireAdmin();
  const r = id.safeParse(replyId);
  const d = z.enum(["up", "down"]).safeParse(direction);
  if (!r.success || !d.success) return { ok: false, error: "That change wasn't valid." };
  const supabase = await createClient();
  const { data: rows } = await supabase.from("chat_quick_replies").select("id, sort_order").order("sort_order").order("created_at");
  const list = rows ?? [];
  const i = list.findIndex((x) => x.id === r.data);
  const j = d.data === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= list.length) return { ok: true };
  // Swap the two neighbours' positions (renumber only if two share a number).
  const [a, b] = [list[i], list[j]];
  const results =
    a.sort_order !== b.sort_order
      ? await Promise.all([
          supabase.from("chat_quick_replies").update({ sort_order: b.sort_order }).eq("id", a.id),
          supabase.from("chat_quick_replies").update({ sort_order: a.sort_order }).eq("id", b.id),
        ])
      : await Promise.all(
          list
            .map((x) => (x === a ? b : x === b ? a : x))
            .map((x, n) => supabase.from("chat_quick_replies").update({ sort_order: n + 1 }).eq("id", x.id)),
        );
  if (results.some((x) => x.error)) {
    console.error("[chat] quick reply reorder failed");
    return { ok: false, error: "The order couldn't be saved." };
  }
  revalidatePath("/admin/chats");
  return { ok: true };
}

/**
 * Turn the bot off (or back on) for one chat. Recorded in the chat as an
 * event, so earlier bot answers stay as they were; the visitor sees "Now
 * chatting with the team" when it's turned off.
 */
export async function setChatBot(conversationId: unknown, on: unknown): Promise<ChatAdminResult> {
  await requireAdmin();
  const c = id.safeParse(conversationId);
  const o = z.boolean().safeParse(on);
  if (!c.success || !o.success) return { ok: false, error: "That change wasn't valid." };
  const supabase = await createClient();
  const { error } = await supabase.from("chat_messages").insert({
    conversation_id: c.data,
    sender: "system",
    kind: o.data ? "bot_on" : "bot_off",
    body: o.data ? "Bot turned back on" : "Bot turned off",
  });
  if (error) {
    console.error("[chat] bot switch failed", { conversationId: c.data, code: error.code });
    return { ok: false, error: "The bot couldn't be switched. Try again." };
  }
  revalidatePath("/admin/chats");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Create an enquiry from a chat
// ---------------------------------------------------------------------------

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/** "Sun 14 March 2027", "14 Mar 2027" or "14/03/2027" → "2027-03-14"; anything else → null. */
function parseChatDate(text: string | null | undefined): string | null {
  if (!text) return null;
  const t = text.toLowerCase();
  let d: number, m: number, y: number;
  const named = t.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3,9})\s+(\d{4})/);
  const numeric = t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (named) {
    m = MONTHS.findIndex((name) => name.startsWith(named[2].slice(0, 3))) + 1;
    [d, y] = [Number(named[1]), Number(named[3])];
  } else if (numeric) {
    [d, m, y] = [Number(numeric[1]), Number(numeric[2]), Number(numeric[3])];
  } else return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (!m || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date.toISOString().slice(0, 10);
}

export type CreateEnquiryResult = { ok: true; enquiryId: string } | { ok: false; error: string };

/**
 * Turn a chat into an enquiry (Enquiries and the Calendar): name, email or
 * phone, occasion, date and venue from the chat and its "Plan my event"
 * answers; the rest of the plan and the visitor's own words go in the
 * message. A chat becomes at most one enquiry (pressing again opens it).
 */
/** The latest quote in a chat, for the enquiry: its items, total and whether it was accepted. */
function quoteLines(messages: { id: number; kind: string | null; data: unknown }[]) {
  const sent = [...messages].reverse().find((m) => m.kind === "quote");
  const quote = sent && asQuote(sent.data);
  if (!sent || !quote) return "";
  const accepted = messages.some((m) => m.kind === "quote_accept" && Number((m.data as { quoteId?: unknown } | null)?.quoteId) === sent.id);
  return [
    `\nQuote (${accepted ? "accepted in the chat" : "sent, not accepted yet"}):`,
    ...quote.items.map((i) => `${i.label}: ${money(i.amount)}`),
    `Total: ${money(quote.total)}`,
    quote.deposit !== null ? `Deposit: ${money(quote.deposit)}` : "",
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 800);
}

export async function createEnquiryFromChat(conversationId: unknown): Promise<CreateEnquiryResult> {
  await requireAdmin();
  const c = id.safeParse(conversationId);
  if (!c.success) return { ok: false, error: "That chat wasn't found." };
  const supabase = await createClient();

  const { data: existing } = await supabase.from("enquiries").select("id").eq("chat_id", c.data).maybeSingle();
  if (existing) return { ok: true, enquiryId: existing.id };

  const [{ data: chat }, { data: rows }] = await Promise.all([
    supabase.from("chat_conversations").select("name, contact, event_date, topic").eq("id", c.data).maybeSingle(),
    supabase.from("chat_messages").select("id, sender, body, plan_step, choice, kind, data").eq("conversation_id", c.data).order("id"),
  ]);
  if (!chat) return { ok: false, error: "That chat wasn't found." };
  if (!chat.name || !chat.contact) {
    return { ok: false, error: "Ask for their name and an email or phone number first (the chat doesn't have them yet)." };
  }

  const messages = rows ?? [];
  const plan = new Map<string, string>();
  for (const m of messages) {
    if (m.plan_step) plan.set(m.plan_step, m.body);
    // The quote form's answers are newer than (and replace) the plan's.
    if (m.kind === "quote_details") for (const [k, v] of Object.entries(asQuoteDetails(m.data))) plan.set(k, v);
  }
  const said = messages
    .filter((m) => m.sender === "visitor" && !m.plan_step && !m.choice && !m.kind)
    .map((m) => `- ${m.body.replace(/\s+/g, " ").trim().slice(0, 200)}`);
  const planLines = [
    ["Guests", plan.get("guests")],
    ["Colours / theme", plan.get("theme")],
    ["Budget", plan.get("budget")],
  ].filter(([, v]) => v) as [string, string][];
  const head = [
    "From a website chat.",
    planLines.length ? `\nEvent plan:\n${planLines.map(([k, v]) => `${k}: ${v}`).join("\n")}` : "",
    quoteLines(messages),
  ]
    .join("\n")
    .trim();
  const body = [
    head,
    said.length ? `\nThey wrote:\n${said.slice(-8).join("\n")}` : "",
  ]
    .join("\n")
    .trim();
  // At most 2000 characters (the enquiry limit): the plan stays whole, and
  // the oldest of their messages go first (the newest matter most).
  let message = body;
  for (let skip = 1; message.length > 2000 && skip <= said.length; skip++) {
    message = [head, `\nThey wrote:\n${said.slice(-8).slice(skip).join("\n")}`].join("\n").trim();
  }
  message = message.slice(0, 2000);

  const contact = chat.contact.trim();
  const occasion = plan.get("occasion") ?? (chat.topic && !["Plan my event", "Talk to the team"].includes(chat.topic) ? chat.topic : null);
  const venue = plan.get("venue");
  const { data: created, error } = await supabase
    .from("enquiries")
    .insert({
      name: chat.name.slice(0, 100),
      email: isEmail(contact) ? contact : null,
      phone: isEmail(contact) ? null : contact.slice(0, 30),
      event_type: occasion?.slice(0, 100) ?? null,
      // The contact form's date (or the plan's, merged by the database) first.
      event_date: parseChatDate(chat.event_date) ?? parseChatDate(plan.get("date")),
      venue: venue && venue !== "Not decided yet" ? venue.slice(0, 200) : null,
      message,
      source: "chat",
      chat_id: c.data,
    })
    .select("id")
    .single();
  if (error || !created) {
    // Made a moment ago (double tap): open that one.
    if (error?.code === "23505") {
      const { data: again } = await supabase.from("enquiries").select("id").eq("chat_id", c.data).maybeSingle();
      if (again) return { ok: true, enquiryId: again.id };
    }
    console.error("[chat] create enquiry failed", { conversationId: c.data, code: error?.code });
    return { ok: false, error: "The enquiry couldn't be created. Try again." };
  }
  console.info("[chat] enquiry created", { conversationId: c.data, enquiryId: created.id });
  revalidatePath("/admin");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/chats");
  return { ok: true, enquiryId: created.id };
}
