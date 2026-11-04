import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { clientSignalsSchema, type VisitorMeta } from "./assess";

/*
 * Visitor info, server side: the approximate location the host (Vercel)
 * adds to every request, the browser's own description of itself, and a
 * keyed hash of the connection. Signed with CHAT_SERVER_KEY so a record
 * written straight to the database (not through the website) is spotted.
 * Without the key: still recorded, just not signed, and no connection hash.
 */

const key = () => process.env.CHAT_SERVER_KEY || null;

/** Object keys in a fixed order (the database reorders JSON keys). */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .filter((k) => (value as Record<string, unknown>)[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical((value as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

const sign = (meta: Omit<VisitorMeta, "sig">, k: string) => createHmac("sha256", k).update(canonical(meta)).digest("base64url");

/** The device, from the user agent (a simple reading: enough to judge, not to fingerprint). */
export function readUserAgent(ua: string) {
  const botAgent = /headless|phantom|puppeteer|playwright|selenium|python|curl|wget|httpclient|okhttp|java\/|go-http|axios|node-fetch|bot\b|crawler|spider/i.test(ua) || ua.trim() === "";
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /headlesschrome/i.test(ua)
      ? "HeadlessChrome"
      : /samsungbrowser/i.test(ua)
        ? "Samsung Internet"
        : /crios|chrome\//i.test(ua)
          ? "Chrome"
          : /fxios|firefox\//i.test(ua)
            ? "Firefox"
            : /safari\//i.test(ua)
              ? "Safari"
              : (ua.split(/[\s/]/)[0] || "Unknown").slice(0, 30);
  const os = /iphone|ipad|ipod/i.test(ua)
    ? "iOS"
    : /android/i.test(ua)
      ? "Android"
      : /windows/i.test(ua)
        ? "Windows"
        : /mac os x|macintosh/i.test(ua)
          ? "macOS"
          : /linux/i.test(ua)
            ? "Linux"
            : "Unknown";
  const device: VisitorMeta["device"] = /ipad|tablet/i.test(ua) ? "tablet" : /mobi|iphone|android/i.test(ua) ? "phone" : os === "Unknown" ? "unknown" : "computer";
  return { browser, os, device, botAgent };
}

const header = (h: Headers, name: string) => {
  const v = h.get(name);
  if (!v) return undefined;
  try {
    return decodeURIComponent(v).slice(0, 100);
  } catch {
    return v.slice(0, 100);
  }
};

/** The full visitor info for a chat or enquiry being sent now, signed. */
export async function buildVisitorMeta(client: unknown): Promise<VisitorMeta> {
  const h = await headers();
  const signals = clientSignalsSchema.safeParse(client ?? {});
  const ua = (h.get("user-agent") ?? "").slice(0, 300);
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const k = key();
  const meta: Omit<VisitorMeta, "sig"> = {
    v: 1,
    at: new Date().toISOString(),
    ...(signals.success ? signals.data : {}),
    country: header(h, "x-vercel-ip-country"),
    region: header(h, "x-vercel-ip-country-region"),
    city: header(h, "x-vercel-ip-city"),
    postcode: header(h, "x-vercel-ip-postal-code"),
    ipTimeZone: header(h, "x-vercel-ip-timezone"),
    userAgent: ua || undefined,
    ...readUserAgent(ua),
    acceptLanguage: h.get("accept-language")?.slice(0, 60) || undefined,
    ip: k && ip ? createHmac("sha256", k).update(`ip:${ip}`).digest("base64url").slice(0, 22) : undefined,
  };
  // Leave out empty fields (smaller rows, and the same shape the database keeps).
  const clean = JSON.parse(JSON.stringify(meta)) as Omit<VisitorMeta, "sig">;
  return k ? { ...clean, sig: sign(clean, k) } : clean;
}

/** true = written by this website; false = not (or altered); null = no key, so it can't be checked. */
export function verifyVisitorMeta(meta: VisitorMeta | null): boolean | null {
  const k = key();
  if (!k || !meta) return null;
  if (!meta.sig) return false;
  const { sig, ...rest } = meta;
  const expected = Buffer.from(sign(rest, k));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
