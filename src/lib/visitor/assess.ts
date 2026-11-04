import { z } from "zod";

/*
 * Visitor info: what the website records about whoever sends a chat or an
 * enquiry, and the "Looks real / Check this / Likely spam" judgement the
 * admin sees. Collected by the browser (lib/visitor/signals.ts) and the
 * server (lib/visitor/server.ts), stored as `meta` on the chat or enquiry,
 * and explained on the Privacy page. Nothing here is ever shown to visitors.
 *
 * Approximate location is city level (from the host, Vercel), never an exact
 * address. The connection (IP) is kept only as a keyed hash, to count repeats.
 */

const text = (max: number) => z.string().trim().max(max);

/** What the visitor's browser sends (every field checked and bounded; all optional). */
export const clientSignalsSchema = z
  .object({
    screen: text(20).optional(),
    timeZone: text(60).optional(),
    language: text(40).optional(),
    touch: z.boolean().optional(),
    webdriver: z.boolean().optional(),
    landing: text(300).optional(),
    page: text(300).optional(),
    referrer: text(300).optional(),
    utm: z.object({ source: text(100).optional(), medium: text(100).optional(), campaign: text(100).optional() }).optional(),
    pages: z.number().int().min(0).max(10000).optional(),
    secondsOnSite: z.number().int().min(0).max(30 * 24 * 3600).optional(),
    /** Seconds from opening the form / chat to sending. */
    secondsToSend: z.number().int().min(0).max(24 * 3600).optional(),
    keystrokes: z.number().int().min(0).max(100000).optional(),
    pastes: z.number().int().min(0).max(1000).optional(),
    /** Backspace / Delete presses while writing (people correct themselves). */
    corrections: z.number().int().min(0).max(100000).optional(),
    /** Seconds spent in each form field ("name", "email", "message"…). */
    fieldSeconds: z.record(text(30), z.number().int().min(0).max(24 * 3600)).optional(),

    // Returning visitor (this browser, localStorage) and what they looked at.
    visits: z.number().int().min(1).max(100000).optional(),
    firstSeen: text(40).optional(),
    paths: z.array(text(100)).max(20).optional(),
    sections: z.array(text(40)).max(20).optional(),

    // Behaviour before sending: a person scrolls, moves the mouse or taps.
    scrolls: z.number().int().min(0).max(1000000).optional(),
    pointer: z.number().int().min(0).max(1000000).optional(),
    taps: z.number().int().min(0).max(1000000).optional(),
    activeSeconds: z.number().int().min(0).max(30 * 24 * 3600).optional(),

    // Device details the browser shares.
    osVersion: text(40).optional(),
    model: text(60).optional(),
    darkMode: z.boolean().optional(),
    connection: text(20).optional(),
    /** Do Not Track / Global Privacy Control is on. */
    privacySignal: z.boolean().optional(),
  })
  .strip();
export type ClientSignals = z.infer<typeof clientSignalsSchema>;

export interface VisitorMeta extends ClientSignals {
  v: 1;
  at: string;
  country?: string;
  region?: string;
  city?: string;
  postcode?: string;
  /** The time zone of their connection (from the host). */
  ipTimeZone?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: "phone" | "tablet" | "computer" | "unknown";
  /** The user agent says it's a script or automated browser. */
  botAgent?: boolean;
  acceptLanguage?: string;
  /** A keyed hash of the connection (IP): only for counting repeats. */
  ip?: string;
  /** Proof the server wrote this (HMAC); checked when the admin views it. */
  sig?: string;
}

export type Verdict = "real" | "check" | "spam";
export interface Reason {
  tone: "good" | "warn" | "bad";
  text: string;
}
export interface Assessment {
  verdict: Verdict;
  reasons: Reason[];
}

/** What the admin pages know beyond the stored info. */
export interface AssessExtras {
  /** The signature checked out (null = no key set up, so nothing to check). */
  verified: boolean | null;
  /** Other chats/enquiries from the same connection in the last 30 days. */
  repeats: number;
  /** What they wrote (typed messages or the enquiry message), for the message checks. */
  text: string;
  /** Their email or phone, if given. */
  contact: string | null;
  /** A phone number as well (enquiries have both). */
  phone?: string | null;
  /** The same text arrived from someone else recently. */
  duplicate: boolean;
  /** Their email's domain can receive mail (MX check); null = not checked or no email. */
  emailDomainOk?: boolean | null;
}

/** What the admin pages get: the info (without the signature or connection hash) and the judgement. */
export interface VisitorView {
  meta: VisitorMeta;
  assessment: Assessment;
}

/** The home page's sections, by their ids. */
export const SECTION_LABELS: Record<string, string> = {
  intro: "The studio",
  services: "Services",
  gallery: "Gallery",
  stories: "Stories",
  reviews: "Reviews",
  about: "About us",
  faq: "FAQ",
  contact: "Contact",
  enquire: "Enquiry form",
};

/** The kind of phone number: an Australian mobile, a landline (with its states), 13/1300/1800, or other. */
export function phoneKind(value: string): { kind: "mobile" | "landline" | "business" | "other"; area?: string } | null {
  if (!/^[+\d][\d\s()-]{5,}$/.test(value.trim())) return null;
  const d = value.replace(/[^\d+]/g, "").replace(/^\+61/, "0").replace(/^61(?=\d{9}$)/, "0");
  if (/^04\d{8}$/.test(d)) return { kind: "mobile" };
  const areas: Record<string, string> = { "02": "NSW / ACT", "03": "VIC / TAS", "07": "QLD", "08": "SA / WA / NT" };
  if (/^0[2378]\d{8}$/.test(d)) return { kind: "landline", area: areas[d.slice(0, 2)] };
  if (/^(13\d{4}|1300\d{6}|1800\d{6})$/.test(d)) return { kind: "business" };
  return { kind: "other" };
}

export const VERDICT_LABELS: Record<Verdict, string> = { real: "Looks real", check: "Check this", spam: "Likely spam" };

// A small list of throwaway-email services; spam often uses them.
const DISPOSABLE = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com", "temp-mail.org", "yopmail.com",
  "trashmail.com", "sharklasers.com", "getnada.com", "dispostable.com", "maildrop.cc", "fakeinbox.com", "throwawaymail.com",
]);
const SOCIAL = /(google|bing|duckduckgo|instagram|facebook|fb\.|tiktok|pinterest|yahoo|linkedin)\./i;

const isPhone = (v: string) => /^[+\d][\d\s()-]{5,}$/.test(v.trim());
const isAustralianPhone = (v: string) => {
  const d = v.replace(/[^\d+]/g, "");
  return /^(\+?61|0)[2-478]\d{8}$/.test(d) || /^(13|1300|1800)\d{4,6}$/.test(d);
};

/** "Looks real / Check this / Likely spam", with the reasons, from what's known. */
export function assessVisitor(meta: VisitorMeta | null, extras: AssessExtras): Assessment | null {
  if (!meta) return null;
  const reasons: Reason[] = [];
  const add = (tone: Reason["tone"], t: string) => reasons.push({ tone, text: t });

  // Proof it came through the website.
  if (extras.verified === false) add("bad", "Not sent through the website (the visitor info doesn't check out)");

  // Automation.
  if (meta.webdriver) add("bad", "The browser reported it was being remote-controlled (automation)");
  if (meta.botAgent) add("bad", `A script or automated browser (${meta.browser ?? "unknown browser"})`);
  if (meta.secondsToSend !== undefined && meta.secondsToSend < 3) add("bad", `Sent ${meta.secondsToSend} s after opening the form (too fast for a person)`);

  // Where they are.
  if (meta.country) {
    if (meta.country === "AU") add("good", `In Australia${meta.city ? ` (${meta.city}${meta.region ? `, ${meta.region}` : ""})` : ""}`);
    else add("warn", `Outside Australia (${meta.city ? `${meta.city}, ` : ""}${meta.country})`);
  }
  if (meta.timeZone && !meta.timeZone.startsWith("Australia/")) add("warn", `Their device is set to ${meta.timeZone} time`);

  // Repeats from one connection.
  if (extras.repeats >= 5) add("bad", `${extras.repeats} others from the same connection in 30 days`);
  else if (extras.repeats >= 2) add("warn", `${extras.repeats} others from the same connection in 30 days`);

  // What they wrote.
  const links = (extras.text.match(/https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|ru|xyz|top|info|biz|io)\b/gi) ?? []).length;
  if (links >= 2) add("bad", `${links} links in the message`);
  else if (links === 1) add("warn", "A link in the message");
  if (links > 0 && (meta.pastes ?? 0) > 0 && (meta.keystrokes ?? 0) < 5) add("bad", "Pasted in, with a link, without typing");
  if (extras.duplicate) add("bad", "The same message came from someone else recently");
  if (extras.contact) {
    const domain = extras.contact.includes("@") ? extras.contact.split("@")[1]?.toLowerCase() : null;
    if (domain && DISPOSABLE.has(domain)) add("bad", `A throwaway email address (${domain})`);
    else if (domain && extras.emailDomainOk === false) add("bad", `The email's domain can't receive mail (${domain})`);
    else if (domain && extras.emailDomainOk) add("good", "The email address can receive mail");
  }
  const phoneNumber = extras.phone ?? (extras.contact && !extras.contact.includes("@") ? extras.contact : null);
  if (phoneNumber && isPhone(phoneNumber)) {
    if (!isAustralianPhone(phoneNumber)) add("warn", "Not an Australian phone number");
    else if (phoneKind(phoneNumber)?.kind === "mobile") add("good", "An Australian mobile number");
  }

  // Behaviour before sending: no scrolling, mouse or taps at all, and nothing typed, is how scripts look.
  const interactions = (meta.scrolls ?? 0) + (meta.pointer ?? 0) + (meta.taps ?? 0);
  if (meta.scrolls !== undefined && interactions === 0 && !(meta.keystrokes ?? 0)) add("bad", "No scrolling, mouse movement, taps or typing before sending");

  // Signs of a real visit.
  if ((meta.secondsOnSite ?? 0) >= 30) add("good", `On the site ${duration(meta.secondsOnSite!)} before writing`);
  if ((meta.pages ?? 0) >= 2) add("good", `Looked at ${meta.pages} pages`);
  // A search engine, social media, or one of your own campaign links.
  if ((meta.referrer && SOCIAL.test(meta.referrer)) || meta.utm?.source) add("good", `Came from ${source(meta)}`);
  if ((meta.keystrokes ?? 0) >= 10 && !(meta.pastes ?? 0)) add("good", "Typed it in themselves");
  if ((meta.corrections ?? 0) > 0 && (meta.keystrokes ?? 0) >= 10) add("good", "Corrected their typing as they went");
  if ((meta.visits ?? 1) >= 2) add("good", `Returning visitor (visit ${meta.visits}${meta.firstSeen ? `, first came ${shortDate(meta.firstSeen)}` : ""})`);
  const seen = (meta.sections ?? []).filter((id) => ["services", "gallery", "stories", "reviews", "about", "faq"].includes(id));
  if (seen.length >= 2) add("good", `Looked at ${seen.map((id) => SECTION_LABELS[id] ?? id).join(", ")}`);

  const verdict: Verdict = reasons.some((r) => r.tone === "bad") ? "spam" : reasons.some((r) => r.tone === "warn") ? "check" : "real";
  // Most telling first: bad, then warnings, then good signs.
  const order = { bad: 0, warn: 1, good: 2 };
  return { verdict, reasons: reasons.sort((a, b) => order[a.tone] - order[b.tone]) };
}

const shortDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
};

/** "3 min 20 s", "45 s". */
export function duration(seconds: number) {
  if (seconds < 60) return `${seconds} s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min${seconds % 60 ? ` ${seconds % 60} s` : ""}`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

/** Where they came from, in words: "Instagram", "Google", "a link on example.com", "typed the address". */
export function source(meta: Pick<VisitorMeta, "referrer" | "utm">) {
  if (meta.utm?.source) return `${meta.utm.source}${meta.utm.campaign ? ` (${meta.utm.campaign})` : ""}`;
  if (!meta.referrer) return "typed the address or a saved link";
  try {
    const host = new URL(meta.referrer).hostname.replace(/^www\./, "");
    const known: Record<string, string> = {
      google: "Google", bing: "Bing", duckduckgo: "DuckDuckGo", instagram: "Instagram", facebook: "Facebook",
      tiktok: "TikTok", pinterest: "Pinterest", yahoo: "Yahoo", linkedin: "LinkedIn",
    };
    const hit = Object.keys(known).find((k) => host.includes(k));
    return hit ? known[hit] : `a link on ${host}`;
  } catch {
    return "another website";
  }
}

/** A stored meta value from the database (JSON), checked loosely. */
export function asVisitorMeta(value: unknown): VisitorMeta | null {
  if (!value || typeof value !== "object" || (value as { v?: unknown }).v !== 1) return null;
  return value as VisitorMeta;
}
