"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";
import { notifyChat } from "@/lib/push/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  CHAT_CHOICES,
  PLAN_STEPS,
  chatContactSchema,
  chatMessageSchema,
  chatTokenSchema,
  type ChatActionResult,
  type ChatSnapshot,
} from "./bot";
import { quoteDetailsSchema, quoteDetailsText } from "./quote";
import { buildVisitorMeta } from "@/lib/visitor/server";

/*
 * The visitor side of the website chat (server actions). Every call carries
 * the browser's chat token; the database finds the visitor's own chat by its
 * hash (chat_* functions), so nothing here can reach another visitor's chat.
 * Messages are never logged; logs carry the chat id only.
 */

const UNAVAILABLE = "The chat isn't available right now. Please use the enquiry form or call us.";
const FAILED = "That didn't send. Please try again in a moment.";
const RATE_LIMITED = "You're sending messages quickly. Please wait a minute and try again.";

const afterSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);

function failure(error: { code?: string; hint?: string | null; message?: string }, where: string): ChatActionResult {
  if (error.hint === "rate_limited") {
    console.warn(`[chat] ${where}: rate limited`);
    return { ok: false, error: RATE_LIMITED };
  }
  console.error(`[chat] ${where} failed`, { code: error.code });
  return { ok: false, error: FAILED };
}

/**
 * The visitor's connection for the database's per-visitor limits, with the
 * server key that proves it came from this website (CHAT_SERVER_KEY).
 */
async function client() {
  const key = process.env.CHAT_SERVER_KEY;
  if (!key) return { p_client: null, p_key: null };
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  return { p_client: ip, p_key: key };
}

async function snapshot(token: string, afterId: number, seen = true): Promise<ChatSnapshot | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("chat_fetch", { p_token: token, p_after: afterId, p_seen: seen });
  if (error) {
    console.error("[chat] fetch failed", { code: error.code });
    return null;
  }
  return data as ChatSnapshot;
}

/**
 * New messages after `afterId` (0 = the whole chat). `seen` = the chat window
 * is open, so the team's replies count as read; a peek from the minimised
 * chat doesn't mark them.
 */
export async function fetchChat(token: unknown, afterId: unknown = 0, seen: unknown = true): Promise<ChatActionResult> {
  const t = chatTokenSchema.safeParse(token);
  const a = afterSchema.safeParse(afterId);
  if (!t.success || !a.success) return { ok: false, error: FAILED };
  if (!isSupabaseConfigured()) return { ok: false, error: UNAVAILABLE };
  const chat = await snapshot(t.data, a.data, seen !== false);
  return chat ? { ok: true, chat } : { ok: false, error: FAILED };
}

/** A typed message or a menu choice; returns the messages after `afterId`. */
export async function sendChatMessage(
  token: unknown,
  body: unknown,
  choice: unknown,
  afterId: unknown,
  /** "Plan my event": the question this message answers. */
  planStep: unknown = null,
  /** Visitor info from the browser, sent with the chat's first message (lib/visitor). */
  signals: unknown = null,
): Promise<ChatActionResult> {
  const t = chatTokenSchema.safeParse(token);
  const b = chatMessageSchema.safeParse(body);
  const c = z.enum(CHAT_CHOICES).nullable().safeParse(choice ?? null);
  const a = afterSchema.safeParse(afterId);
  const s = z.enum(PLAN_STEPS).nullable().safeParse(planStep ?? null);
  if (!t.success || !b.success || !c.success || !a.success || !s.success) return { ok: false, error: "That message couldn't be sent." };
  if (!isSupabaseConfigured()) return { ok: false, error: UNAVAILABLE };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("chat_send", {
    p_token: t.data,
    p_body: b.data,
    p_choice: c.data,
    p_plan_step: s.data,
    ...(await client()),
    // Kept only when this message starts the chat.
    p_meta: signals ? await buildVisitorMeta(signals) : null,
  });
  if (error) return failure(error, "send");
  const sent = data as { conversationId: string; alert: boolean; name: string | null };
  if (sent.alert) {
    after(() => notifyChat({ conversationId: sent.conversationId, name: sent.name, kind: "message" }));
  }
  // Saved either way: a failed refresh mustn't make the visitor send it twice.
  return { ok: true, chat: await snapshot(t.data, a.data) };
}

/** Name and how to reach them: hands the chat to the team (push alert). */
export async function shareChatContact(token: unknown, values: unknown, afterId: unknown): Promise<ChatActionResult> {
  const t = chatTokenSchema.safeParse(token);
  const v = chatContactSchema.safeParse(values);
  const a = afterSchema.safeParse(afterId);
  if (!t.success || !a.success) return { ok: false, error: FAILED };
  if (!v.success) return { ok: false, error: v.error.issues[0]?.message ?? "Check your details and try again." };
  if (!isSupabaseConfigured()) return { ok: false, error: UNAVAILABLE };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("chat_share_contact", {
    p_token: t.data,
    p_name: v.data.name,
    p_contact: v.data.contact,
    p_event_date: v.data.eventDate || null,
    ...(await client()),
  });
  if (error) return failure(error, "share contact");
  const shared = data as { conversationId: string; first: boolean; alert: boolean };
  console.info("[chat] handed to the team", { conversationId: shared.conversationId });
  // The database decides: the first time, then at most every 10 minutes.
  if (shared.alert) {
    after(() =>
      notifyChat({ conversationId: shared.conversationId, name: v.data.name, kind: shared.first ? "new" : "message" }),
    );
  }
  return { ok: true, chat: await snapshot(t.data, a.data) };
}

/** The quote form, filled in: the answers go to the team (with an alert). */
export async function submitQuoteDetails(token: unknown, details: unknown, afterId: unknown): Promise<ChatActionResult> {
  const t = chatTokenSchema.safeParse(token);
  const d = quoteDetailsSchema.safeParse(details);
  const a = afterSchema.safeParse(afterId);
  if (!t.success || !a.success) return { ok: false, error: FAILED };
  if (!d.success) return { ok: false, error: d.error.issues[0]?.message ?? "Check the details and try again." };
  if (!isSupabaseConfigured()) return { ok: false, error: UNAVAILABLE };

  // Only the answers given (empty fields are left out).
  const answers = Object.fromEntries(Object.entries(d.data).filter(([, v]) => v));
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("chat_quote_details", {
    p_token: t.data,
    p_body: quoteDetailsText(answers),
    p_details: answers,
  });
  if (error) return failure(error, "quote details");
  const sent = data as { conversationId: string; alert: boolean; name: string | null };
  if (sent.alert) after(() => notifyChat({ conversationId: sent.conversationId, name: sent.name, kind: "details" }));
  return { ok: true, chat: await snapshot(t.data, a.data) };
}

/** "Accept quote": the latest quote only; the team always gets an alert. */
export async function acceptQuote(token: unknown, quoteId: unknown, afterId: unknown): Promise<ChatActionResult> {
  const t = chatTokenSchema.safeParse(token);
  const q = z.number().int().positive().safeParse(quoteId);
  const a = afterSchema.safeParse(afterId);
  if (!t.success || !q.success || !a.success) return { ok: false, error: FAILED };
  if (!isSupabaseConfigured()) return { ok: false, error: UNAVAILABLE };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("chat_quote_accept", { p_token: t.data, p_quote_id: q.data });
  if (error?.hint === "quote_replaced") return { ok: false, error: "That quote was replaced by a newer one. Please check the latest quote." };
  if (error) return failure(error, "accept quote");
  const accepted = data as { conversationId: string; alert: boolean; name: string | null };
  if (accepted.alert) after(() => notifyChat({ conversationId: accepted.conversationId, name: accepted.name, kind: "accepted" }));
  return { ok: true, chat: await snapshot(t.data, a.data) };
}
