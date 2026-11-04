import "server-only";
import { resolveMx } from "node:dns/promises";
import type { createClient } from "@/lib/supabase/server";
import { asVisitorMeta, assessVisitor, type VisitorView } from "./assess";
import { verifyVisitorMeta } from "./server";

/*
 * The admin's "Looks real / Check this / Likely spam" for chats and
 * enquiries: the stored visitor info, plus what only shows across rows
 * (repeats from one connection, the same text from someone else).
 */

type Supabase = Awaited<ReturnType<typeof createClient>>;
const DAYS_30 = 30 * 24 * 3600 * 1000;
/** Short texts ("hi", "thanks") repeat naturally: only longer ones count as copies. */
const normalise = (t: string) => t.toLowerCase().replace(/\s+/g, " ").trim();
const copyable = (t: string) => normalise(t).length >= 25;

export interface VisitorIndex {
  /** connection hash → the chats ("c:<id>") and enquiries ("e:<id>") from it, last 30 days */
  byIp: Map<string, Set<string>>;
  /** normalised text → who sent it, last 30 days */
  byText: Map<string, Set<string>>;
  /** chat id → what the visitor typed */
  chatTexts: Map<string, string[]>;
  /** email domain → it can receive mail (MX records); null = couldn't tell */
  domains: Map<string, boolean | null>;
}

// Email domains already checked (they rarely change): kept for a day per server instance.
const domainCache = new Map<string, { ok: boolean | null; at: number }>();
const DAY = 24 * 3600 * 1000;

async function domainReceivesMail(domain: string): Promise<boolean | null> {
  const cached = domainCache.get(domain);
  if (cached && Date.now() - cached.at < DAY) return cached.ok;
  let ok: boolean | null;
  try {
    const records = await Promise.race([
      resolveMx(domain),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
    ]);
    // A "null MX" (an empty mail server, RFC 7505) means the domain accepts no email.
    ok = records === null ? null : records.some((r) => r.exchange && r.exchange !== ".");
  } catch (error) {
    // "No such domain" / "no mail records" mean no; anything else (offline, timeout) means unknown.
    const code = (error as { code?: string }).code;
    ok = code === "ENOTFOUND" || code === "ENODATA" ? false : null;
  }
  if (ok !== null) domainCache.set(domain, { ok, at: Date.now() });
  return ok;
}

/** Check the email domains of the given contacts (in parallel, cached), for "can receive mail". */
export async function checkEmailDomains(index: VisitorIndex, contacts: (string | null | undefined)[]) {
  const domains = [...new Set(contacts.flatMap((c) => (c && c.includes("@") ? [c.split("@")[1].trim().toLowerCase()] : [])))].filter(
    (d) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d) && !index.domains.has(d),
  );
  const results = await Promise.all(domains.slice(0, 50).map(async (d) => [d, await domainReceivesMail(d)] as const));
  for (const [d, ok] of results) index.domains.set(d, ok);
}

/** One read of the last 30 days, shared by every row on the page. */
export async function loadVisitorIndex(supabase: Supabase): Promise<VisitorIndex> {
  const since = new Date(Date.now() - DAYS_30).toISOString();
  const [chats, enquiries, typed] = await Promise.all([
    supabase.from("chat_conversations").select("id, meta").gte("created_at", since).not("meta", "is", null).limit(2000),
    supabase.from("enquiries").select("id, meta, message").gte("created_at", since).limit(2000),
    supabase
      .from("chat_messages")
      .select("conversation_id, body")
      .eq("sender", "visitor")
      .is("choice", null)
      .is("plan_step", null)
      .is("kind", null)
      .gte("created_at", since)
      .limit(5000),
  ]);
  const byIp = new Map<string, Set<string>>();
  const byText = new Map<string, Set<string>>();
  const chatTexts = new Map<string, string[]>();
  const add = <K>(map: Map<K, Set<string>>, k: K, who: string) => map.set(k, (map.get(k) ?? new Set()).add(who));
  for (const c of chats.data ?? []) {
    const ip = asVisitorMeta(c.meta)?.ip;
    if (ip) add(byIp, ip, `c:${c.id}`);
  }
  for (const e of enquiries.data ?? []) {
    const ip = asVisitorMeta(e.meta)?.ip;
    if (ip) add(byIp, ip, `e:${e.id}`);
    if (e.message && copyable(e.message)) add(byText, normalise(e.message), `e:${e.id}`);
  }
  for (const m of typed.data ?? []) {
    chatTexts.set(m.conversation_id, [...(chatTexts.get(m.conversation_id) ?? []), m.body]);
    if (copyable(m.body)) add(byText, normalise(m.body), `c:${m.conversation_id}`);
  }
  return { byIp, byText, chatTexts, domains: new Map() };
}

/** The judgement for one chat ("c") or enquiry ("e"); null when it has no visitor info (older rows). */
export function viewVisitor(
  index: VisitorIndex,
  row: { kind: "c" | "e"; id: string; meta: unknown; contact: string | null; phone?: string | null; text?: string },
): VisitorView | null {
  const meta = asVisitorMeta(row.meta);
  if (!meta) return null;
  const me = `${row.kind}:${row.id}`;
  const texts = row.kind === "c" ? (index.chatTexts.get(row.id) ?? []) : row.text ? [row.text] : [];
  const others = (set: Set<string> | undefined) => [...(set ?? [])].filter((w) => w !== me).length;
  const assessment = assessVisitor(meta, {
    verified: verifyVisitorMeta(meta),
    repeats: meta.ip ? others(index.byIp.get(meta.ip)) : 0,
    text: texts.join("\n"),
    contact: row.contact,
    phone: row.phone,
    duplicate: texts.some((t) => copyable(t) && others(index.byText.get(normalise(t))) > 0),
    emailDomainOk: row.contact?.includes("@") ? (index.domains.get(row.contact.split("@")[1].trim().toLowerCase()) ?? null) : null,
  });
  if (!assessment) return null;
  // The signature and connection hash stay on the server.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sig, ip, ...shown } = meta;
  return { meta: shown, assessment };
}
