"use client";

import type { ClientSignals } from "./assess";

/*
 * Visitor info, browser side. Read when a chat or enquiry is sent; see
 * lib/visitor/assess.ts and the Privacy page.
 *
 *   - This visit (sessionStorage, this tab): first page, where they came
 *     from, pages and home-page sections viewed, time on site, and how much
 *     they scrolled / moved the mouse / tapped, and for how long they were
 *     active (VisitTracker in the site layout keeps it up to date).
 *   - Returning visitor (localStorage, this browser): first visit and number
 *     of visits.
 *   - A few facts the browser shares about itself, read when sending.
 */

const VISIT_KEY = "cc-visit";
const VISITOR_KEY = "cc-visitor";
/** Activity within this many ms counts the next second as "active". */
const ACTIVE_WINDOW = 15_000;

interface Visit {
  firstAt: number;
  landing: string;
  referrer: string;
  utm: { source?: string; medium?: string; campaign?: string };
  pages: number;
  last: string;
  paths: string[];
  sections: string[];
  scrolls: number;
  pointer: number;
  taps: number;
  activeSeconds: number;
}

interface Visitor {
  firstSeen: string;
  visits: number;
}

const readJson = <T,>(storage: Storage, key: string): T | null => {
  try {
    return JSON.parse(storage.getItem(key) ?? "null") as T | null;
  } catch {
    return null;
  }
};
const writeJson = (storage: Storage, key: string, value: unknown) => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked: the visit just isn't recorded.
  }
};

/** Called on every page view (the site layout's VisitTracker). */
export function recordPageView(path: string) {
  try {
    const visit = readJson<Visit>(window.sessionStorage, VISIT_KEY);
    if (!visit) {
      const params = new URLSearchParams(window.location.search);
      const utm = {
        source: params.get("utm_source") ?? undefined,
        medium: params.get("utm_medium") ?? undefined,
        campaign: params.get("utm_campaign") ?? undefined,
      };
      // Only another site counts as "where they came from".
      let referrer = "";
      try {
        if (document.referrer && new URL(document.referrer).origin !== window.location.origin) referrer = document.referrer;
      } catch {
        // Not a valid address: leave it out.
      }
      const fresh: Visit = {
        firstAt: Date.now(),
        landing: path,
        referrer,
        utm,
        pages: 1,
        last: path,
        paths: [path],
        sections: [],
        scrolls: 0,
        pointer: 0,
        taps: 0,
        activeSeconds: 0,
      };
      writeJson(window.sessionStorage, VISIT_KEY, fresh);
      // A new visit for this browser.
      const visitor = readJson<Visitor>(window.localStorage, VISITOR_KEY);
      writeJson(window.localStorage, VISITOR_KEY, {
        firstSeen: visitor?.firstSeen ?? new Date().toISOString(),
        visits: (visitor?.visits ?? 0) + 1,
      } satisfies Visitor);
    } else if (visit.last !== path) {
      const paths = visit.paths?.includes(path) ? visit.paths : [...(visit.paths ?? []), path].slice(-20);
      writeJson(window.sessionStorage, VISIT_KEY, { ...visit, pages: visit.pages + 1, last: path, paths });
    }
  } catch {
    // Storage blocked: the visit just isn't recorded.
  }
}

/**
 * Behaviour and sections for this visit: counts scrolls, mouse movement and
 * taps, active seconds, and the home-page sections that came into view.
 * Returns a cleanup function (VisitTracker runs it on unmount).
 */
export function trackVisitActivity() {
  const counts = { scrolls: 0, pointer: 0, taps: 0, active: 0 };
  const seen = new Set<string>();
  let lastActivity = 0;
  let lastMove = 0;
  let lastScroll = 0;
  const activity = () => {
    lastActivity = Date.now();
  };
  // Scrolling in bursts too (one count per 400 ms): a flick fires dozens of events.
  const onScroll = () => {
    const now = Date.now();
    if (now - lastScroll > 400) counts.scrolls++;
    lastScroll = now;
    activity();
  };
  // Mouse movement in bursts (one count per 250 ms), not every pixel.
  const onMove = () => {
    const now = Date.now();
    if (now - lastMove > 250) {
      counts.pointer++;
      lastMove = now;
    }
    activity();
  };
  const onTap = () => {
    counts.taps++;
    activity();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onTap, { passive: true });
  window.addEventListener("keydown", activity, { passive: true });

  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            // Seen: a third of the section is showing, or it fills 40% of the screen (tall sections).
            for (const e of entries) {
              if (!e.isIntersecting || !e.target.id) continue;
              if (e.intersectionRatio >= 0.35 || e.intersectionRect.height >= window.innerHeight * 0.4) seen.add(e.target.id);
            }
          },
          { threshold: [0, 0.1, 0.2, 0.35, 0.5] },
        )
      : null;
  const observeSections = () => document.querySelectorAll("main section[id]").forEach((el) => observer?.observe(el));
  observeSections();

  // Every second: an active second if they did something recently and the tab is showing;
  // every few seconds: save the counts into this visit.
  let ticks = 0;
  const timer = window.setInterval(() => {
    if (document.visibilityState === "visible" && Date.now() - lastActivity < ACTIVE_WINDOW) counts.active++;
    if (++ticks % 3 === 0) flush();
  }, 1000);
  const flush = () => {
    const visit = readJson<Visit>(window.sessionStorage, VISIT_KEY);
    if (!visit) return;
    writeJson(window.sessionStorage, VISIT_KEY, {
      ...visit,
      scrolls: (visit.scrolls ?? 0) + counts.scrolls,
      pointer: (visit.pointer ?? 0) + counts.pointer,
      taps: (visit.taps ?? 0) + counts.taps,
      activeSeconds: (visit.activeSeconds ?? 0) + counts.active,
      sections: [...new Set([...(visit.sections ?? []), ...seen])].slice(0, 20),
    });
    counts.scrolls = counts.pointer = counts.taps = counts.active = 0;
  };
  // Sections can appear after the first paint (content loads in): look again shortly.
  const again = window.setTimeout(observeSections, 2000);

  return {
    /** Save what's counted so far (before reading the visit to send it). */
    flush,
    stop: () => {
      flush();
      window.clearInterval(timer);
      window.clearTimeout(again);
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onTap);
      window.removeEventListener("keydown", activity);
    },
  };
}

/** The running tracker (one per page), so sending can save its latest counts first. */
let tracker: ReturnType<typeof trackVisitActivity> | null = null;
export function startVisitTracking() {
  tracker?.stop();
  tracker = trackVisitActivity();
  return () => {
    tracker?.stop();
    tracker = null;
  };
}

/**
 * When they started (first focus or opening the chat), typing vs pasting
 * and corrections in the message box, and time in each field. Attach
 * `start`, `focusField` / `blurField` (forms), onKeyDown and onPaste; keep
 * one per form (useState's initialiser) and read it when sending.
 */
export function createTypingCounter() {
  const counts = { keystrokes: 0, pastes: 0, corrections: 0 };
  const fieldMs: Record<string, number> = {};
  let current: { name: string; at: number } | null = null;
  let startedAt: number | null = null;
  const blurField = () => {
    if (!current) return;
    fieldMs[current.name] = (fieldMs[current.name] ?? 0) + (Date.now() - current.at);
    current = null;
  };
  return {
    start: () => void (startedAt ??= Date.now()),
    focusField: (name: string | undefined) => {
      startedAt ??= Date.now();
      blurField();
      if (name) current = { name: name.slice(0, 30), at: Date.now() };
    },
    blurField,
    onKeyDown: (e: { key: string }) => {
      counts.keystrokes++;
      if (e.key === "Backspace" || e.key === "Delete") counts.corrections++;
    },
    onPaste: () => void counts.pastes++,
    /** Never started (a script filled it in): "never", which counts as 0 seconds. */
    read: () => {
      blurField();
      const fieldSeconds = Object.fromEntries(Object.entries(fieldMs).map(([k, ms]) => [k, Math.round(ms / 1000)]).slice(0, 12));
      return { ...counts, fieldSeconds: Object.keys(fieldSeconds).length ? fieldSeconds : undefined, openedAt: startedAt ?? ("never" as const) };
    },
  };
}

type UAData = { getHighEntropyValues?: (hints: string[]) => Promise<{ platformVersion?: string; model?: string }> };

/** Everything the browser adds to a chat or enquiry when it's sent. */
export async function clientSignals(
  extra: {
    openedAt?: number | "never";
    keystrokes?: number;
    pastes?: number;
    corrections?: number;
    fieldSeconds?: Record<string, number>;
  } = {},
): Promise<ClientSignals> {
  tracker?.flush();
  const visit = readJson<Visit>(window.sessionStorage, VISIT_KEY);
  const visitor = readJson<Visitor>(window.localStorage, VISITOR_KEY);
  const now = Date.now();
  const cut = (v: string | undefined, n: number) => (v ? v.slice(0, n) : undefined);

  // Chrome / Edge / Android share the OS version and phone model on request (quickly, or not at all).
  let hints: { platformVersion?: string; model?: string } = {};
  const uaData = (navigator as Navigator & { userAgentData?: UAData }).userAgentData;
  if (uaData?.getHighEntropyValues) {
    try {
      hints = await Promise.race([
        uaData.getHighEntropyValues(["platformVersion", "model"]),
        new Promise<typeof hints>((resolve) => setTimeout(() => resolve({}), 500)),
      ]);
    } catch {
      hints = {};
    }
  }
  const nav = navigator as Navigator & { connection?: { effectiveType?: string }; globalPrivacyControl?: boolean };

  return {
    screen: `${window.screen.width}x${window.screen.height}`,
    timeZone: cut(Intl.DateTimeFormat().resolvedOptions().timeZone, 60),
    language: cut(navigator.language, 40),
    touch: navigator.maxTouchPoints > 0,
    webdriver: navigator.webdriver === true,
    landing: cut(visit?.landing, 300),
    page: cut(window.location.pathname + window.location.hash, 300),
    referrer: cut(visit?.referrer || undefined, 300),
    utm:
      visit && (visit.utm.source || visit.utm.medium || visit.utm.campaign)
        ? { source: cut(visit.utm.source, 100), medium: cut(visit.utm.medium, 100), campaign: cut(visit.utm.campaign, 100) }
        : undefined,
    pages: visit?.pages,
    secondsOnSite: visit ? Math.max(0, Math.round((now - visit.firstAt) / 1000)) : undefined,
    secondsToSend:
      extra.openedAt === "never" ? 0 : extra.openedAt ? Math.max(0, Math.round((now - extra.openedAt) / 1000)) : undefined,
    keystrokes: extra.keystrokes,
    pastes: extra.pastes,
    corrections: extra.corrections,
    fieldSeconds: extra.fieldSeconds,
    visits: visitor?.visits,
    firstSeen: cut(visitor?.firstSeen, 40),
    paths: visit?.paths?.map((p) => p.slice(0, 100)).slice(0, 20),
    sections: visit?.sections?.map((s) => s.slice(0, 40)).slice(0, 20),
    scrolls: visit?.scrolls,
    pointer: visit?.pointer,
    taps: visit?.taps,
    activeSeconds: visit?.activeSeconds,
    osVersion: cut(hints.platformVersion || undefined, 40),
    model: cut(hints.model || undefined, 60),
    darkMode: window.matchMedia?.("(prefers-color-scheme: dark)").matches,
    connection: cut(nav.connection?.effectiveType, 20),
    privacySignal: nav.globalPrivacyControl === true || navigator.doNotTrack === "1",
  };
}
