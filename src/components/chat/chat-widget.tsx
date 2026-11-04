"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowRight, Check, CheckCheck, ChevronDown, MessageCircle, Moon, UsersRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { acceptQuote, fetchChat, sendChatMessage, shareChatContact, submitQuoteDetails } from "@/lib/chat/actions";
import {
  CHOICE_LABELS,
  GREETING,
  HANDOVER_THANKS,
  chatContactSchema,
  type BotAnswer,
  type ChatActionResult,
  type ChatBotContext,
  type ChatChoice,
  type ChatContactValues,
  type ChatMessage,
  type PlanStep,
} from "@/lib/chat/bot";
import { chatDayLabel } from "@/lib/chat/dates";
import { asQuote, type QuoteData, type QuoteDetails } from "@/lib/chat/quote";
import { clientSignals, createTypingCounter } from "@/lib/visitor/signals";
import { QuoteFormCard, QuoteOffer } from "./chat-quote";
import { botActive, botReplies } from "@/lib/chat/knowledge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

/*
 * The website chat: a draggable button and a chat window with a menu bot.
 *
 *   - The button can be dragged anywhere; released, it glides to the nearest
 *     side (never left over content). The spot is remembered in this browser.
 *     A tap (or Enter/Space) opens the chat; the window has its own close.
 *   - The menu bot answers from the site's content (lib/chat/bot.ts,
 *     knowledge.ts). When the visitor wants the team, they share a name and
 *     an email or phone, the team gets a push alert and replies from
 *     Admin → Chats, and the bot stays quiet from then on.
 *   - The chat is kept in the database under this browser's random key
 *     (localStorage), so it's still there after a reload. Replies are checked
 *     every few seconds while the chat is open, and every 30 seconds while
 *     it's minimised: a new reply then shows as a preview card by the button
 *     (without counting as read until the chat is opened).
 *   - Header status (Online / Away) is set by the team in Admin → Chats.
 */

const TOKEN_KEY = "cc-chat-token";
const POS_KEY = "cc-chat-button";
const SIZE = 60;
const EDGE = 16;
/** Within this many px of the bottom, new messages scroll into view by themselves. */
const STICK_PX = 80;

type Side = "left" | "right";
interface Spot {
  side: Side;
  /** Distance from the top in px; null = the default spot near the bottom. */
  top: number | null;
}

type Item =
  | { key: string; kind: "bot"; answer: BotAnswer }
  | { key: string; kind: "visitor"; text: string; at: string; pending?: boolean; status?: string; seen?: boolean }
  | { key: string; kind: "team"; text: string; at: string }
  | { key: string; kind: "quote-form"; id: number; active: boolean }
  | { key: string; kind: "quote"; id: number; quote: QuoteData; state: "accepted" | "waiting" | "replaced"; at: string }
  | { key: string; kind: "handover" }
  | { key: string; kind: "with-team" }
  | { key: string; kind: "day"; label: string };

const read = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode / storage blocked: the chat still works for this visit.
  }
};

function newToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function readSpot(): Spot {
  try {
    const saved = JSON.parse(read(POS_KEY) ?? "null") as Spot | null;
    if (saved && (saved.side === "left" || saved.side === "right") && (saved.top === null || typeof saved.top === "number")) return saved;
  } catch {
    // ignore
  }
  return { side: "right", top: null };
}

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });

/** The visitor's chat as items to show: bot answers rebuilt, day separators, "Seen" on the last message. */
function buildItems(messages: ChatMessage[], ctx: ChatBotContext, name: string | null, adminReadAt: string | null): Item[] {
  const replies = botReplies(messages.filter((m) => m.id > 0), ctx);
  const items: Item[] = [];
  let day = "";
  const lastVisitor = [...messages].reverse().find((m) => m.sender === "visitor" && m.id > 0);
  // Quotes: only the latest form can be filled in (once), only the latest quote accepted.
  const lastForm = [...messages].reverse().find((m) => m.kind === "quote_form");
  const formAnswered = Boolean(lastForm && messages.some((m) => m.kind === "quote_details" && m.id > lastForm.id));
  const lastQuote = [...messages].reverse().find((m) => m.kind === "quote");
  const accepted = new Set(messages.filter((m) => m.kind === "quote_accept").map((m) => Number((m.data as { quoteId?: unknown } | null)?.quoteId)));
  for (const m of messages) {
    const label = chatDayLabel(m.at);
    if (label !== day) {
      // The greeting belongs to the first day of the chat.
      if (!day) {
        items.push({ key: `d-${label}`, kind: "day", label });
        items.push({ key: "greeting", kind: "bot", answer: GREETING });
      } else items.push({ key: `d-${label}`, kind: "day", label });
      day = label;
    }
    if (m.sender === "visitor") {
      const seen = Boolean(m.id === lastVisitor?.id && adminReadAt && new Date(adminReadAt) >= new Date(m.at));
      items.push({
        key: `m${m.id}`,
        kind: "visitor",
        text: m.choice ? CHOICE_LABELS[m.choice] : m.body,
        at: m.at,
        pending: m.id < 0,
        status: m.id === lastVisitor?.id ? (seen ? `Seen by the team · ${timeOf(adminReadAt!)}` : `Sent · ${timeOf(m.at)}`) : undefined,
        seen,
      });
      const answer = replies.get(m.id);
      if (answer) items.push({ key: `a${m.id}`, kind: "bot", answer });
    } else if (m.sender === "system") {
      // The team turned the bot off: a quiet note that a person has the chat.
      // (Turning it back on isn't shown; the bot simply answers again.)
      if (m.kind === "bot_off") items.push({ key: `e${m.id}`, kind: "with-team" });
      else if (!m.kind) {
        items.push({ key: `h${m.id}`, kind: "handover" });
        items.push({ key: `t${m.id}`, kind: "bot", answer: { text: HANDOVER_THANKS(name), chips: [] } });
      }
    } else if (m.kind === "quote_form") {
      items.push({ key: `m${m.id}`, kind: "team", text: m.body, at: m.at });
      items.push({ key: `f${m.id}`, kind: "quote-form", id: m.id, active: m.id === lastForm?.id && !formAnswered });
    } else if (m.kind === "quote" && asQuote(m.data)) {
      const state = accepted.has(m.id) ? "accepted" : m.id === lastQuote?.id ? "waiting" : "replaced";
      items.push({ key: `m${m.id}`, kind: "quote", id: m.id, quote: asQuote(m.data)!, state, at: m.at });
    } else {
      items.push({ key: `m${m.id}`, kind: "team", text: m.body, at: m.at });
    }
  }
  if (!day) items.push({ key: "greeting", kind: "bot", answer: GREETING });
  return items;
}

const subscribeNothing = () => () => {};

export function ChatWidget({ ctx }: { ctx: ChatBotContext }) {
  // Client only: the button's spot and the chat live in this browser.
  const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const desktop = useMediaQuery("(min-width: 1024px)");

  const [open, setOpen] = useState(false);
  const [spot, setSpot] = useState<Spot>(() => (typeof window === "undefined" ? { side: "right", top: null } : readSpot()));
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [handedOver, setHandedOver] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [adminReadAt, setAdminReadAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  /** The newest unread reply, shown as a card by the minimised button. */
  const [preview, setPreview] = useState<string | null>(null);
  /** A reply arrived while the visitor was scrolled up. */
  const [newBelow, setNewBelow] = useState(false);
  const [draft, setDraft] = useState("");
  /** Already handed over, but the visitor wants to send new details. */
  const [updateDetails, setUpdateDetails] = useState(false);
  // Re-render on resize / rotation so the button stays on screen.
  const [, setViewport] = useState(0);

  const token = useRef<string | null>(null);
  const lastId = useRef(0);
  /** Message ids already in the chat (answers can overlap). */
  const known = useRef(new Set<number>());
  const openRef = useRef(open);
  const stick = useRef(true);
  const dragStart = useRef<{ px: number; py: number; x0: number; y0: number; moved: boolean } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const busyRef = useRef(false);
  const applyRef = useRef<((result: ChatActionResult) => void) | null>(null);
  /** The last pointer-up ended a drag: the click that follows isn't a tap. */
  const justDragged = useRef(false);
  /** Visitor info: when the chat was opened, and typing vs pasting in the message box. */
  const [typing] = useState(createTypingCounter);

  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);
  // Typing in a form on the page (the enquiry form): the button steps aside so
  // it never sits over the field (phones especially), and comes back after.
  const [pageTyping, setPageTyping] = useState(false);
  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && el.matches("input, textarea, select, [contenteditable=true]") && !el.closest("[role=dialog]");
    const onIn = (e: FocusEvent) => isField(e.target) && setPageTyping(true);
    const onOut = (e: FocusEvent) => isField(e.target) && setPageTyping(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);
  useEffect(() => {
    const onResize = () => setViewport((v) => v + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /** Merge a server answer (messages after lastId) into the chat. */
  // `fromSend`: the visitor's own send. Only then is a failure shown (and the
  // unsent bubble removed); a failed background check is simply retried later.
  const apply = useCallback((result: ChatActionResult, fromSend = false) => {
    if (!result.ok) {
      if (fromSend) {
        setError(result.error);
        setMessages((m) => m.filter((x) => x.id > 0));
      }
      return;
    }
    if (fromSend) setError(null);
    const chat = result.chat;
    if (!chat) {
      // Saved, but the refresh failed: keep the bubble and check again shortly.
      window.setTimeout(() => {
        if (token.current) void fetchChat(token.current, lastId.current, openRef.current).then((r) => applyRef.current?.(r));
      }, 1500);
      return;
    }
    if (!chat.exists) return;
    // Answers can arrive out of order (a check and a send overlap): skip what
    // we already have and keep the chat in id order.
    const incoming = (chat.messages ?? []).filter((m) => !known.current.has(m.id));
    for (const m of incoming) known.current.add(m.id);
    if (incoming.length) lastId.current = Math.max(lastId.current, ...incoming.map((m) => m.id));
    setMessages((m) => {
      if (!incoming.length && !fromSend) return m;
      // A bubble still waiting for its send is dropped once the saved copy arrives.
      const arrived = incoming.filter((x) => x.sender === "visitor").map((x) => x.body);
      const pending = fromSend
        ? []
        : m.filter((x) => {
            if (x.id > 0) return false;
            const i = arrived.indexOf(x.body);
            if (i === -1) return true;
            arrived.splice(i, 1);
            return false;
          });
      const saved = [...m.filter((x) => x.id > 0), ...incoming].sort((a, b) => a.id - b.id);
      return [...saved, ...pending];
    });
    setHandedOver(Boolean(chat.handedOver));
    setName(chat.name ?? null);
    setAdminReadAt(chat.adminReadAt ?? null);
    // Replies the visitor hasn't read: a badge and a preview card while minimised.
    const readAt = chat.visitorReadAt ? new Date(chat.visitorReadAt) : null;
    const fresh = incoming.filter((m) => m.sender === "team" && (!readAt || new Date(m.at) > readAt));
    if (fresh.length) {
      if (!openRef.current) {
        setUnread((u) => u + fresh.length);
        setPreview(fresh[fresh.length - 1].body);
      } else if (!stick.current) setNewBelow(true);
    }
  }, []);

  useEffect(() => {
    applyRef.current = apply;
  }, [apply]);

  // A returning visitor: restore the chat kept under this browser's key (a peek: nothing is marked read).
  useEffect(() => {
    const saved = read(TOKEN_KEY);
    if (!saved) return;
    token.current = saved;
    let cancelled = false;
    void fetchChat(saved, 0, false).then((result) => {
      if (!cancelled && result.ok && result.chat?.exists) apply(result);
    });
    return () => {
      cancelled = true;
    };
  }, [apply]);

  // Replies from the team: checked whenever this visitor has a chat at all. The
  // team can reply to any chat in the inbox, even one that only tapped the menu.
  const hasChat = messages.some((m) => m.id > 0);
  useEffect(() => {
    if (!hasChat || !token.current) return;
    const tick = () => {
      // Skipped while a send is on its way (its own answer brings the chat up to date).
      if (document.visibilityState !== "visible" || !token.current || busyRef.current) return;
      void fetchChat(token.current, lastId.current, open).then(apply);
    };
    const id = window.setInterval(tick, open ? 4000 : 30000);
    return () => window.clearInterval(id);
  }, [hasChat, open, apply]);

  // Keep the newest message in view, unless the visitor has scrolled up to read.
  useEffect(() => {
    const list = listRef.current;
    if (list && stick.current) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open]);

  const ensureToken = () => {
    if (!token.current) {
      token.current = newToken();
      write(TOKEN_KEY, token.current);
    }
    return token.current;
  };

  const send = async (body: string, choice: ChatChoice | null, planStep: PlanStep | null = null, typed = false) => {
    if (busy) return;
    const t = ensureToken();
    stick.current = true;
    setNewBelow(false);
    setBusy(true);
    setError(null);
    // The chat's first message carries the visitor info (where from, device, this visit).
    const signals = lastId.current === 0 ? clientSignals(typing.read()) : Promise.resolve(null);
    setMessages((m) => [...m, { id: -Date.now(), sender: "visitor", body, choice, planStep, at: new Date().toISOString() }]);
    // A short pause so the answer reads as a reply, not a flash.
    const [result] = await Promise.all([
      signals.then((s) => sendChatMessage(t, body, choice, lastId.current, planStep, s)),
      new Promise((r) => setTimeout(r, 500)),
    ]);
    apply(result, true);
    // A typed message that didn't send goes back in the box.
    if (!result.ok && typed) setDraft((d) => d || body);
    setBusy(false);
  };

  const share = async (values: ChatContactValues) => {
    const t = ensureToken();
    stick.current = true;
    setBusy(true);
    const result = await shareChatContact(t, values, lastId.current);
    apply(result, true);
    if (result.ok) setUpdateDetails(false);
    setBusy(false);
    return result.ok;
  };

  /** The quote form: their details first if the chat has none, then the answers. */
  const sendQuoteDetails = async (details: QuoteDetails, contact: { name: string; contact: string } | null) => {
    const t = ensureToken();
    stick.current = true;
    setBusy(true);
    if (contact) {
      const shared = await shareChatContact(t, { ...contact, eventDate: "" }, lastId.current);
      apply(shared, true);
      if (!shared.ok) {
        setBusy(false);
        return false;
      }
    }
    const result = await submitQuoteDetails(t, details, lastId.current);
    apply(result, true);
    setBusy(false);
    return result.ok;
  };
  const accept = async (quoteId: number) => {
    const t = ensureToken();
    stick.current = true;
    setBusy(true);
    const result = await acceptQuote(t, quoteId, lastId.current);
    apply(result, true);
    setBusy(false);
    return result.ok;
  };

  const items = useMemo(() => buildItems(messages, ctx, name, adminReadAt), [messages, ctx, name, adminReadAt]);
  const lastShown = [...items].reverse().find((i) => i.kind !== "day");
  const lastAnswer = lastShown?.kind === "bot" ? lastShown.answer : null;
  // Menu buttons only while the bot has the chat.
  const chips = !busy && lastAnswer && botActive(messages.filter((m) => m.id > 0)) ? lastAnswer.chips : [];
  const formKind = !busy && lastAnswer?.form ? lastAnswer.form : null;
  // "Plan my event": the question waiting for an answer (typed messages answer it too).
  const planAsk = !busy && lastAnswer?.plan && botActive(messages.filter((m) => m.id > 0)) ? lastAnswer.plan : null;
  const chipLabel = (c: ChatChoice) => (c === "team" && ctx.away ? "Leave a message" : CHOICE_LABELS[c]);

  const toggle = (next = !open) => {
    setOpen(next);
    if (next) {
      typing.start();
      setUnread(0);
      setPreview(null);
      setNewBelow(false);
      stick.current = true;
      // Opening the chat is reading it: the team's replies are marked as seen.
      if (token.current) void fetchChat(token.current, lastId.current, true).then(apply);
      window.setTimeout(() => (desktop ? inputRef.current : closeRef.current)?.focus(), 50);
    } else {
      // The button comes back once the window closes: return focus to it.
      window.setTimeout(() => buttonRef.current?.focus(), 0);
    }
  };

  const sendDraft = () => {
    const body = draft.trim();
    if (!body || busy) return;
    setDraft("");
    if (inputRef.current) inputRef.current.style.height = "";
    void send(body, null, planAsk?.step ?? null, true);
  };

  // ---- dragging the button -------------------------------------------------
  const bottomReserve = () => (desktop ? EDGE : 96); // above the phone's Call / Enquire bar
  const clampTop = (top: number) => Math.max(88, Math.min(window.innerHeight - SIZE - bottomReserve(), top));

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Not an active pointer (rare): dragging still works inside the button.
    }
    const r = e.currentTarget.getBoundingClientRect();
    dragStart.current = { px: e.clientX, py: e.clientY, x0: r.left, y0: r.top, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = dragStart.current;
    if (!s) return;
    const dx = e.clientX - s.px;
    const dy = e.clientY - s.py;
    if (!s.moved && Math.hypot(dx, dy) < 6) return;
    s.moved = true;
    setDrag({
      x: Math.max(0, Math.min(window.innerWidth - SIZE, s.x0 + dx)),
      y: Math.max(0, Math.min(window.innerHeight - SIZE, s.y0 + dy)),
    });
  };
  const onPointerUp = () => {
    const s = dragStart.current;
    dragStart.current = null;
    if (!s) return;
    if (!s.moved || !drag) {
      setDrag(null);
      return;
    }
    justDragged.current = true;
    const next: Spot = { side: drag.x + SIZE / 2 > window.innerWidth / 2 ? "right" : "left", top: clampTop(drag.y) };
    setDrag(null);
    setSpot(next);
    write(POS_KEY, JSON.stringify(next));
  };

  if (!mounted) return null;

  // The button is hidden while the chat is open (the window has its own close button).
  const resting = spot.top === null;
  const sideGap = desktop ? 24 : EDGE;
  const buttonBottom = resting ? (desktop ? 24 : 96) : window.innerHeight - clampTop(spot.top!) - SIZE;
  const buttonStyle: React.CSSProperties = drag
    ? { left: drag.x, top: drag.y }
    : { [spot.side]: sideGap, ...(resting ? { bottom: buttonBottom } : { top: clampTop(spot.top!) }) };
  // The preview card sits just above the button, on the same side.
  const previewStyle: React.CSSProperties = { [spot.side]: sideGap, bottom: Math.max(buttonBottom, 8) + SIZE + 12 };

  const status = ctx.away ? "Away right now · we'll reply soon" : "We're online";

  return (
    <>
      {open && !desktop && <div aria-hidden="true" className="fixed inset-0 z-50 bg-foreground/30" onClick={() => toggle(false)} />}

      {open && (
        <section
          ref={sectionRef}
          role="dialog"
          aria-modal={!desktop}
          aria-labelledby="chat-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") toggle(false);
            else if (e.key === "Tab" && !desktop) keepFocusInside(e, sectionRef.current);
          }}
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden border border-border bg-background shadow-lift motion-safe:animate-rise",
            desktop
              ? cn("bottom-6 h-[min(680px,calc(100dvh-7rem))] w-96 rounded-[20px]", spot.side === "right" ? "right-6" : "left-6")
              : "inset-x-0 bottom-0 h-[calc(100dvh-2.5rem)] rounded-t-3xl pb-[env(safe-area-inset-bottom)]",
          )}
        >
          {!desktop && <span aria-hidden="true" className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-border" />}
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-highlight/50 bg-surface-blush">
              <Image src="/images/logo/canvas-creations-cc-mark.png" alt="" width={775} height={533} sizes="34px" className="h-auto w-8" />
              <span
                aria-hidden="true"
                className={cn("absolute right-0 bottom-0.5 size-2.5 rounded-full border-2 border-background", ctx.away ? "bg-highlight" : "bg-[#3f9d6b]")}
              />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="chat-title" className="truncate font-display text-xl leading-tight font-title">
                Canvas Creations and Events
              </h2>
              <p className={cn("text-xs", ctx.away ? "text-[#8a6427]" : "text-[#2f6b4c]")}>{status}</p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={() => toggle(false)}
              aria-label={desktop ? "Close chat" : "Minimise chat"}
              className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {desktop ? <X className="size-5" aria-hidden="true" /> : <ChevronDown className="size-5" aria-hidden="true" />}
            </button>
          </header>

          <div className="relative min-h-0 flex-1">
            <div
              ref={listRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_PX;
                if (stick.current && newBelow) setNewBelow(false);
              }}
              className="flex h-full flex-col gap-2.5 overflow-y-auto overscroll-contain px-4 pt-4 pb-2"
              aria-live="polite"
            >
              {ctx.away && (
                <p className="flex gap-2.5 rounded-xl border border-highlight/50 bg-surface-ivory px-3.5 py-3 text-[13px] leading-relaxed text-[#5d4a2c]">
                  <Moon className="mt-0.5 size-4 shrink-0 text-highlight" aria-hidden="true" />
                  <span>
                    We&apos;re away right now. Ask anything below, or leave your details, and the team will reply as soon as they&apos;re
                    back, here and by email.
                  </span>
                </p>
              )}
              {items.map((item) =>
                item.kind === "quote-form" ? (
                  <QuoteFormCard key={item.key} ctx={ctx} active={item.active} needsContact={!handedOver} onSubmit={sendQuoteDetails} />
                ) : item.kind === "quote" ? (
                  <QuoteOffer
                    key={item.key}
                    quote={item.quote}
                    state={item.state}
                    at={timeOf(item.at)}
                    onAccept={() => accept(item.id)}
                    onAsk={() => inputRef.current?.focus()}
                  />
                ) : (
                  <ChatItem key={item.key} item={item} />
                ),
              )}
              {busy && (
                <div aria-label="Typing" className="ml-9 flex w-fit gap-1 rounded-2xl bg-surface-blush px-3.5 py-3">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="size-1.5 rounded-full bg-primary motion-safe:animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              )}
              {chips.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-9">
                  {chips.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => void send(CHOICE_LABELS[c], c)}
                      className="min-h-9 rounded-full border border-primary/40 bg-background px-3.5 text-[13px] font-semibold text-emphasis transition-colors hover:border-primary hover:bg-surface-blush focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {chipLabel(c)}
                    </button>
                  ))}
                </div>
              )}
              {planAsk && (
                <PlanAnswers
                  key={planAsk.step}
                  question={planAsk}
                  onAnswer={(text) => void send(text, null, planAsk.step)}
                  onTypeInstead={() => inputRef.current?.focus()}
                />
              )}
              {formKind &&
                (handedOver && !updateDetails ? (
                  <DetailsOnFile name={name} onUpdate={() => setUpdateDetails(true)} />
                ) : (
                  <ContactCard askDate={formKind === "date"} onShare={share} />
                ))}
            </div>
            {newBelow && (
              <button
                type="button"
                onClick={() => {
                  stick.current = true;
                  setNewBelow(false);
                  listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
                }}
                className="absolute bottom-3 left-1/2 inline-flex h-9 -translate-x-1/2 items-center gap-1.5 rounded-full bg-foreground px-3.5 text-[13px] font-semibold text-background shadow-lift focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <ArrowDown className="size-4" aria-hidden="true" />
                New message
              </button>
            )}
          </div>

          <p role="alert" className="px-4 text-sm font-medium text-destructive empty:hidden">
            {error ?? ""}
          </p>
          <form
            className="flex items-end gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              sendDraft();
            }}
          >
            <label htmlFor="chat-message" className="sr-only">
              Message
            </label>
            <textarea
              ref={inputRef}
              id="chat-message"
              rows={1}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                // Grow with the message, up to about five lines.
                const el = e.target;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight + 2, 128)}px`; // + the border
              }}
              onPaste={typing.onPaste}
              onKeyDown={(e) => {
                typing.onKeyDown(e);
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  sendDraft();
                }
              }}
              maxLength={1000}
              autoComplete="off"
              placeholder={planAsk?.placeholder ?? (planAsk?.input === "date" ? "Or type the date" : "Type a message…")}
              className="max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-[22px] border border-border bg-surface-ivory px-4 py-2.5 text-[15px] leading-snug text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            <button
              type="submit"
              aria-label="Send message"
              aria-disabled={busy || !draft.trim() || undefined}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-(--btn-bg) text-(--btn-fg) transition-colors hover:bg-(--btn-hover-bg) focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none aria-disabled:opacity-60"
            >
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>
          </form>
          <p className="-mt-1 px-4 pb-3 text-center text-[11px] leading-snug text-muted-foreground">
            We keep this chat so the team can reply. Please don&apos;t share card or bank details here.{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy
            </a>
          </p>
        </section>
      )}

      {!open && preview && !drag && (
        <div
          role="status"
          style={previewStyle}
          className="fixed z-50 w-[min(18rem,calc(100vw-2rem))] rounded-[18px] border border-border bg-background p-3.5 shadow-lift motion-safe:animate-rise"
        >
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emphasis text-[10px] font-bold text-white">
              CC
            </span>
            <p className="flex-1 text-[13px] font-bold">
              The team <span className="font-medium text-muted-foreground">replied</span>
            </p>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setPreview(null)}
              className="-mt-1 -mr-1 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed">{preview}</p>
          <button
            type="button"
            onClick={() => toggle(true)}
            className="mt-2.5 h-9 rounded-full border border-primary/40 bg-surface-blush px-4 text-[13px] font-bold text-emphasis hover:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Reply
          </button>
        </div>
      )}

      {!open && (
        <button
          ref={buttonRef}
          type="button"
          aria-label={unread ? `Open chat, ${unread} new ${unread === 1 ? "reply" : "replies"}` : "Chat with us (drag to move)"}
          aria-expanded={false}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            dragStart.current = null;
            setDrag(null);
          }}
          onClick={() => {
            if (justDragged.current) {
              justDragged.current = false;
              return;
            }
            toggle();
          }}
          style={{ ...buttonStyle, width: SIZE, height: SIZE }}
          className={cn(
            "fixed z-50 flex touch-none items-center justify-center rounded-full bg-(--btn-bg) text-(--btn-fg) shadow-[0_0_0_3px_var(--background),0_0_0_5px_var(--cc-gold),0_10px_28px_rgb(48_42_41/0.22)] select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
            drag ? "scale-105 cursor-grabbing" : "cursor-grab transition-[left,right,top,bottom,transform,opacity] duration-300 ease-elegant hover:scale-105",
            pageTyping && !drag && "pointer-events-none scale-75 opacity-0",
          )}
          aria-hidden={pageTyping || undefined}
          tabIndex={pageTyping ? -1 : undefined}
        >
          <MessageCircle className="size-6" aria-hidden="true" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-emphasis px-1 text-[11px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>
      )}
    </>
  );
}

function BotAvatar() {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-highlight/50 bg-surface-blush">
      <Image src="/images/logo/canvas-creations-cc-mark.png" alt="" width={775} height={533} sizes="20px" className="h-auto w-5" />
    </span>
  );
}

function ChatItem({ item }: { item: Exclude<Item, { kind: "quote-form" } | { kind: "quote" }> }) {
  if (item.kind === "day") {
    return (
      <p className="my-1 flex items-center gap-2.5 text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        {item.label}
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </p>
    );
  }
  if (item.kind === "bot") {
    return (
      <div className="flex max-w-[88%] items-end gap-2">
        <BotAvatar />
        <div className="rounded-2xl rounded-bl-sm bg-surface-blush px-3.5 py-2.5 text-sm leading-relaxed">
          <p className="whitespace-pre-line">{item.answer.text}</p>
          {item.answer.link && (
            <a href={item.answer.link.href} className="mt-1.5 inline-flex items-center gap-1 font-semibold text-emphasis underline underline-offset-4">
              {item.answer.link.label}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    );
  }
  if (item.kind === "visitor") {
    return (
      <div className="max-w-[80%] self-end text-right">
        <p
          className={cn(
            "rounded-2xl rounded-br-sm bg-(--btn-bg) px-3.5 py-2.5 text-left text-sm leading-relaxed whitespace-pre-line text-(--btn-fg)",
            item.pending && "opacity-70",
          )}
        >
          <span className="sr-only">You: </span>
          {item.text}
        </p>
        {item.status && !item.pending && (
          <p className={cn("mt-1 mr-1 inline-flex items-center gap-1 text-[11px]", item.seen ? "text-[#2f6b4c]" : "text-muted-foreground")}>
            {item.seen ? <CheckCheck className="size-3.5" aria-hidden="true" /> : <Check className="size-3.5" aria-hidden="true" />}
            {item.status}
          </p>
        )}
      </div>
    );
  }
  if (item.kind === "with-team") {
    return (
      <p className="mx-auto my-1 inline-flex items-center gap-2 self-center rounded-full border border-highlight/50 bg-surface-ivory px-3 py-1.5 text-xs text-muted-foreground">
        <UsersRound className="size-3.5 text-highlight" aria-hidden="true" />
        Now chatting with the team
      </p>
    );
  }
  if (item.kind === "handover") {
    return (
      <p className="mx-auto my-1 inline-flex items-center gap-2 self-center rounded-full border border-highlight/50 bg-surface-ivory px-3 py-1.5 text-xs text-muted-foreground">
        <Check className="size-3.5 text-highlight" aria-hidden="true" />
        Passed to the team
      </p>
    );
  }
  return (
    <div className="flex max-w-[88%] items-end gap-2">
      <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emphasis text-[10px] font-bold text-white">
        CC
      </span>
      <div>
        <p className="mb-1 text-[11px] text-muted-foreground">The team · {timeOf(item.at)}</p>
        <p className="rounded-2xl rounded-bl-sm border border-highlight/40 bg-surface-ivory px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line">
          <span className="sr-only">The team: </span>
          {item.text}
        </p>
      </div>
    </div>
  );
}

/** "Plan my event": tap an answer, pick a date, or type (the message box answers too). */
function PlanAnswers({
  question,
  onAnswer,
  onTypeInstead,
}: {
  question: { step: PlanStep; options: string[]; input: "text" | "date" | null };
  onAnswer: (text: string) => void;
  onTypeInstead: () => void;
}) {
  const [date, setDate] = useState("");
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return (
    <div className="grid gap-2 pl-9">
      {question.input === "date" && (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!date) return;
            const picked = new Date(`${date}T00:00:00`);
            onAnswer(picked.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "long", year: "numeric" }));
          }}
        >
          <label htmlFor="plan-date" className="sr-only">
            Event date
          </label>
          <input
            id="plan-date"
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 rounded-full border border-border bg-background px-3.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          <button
            type="submit"
            aria-disabled={!date || undefined}
            className="h-10 rounded-full bg-(--btn-bg) px-4 text-[13px] font-semibold text-(--btn-fg) hover:bg-(--btn-hover-bg) focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-disabled:opacity-60"
          >
            Use this date
          </button>
        </form>
      )}
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => (option === "Something else" ? onTypeInstead() : onAnswer(option))}
            className="min-h-9 rounded-full border border-primary/40 bg-background px-3.5 text-[13px] font-semibold text-emphasis transition-colors hover:border-primary hover:bg-surface-blush focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Tab and Shift+Tab wrap around inside the chat while it covers the page. */
function keepFocusInside(e: React.KeyboardEvent, root: HTMLElement | null) {
  if (!root) return;
  const items = [...root.querySelectorAll<HTMLElement>("button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])")].filter(
    (el) => !el.hasAttribute("disabled") && el.getClientRects().length > 0,
  );
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

/** Already handed over: no second form unless they want to change their details. */
function DetailsOnFile({ name, onUpdate }: { name: string | null; onUpdate: () => void }) {
  return (
    <div className="ml-9 rounded-2xl border border-border bg-surface-ivory/60 p-3.5 text-sm">
      <p>
        We have your details{name ? `, ${name.split(/\s+/)[0]}` : ""}. The team will reply here, and by email if you&apos;ve left the page.
      </p>
      <button
        type="button"
        onClick={onUpdate}
        className="mt-2 text-[13px] font-semibold text-emphasis underline decoration-primary/40 underline-offset-4 hover:decoration-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Update my details
      </button>
    </div>
  );
}

function ContactCard({ askDate, onShare }: { askDate: boolean; onShare: (values: ChatContactValues) => Promise<boolean> }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChatContactValues>({
    resolver: zodResolver(chatContactSchema),
    defaultValues: { name: "", contact: "", eventDate: "" },
    shouldFocusError: true,
  });
  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => void (await onShare(values)))}
      className="ml-9 grid gap-3 rounded-2xl border border-border bg-surface-ivory/60 p-3.5"
    >
      <p className="text-sm font-semibold">So the team can reply</p>
      {askDate && (
        <Field data-invalid={errors.eventDate ? true : undefined}>
          <FieldLabel htmlFor="chat-date">Event date</FieldLabel>
          <Input id="chat-date" placeholder="e.g. 14 March 2027" aria-invalid={errors.eventDate ? true : undefined} {...register("eventDate")} />
          {errors.eventDate && <FieldError>{errors.eventDate.message}</FieldError>}
        </Field>
      )}
      <Field data-invalid={errors.name ? true : undefined}>
        <FieldLabel htmlFor="chat-name">Your name</FieldLabel>
        <Input id="chat-name" autoComplete="name" aria-invalid={errors.name ? true : undefined} {...register("name")} />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>
      <Field data-invalid={errors.contact ? true : undefined}>
        <FieldLabel htmlFor="chat-contact">Email or phone</FieldLabel>
        <Input id="chat-contact" autoComplete="email" inputMode="email" aria-invalid={errors.contact ? true : undefined} {...register("contact")} />
        {errors.contact && <FieldError>{errors.contact.message}</FieldError>}
      </Field>
      <Button type="submit" pending={isSubmitting} pendingLabel="Sending…">
        Send to the team
      </Button>
      <p className="text-[11px] leading-snug text-muted-foreground">
        We only use these details to reply about your celebration. You can ask us to delete this chat at any time.
      </p>
    </form>
  );
}
