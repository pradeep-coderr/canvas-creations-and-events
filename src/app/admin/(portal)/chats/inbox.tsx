"use client";

import { Fragment, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bot,
  BotOff,
  Check,
  CheckCheck,
  ClipboardList,
  FilePlus2,
  Info,
  Mail,
  MailOpen,
  MessageCircle,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SearchInput } from "@/components/ui/search-input";
import { playChime, unlockAudioOnInteraction } from "@/lib/admin/alert-sound";
import {
  CHOICE_LABELS,
  PLAN_LABELS,
  PLAN_STEPS,
  type BotAnswer,
  type ChatBotContext,
  type ChatChoice,
  type ChatEvent,
  type PlanStep,
} from "@/lib/chat/bot";
import { chatDayLabel } from "@/lib/chat/dates";
import { botActive, botReplies } from "@/lib/chat/knowledge";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { createEnquiryFromChat, deleteChat, replyToChat, setChatAway, setChatBot, setChatRead, setChatStatus } from "./actions";
import { QuickReplyPicker, fillQuickReply, type QuickReply } from "./quick-replies";
import { QuoteAccepted, QuoteCard, QuoteDetailsCard, QuoteMenu } from "./quote-tools";
import { VerdictBadge, VisitorInfo } from "@/components/admin/visitor-info";
import type { VisitorView } from "@/lib/visitor/assess";
import { asQuote, asQuoteDetails, money } from "@/lib/chat/quote";

export type InboxFilter = "open" | "unread" | "closed";

export interface InboxChat {
  id: string;
  status: "open" | "closed";
  name: string | null;
  contact: string | null;
  event_date: string | null;
  topic: string | null;
  handed_over: boolean;
  admin_unread: number;
  last_message_at: string;
  last_preview: string | null;
  visitor_seen_at: string | null;
  admin_read_at: string | null;
  visitor_read_at: string | null;
  last_email_at: string | null;
  created_at: string;
  /** Where they are, their device and visit, and the verdict (null for older chats). */
  visitor: VisitorView | null;
}

export interface InboxMessage {
  id: number;
  sender: "visitor" | "team" | "system";
  body: string;
  choice: ChatChoice | null;
  kind: ChatEvent | null;
  plan_step: PlanStep | null;
  /** A quote's items, or the visitor's quote details. */
  data: unknown;
  created_at: string;
}

const FILTER_LABELS: Record<InboxFilter, string> = { open: "Open", unread: "Unread", closed: "Closed" };
/** A fallback when Realtime isn't connected: refresh the inbox this often. */
const REFRESH_MS = 20_000;

const time = (iso: string, now: number) => {
  const d = new Date(iso);
  const sameDay = new Date(now).toDateString() === d.toDateString();
  return sameDay
    ? d.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
};
const initials = (name: string | null) =>
  name
    ? name
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "V";
const visitorName = (c: InboxChat) => c.name ?? `Visitor ${c.id.slice(0, 3).toUpperCase()}`;

function presence(c: InboxChat, now: number) {
  if (c.status === "closed") return "Closed";
  const onSite = c.visitor_seen_at && now - new Date(c.visitor_seen_at).getTime() < 60_000;
  if (onSite) return "On the website now";
  if (!c.handed_over) return "Browsing the menu · no contact details yet";
  return c.contact?.includes("@") ? "Left the page · replies also go by email" : "Left the page · call or text them back";
}

/** Where a filter, search or chat link goes, keeping the others. */
function href(filter: InboxFilter, query: string, chatId?: string | null) {
  const p = new URLSearchParams();
  if (filter !== "open") p.set("show", filter);
  if (query) p.set("q", query);
  if (chatId) p.set("c", chatId);
  const s = p.toString();
  return s ? `/admin/chats?${s}` : "/admin/chats";
}

export function ChatInbox({
  chats,
  counts,
  filter,
  query,
  selected,
  messages,
  ctx,
  now,
  quickReplies,
  away,
  enquiryId,
}: {
  chats: InboxChat[];
  counts: Record<InboxFilter, number>;
  filter: InboxFilter;
  query: string;
  selected: InboxChat | null;
  messages: InboxMessage[];
  ctx: ChatBotContext;
  now: number;
  quickReplies: QuickReply[];
  away: boolean;
  /** The enquiry the open chat became, if any. */
  enquiryId: string | null;
}) {
  const router = useRouter();
  const [live, setLive] = useState(false);
  const [search, setSearch] = useState(query);
  /** A visitor's message that arrived while the inbox is open. */
  const [toast, setToast] = useState<{ chatId: string; name: string; text: string } | null>(null);
  const [awayPending, startAway] = useTransition();
  const [awayError, setAwayError] = useState<string | null>(null);
  const names = useRef(new Map<string, string>());
  useEffect(() => {
    names.current = new Map(chats.map((c) => [c.id, visitorName(c)]));
  }, [chats]);
  const selectedIdRef = useRef(selected?.id);
  useEffect(() => {
    selectedIdRef.current = selected?.id;
  }, [selected?.id]);

  // The chime needs one click or key press on the page first (browser rule).
  useEffect(() => unlockAudioOnInteraction(), []);

  // The tab shows how many chats are waiting: "(2) Chats".
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\) /, "");
    document.title = counts.unread ? `(${counts.unread}) ${base}` : base;
    return () => {
      document.title = document.title.replace(/^\(\d+\) /, "");
    };
  }, [counts.unread]);

  // New messages arrive live (Realtime, admins only by RLS); the inbox re-renders on the server.
  useEffect(() => {
    const supabase = createClient();
    let hide: number | undefined;
    let cancelled = false;
    const channel = supabase
      // Its own topic each time: a channel still closing from the last visit is never reused.
      .channel(`admin-chats:${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        router.refresh();
        const row = payload.new as { conversation_id?: string; sender?: string; body?: string; choice?: string | null; plan_step?: string | null };
        // A chime for what a visitor typed, not for every menu tap.
        if (row.sender !== "visitor" || !row.conversation_id || row.choice || row.plan_step) return;
        void playChime();
        // No card for the chat that's already open: the message appears in it.
        if (row.conversation_id === selectedIdRef.current) return;
        setToast({ chatId: row.conversation_id, name: names.current.get(row.conversation_id) ?? "A visitor", text: row.body ?? "" });
        window.clearTimeout(hide);
        hide = window.setTimeout(() => setToast(null), 8000);
      })
    // Realtime checks the database's rules with the admin's own login, so it
    // must have the session before subscribing (otherwise events arrive empty).
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) void supabase.realtime.setAuth(data.session.access_token);
      channel.subscribe((status) => setLive(status === "SUBSCRIBED"));
    });
    const id = window.setInterval(() => document.visibilityState === "visible" && router.refresh(), REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.clearTimeout(hide);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <div className="-mt-4 sm:-mt-6">
      <div className="flex h-[calc(100dvh-13rem)] min-h-128 2xl:h-[calc(100dvh-10.25rem)] overflow-hidden rounded-2xl border border-border bg-background shadow-xs">
        {/* Conversation list (phones: only when no chat is open) */}
        <aside aria-label="Chats" className={cn("flex w-full shrink-0 flex-col border-r border-border lg:w-84", selected && "max-lg:hidden")}>
          <div className="space-y-3 p-4 pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h1 className="font-display text-display-sm font-title">Chats</h1>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground" title={live ? "New messages appear straight away" : "Checking every 20 seconds"}>
                  <span aria-hidden="true" className={cn("size-2 rounded-full", live ? "bg-[#3f9d6b]" : "bg-border")} />
                  {live ? "Live" : "Connecting…"}
                </span>
              </div>
              {/* What visitors see in the chat header. */}
              <button
                type="button"
                role="switch"
                aria-checked={!away}
                aria-label="Chat status: online"
                title={away ? "Visitors see: Away right now · we'll reply soon" : "Visitors see: We're online"}
                aria-disabled={awayPending || undefined}
                onClick={() =>
                  !awayPending &&
                  startAway(async () => {
                    const result = await setChatAway(!away);
                    setAwayError(result.ok ? null : result.error);
                    router.refresh();
                  })
                }
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-disabled:opacity-60",
                  away ? "border-highlight/50 bg-surface-ivory text-[#8a6427]" : "border-[#cfe5d8] bg-[#eef6f1] text-[#2f6b4c]",
                )}
              >
                <span aria-hidden="true" className={cn("size-2.5 rounded-full", away ? "bg-highlight" : "bg-[#3f9d6b]")} />
                {away ? "Away" : "Online"}
              </button>
            </div>
            <p role="alert" className="text-xs font-medium text-destructive empty:hidden">
              {awayError ?? ""}
            </p>
            <form action="/admin/chats" role="search">
              {filter !== "open" && <input type="hidden" name="show" value={filter} />}
              <label htmlFor="chat-search" className="sr-only">
                Search chats
              </label>
              <SearchInput
                id="chat-search"
                name="q"
                value={search}
                onValueChange={setSearch}
                onClear={() => router.push(href(filter, ""), { scroll: false })}
                placeholder="Search name, email or message"
              />
            </form>
            <nav aria-label="Filter chats" className="flex gap-1 rounded-lg bg-surface-ivory p-1">
              {(Object.keys(FILTER_LABELS) as InboxFilter[]).map((f) => (
                <Link
                  key={f}
                  href={href(f, query)}
                  aria-current={f === filter ? "page" : undefined}
                  className={cn(
                    "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md text-[13px] font-semibold transition-colors",
                    f === filter ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {FILTER_LABELS[f]}
                  <span className="text-muted-foreground tabular-nums">{counts[f]}</span>
                </Link>
              ))}
            </nav>
          </div>
          <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
            {chats.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                {query ? "No chats match that search." : filter === "closed" ? "No closed chats." : "No chats here yet. They'll appear the moment a visitor starts one."}
              </li>
            )}
            {chats.map((c) => (
              <li key={c.id}>
                <Link
                  href={href(filter, query, c.id)}
                  scroll={false}
                  aria-current={c.id === selected?.id ? "true" : undefined}
                  className={cn(
                    "flex gap-3 rounded-xl px-2.5 py-3 transition-colors hover:bg-surface-blush/60",
                    c.id === selected?.id && "bg-surface-blush",
                  )}
                >
                  <Avatar chat={c} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={cn("truncate text-sm", c.admin_unread ? "font-extrabold" : "font-semibold")}>{visitorName(c)}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{time(c.last_message_at, now)}</span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] text-muted-foreground">{c.last_preview ?? "Started a chat"}</span>
                      {c.admin_unread > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emphasis px-1.5 text-[11px] font-bold text-white">
                          {c.admin_unread}
                          <span className="sr-only"> unread</span>
                        </span>
                      )}
                    </span>
                    {(c.topic || (c.visitor && c.visitor.assessment.verdict !== "real")) && (
                      <span className="mt-1.5 flex flex-wrap gap-1.5">
                        {c.topic && (
                          <span className="inline-block rounded-full border border-primary/30 bg-surface-blush px-2 py-0.5 text-[11px] font-semibold text-emphasis">
                            {c.topic}
                          </span>
                        )}
                        <VerdictBadge assessment={c.visitor?.assessment} quietWhenReal />
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {selected ? (
          <Conversation
            key={selected.id}
            chat={selected}
            messages={messages}
            ctx={ctx}
            now={now}
            backHref={href(filter, query)}
            quickReplies={quickReplies}
            enquiryId={enquiryId}
          />
        ) : (
          <div className="hidden flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground lg:flex">
            <MessageCircle className="size-10 text-primary" aria-hidden="true" />
            <p className="font-display text-display-sm text-foreground">Choose a chat</p>
            <p className="max-w-xs text-sm">New chats show up here straight away, and you get a notification when a visitor asks for the team.</p>
          </div>
        )}
      </div>

      {toast && (
        <div
          role="status"
          className="fixed top-24 right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] gap-3 rounded-2xl bg-foreground p-3.5 text-background shadow-lift motion-safe:animate-rise sm:right-8"
        >
          <Bell className="mt-0.5 size-5 shrink-0 text-highlight" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">New message · {toast.name}</p>
            <p className="truncate text-[13px] opacity-80">{toast.text}</p>
          </div>
          <Link
            href={href(filter, query, toast.chatId)}
            scroll={false}
            onClick={() => setToast(null)}
            className="self-center rounded-lg bg-background/15 px-3 py-1.5 text-xs font-semibold hover:bg-background/25 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Open
          </Link>
          <button type="button" aria-label="Dismiss" onClick={() => setToast(null)} className="-mr-1 self-start rounded-full p-1 opacity-70 hover:opacity-100">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

function Avatar({ chat, size = "md" }: { chat: InboxChat; size?: "md" | "lg" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
        size === "lg" ? "size-11" : "size-10",
        chat.admin_unread > 0 ? "bg-emphasis text-white" : "border border-primary/30 bg-surface-blush text-emphasis",
      )}
    >
      {initials(chat.name)}
    </span>
  );
}

function Conversation({
  chat,
  messages,
  ctx,
  now,
  backHref,
  quickReplies,
  enquiryId,
}: {
  chat: InboxChat;
  messages: InboxMessage[];
  ctx: ChatBotContext;
  now: number;
  backHref: string;
  quickReplies: QuickReply[];
  enquiryId: string | null;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const replyRef = useRef<HTMLTextAreaElement>(null);
  /** Grow the reply box with its text (up to about six lines). */
  const fit = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight + 2, 160)}px`;
  };
  const [error, setError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();
  const [updating, startUpdating] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  /** Where focus goes back to after the delete dialog: the button or the "More" menu that opened it. */
  const deleteFrom = useRef<HTMLElement | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  /** Smaller screens: the visitor's details open in a side sheet. */
  const [detailsOpen, setDetailsOpen] = useState(false);
  /** "Mark unread" was pressed: leave this chat unread until it's opened again. */
  const keepUnread = useRef(false);
  const [creating, startCreating] = useTransition();
  const [enquiryError, setEnquiryError] = useState<string | null>(null);
  const createEnquiry = () =>
    !creating &&
    startCreating(async () => {
      const result = await createEnquiryFromChat(chat.id);
      if (!result.ok) setEnquiryError(result.error);
      else {
        setEnquiryError(null);
        router.refresh();
      }
    });
  const canCreate = Boolean(chat.name && chat.contact);

  // The newest message on screen: reading marks the chat read up to it.
  const newestAt = messages[messages.length - 1]?.created_at;
  // An open chat counts as read only while it's really on screen (not in a
  // background tab), so the visitor's "Seen by the team" is honest.
  useEffect(() => {
    const markRead = () => {
      if (chat.admin_unread > 0 && !keepUnread.current && document.visibilityState === "visible") {
        void setChatRead(chat.id, true, newestAt).then(() => router.refresh());
      }
    };
    markRead();
    document.addEventListener("visibilitychange", markRead);
    return () => document.removeEventListener("visibilitychange", markRead);
  }, [chat.id, chat.admin_unread, newestAt, router]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  const send = () => {
    const body = draft.trim();
    if (!body || sending) return;
    startSending(async () => {
      const result = await replyToChat(chat.id, body);
      if (result.ok) {
        keepUnread.current = false;
        setDraft("");
        if (replyRef.current) replyRef.current.style.height = "";
        setError(null);
        router.refresh();
      } else setError(result.error);
    });
  };
  /** A quick reply goes into the box, filled in for this chat, ready to edit. */
  const pickQuickReply = (body: string) => {
    setDraft(fillQuickReply(body, chat, ctx.priceFrom));
    window.setTimeout(() => {
      fit(replyRef.current);
      replyRef.current?.focus();
    }, 0);
  };
  const markUnread = () => {
    if (updating) return;
    keepUnread.current = true;
    update(() => setChatRead(chat.id, false));
  };
  const update = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startUpdating(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error ?? "That didn't work.");
      router.refresh();
    });

  const firstName = chat.name?.split(/\s+/)[0] ?? "the visitor";
  // What the bot said to the visitor (the same rule as their chat window).
  const shared = messages.map((m) => ({ ...m, planStep: m.plan_step }));
  const replies = botReplies(shared, ctx);
  const botOn = botActive(shared);
  // "Plan my event" and the quote form: the latest answer to each question.
  const answers = new Map<PlanStep, string>();
  for (const m of messages) {
    if (m.plan_step) answers.set(m.plan_step, m.body);
    if (m.kind === "quote_details") for (const [k, v] of Object.entries(asQuoteDetails(m.data))) answers.set(k as PlanStep, v);
  }
  const plan = PLAN_STEPS.flatMap((step) => (answers.has(step) ? [[PLAN_LABELS[step], answers.get(step)!] as const] : []));
  // Quotes: the latest can be accepted; earlier ones were replaced.
  const quotes = messages.filter((m) => m.kind === "quote");
  const latestQuote = quotes.at(-1);
  const latestQuoteData = latestQuote ? asQuote(latestQuote.data) : null;
  const acceptedIds = new Set(
    messages.filter((m) => m.kind === "quote_accept").map((m) => Number((m.data as { quoteId?: unknown } | null)?.quoteId)),
  );
  const quoteState = (quoteId: number) => (acceptedIds.has(quoteId) ? "accepted" : quoteId === latestQuote?.id ? "waiting" : "replaced");
  const quoteTotals = new Map(quotes.map((q) => [q.id, asQuote(q.data)?.total ?? null]));
  // Your last reply: seen in the chat, emailed, or delivered (waiting to be read).
  const lastTeam = [...messages].reverse().find((m) => m.sender === "team");
  const lastTeamStatus = lastTeam
    ? chat.visitor_read_at && new Date(chat.visitor_read_at) >= new Date(lastTeam.created_at)
      ? "seen"
      : chat.last_email_at && new Date(chat.last_email_at) >= new Date(lastTeam.created_at)
        ? "emailed"
        : "delivered"
    : null;

  const details = (
    <>
          <dl className="space-y-3 text-sm">
            {[
              ["Name", chat.name ?? "Not given yet"],
              ["Contact", chat.contact ?? "Not given yet"],
              ["Event date", chat.event_date ?? "Not given"],
              ["Asked about", chat.topic ?? "—"],
              ["Started", new Date(chat.created_at).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 font-semibold wrap-break-word">
                  {label === "Contact" && chat.contact ? (
                    <a
                      href={chat.contact.includes("@") ? `mailto:${chat.contact}` : `tel:${chat.contact.replace(/[^\d+]/g, "")}`}
                      className="underline decoration-primary/40 underline-offset-4 hover:text-emphasis"
                    >
                      {chat.contact}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-border pt-5">
            <p className="mb-3 text-eyebrow font-semibold text-emphasis uppercase">Visitor</p>
            <VisitorInfo view={chat.visitor} />
          </div>
          <div className="border-t border-border pt-5">
            {enquiryId ? (
              <Button asChild variant="outline" className="w-full">
                <Link href={`/admin/enquiries/${enquiryId}`}>
                  <ClipboardList data-icon="inline-start" />
                  View enquiry
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  className="w-full"
                  pending={creating}
                  pendingLabel="Creating…"
                  aria-disabled={!canCreate || undefined}
                  onClick={() => canCreate && createEnquiry()}
                >
                  <FilePlus2 data-icon="inline-start" />
                  Create enquiry
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  {canCreate
                    ? "Adds it to Enquiries and the Calendar, with the plan and their messages."
                    : "Available once they've shared a name and an email or phone number."}
                </p>
              </>
            )}
            <p role="alert" className="mt-2 text-xs font-medium text-destructive empty:hidden">
              {enquiryError ?? ""}
            </p>
          </div>
          {latestQuote && latestQuoteData && (
            <div className="border-t border-border pt-5">
              <p className="text-eyebrow font-semibold text-emphasis uppercase">Quote</p>
              <p className="mt-2 flex items-center justify-between gap-2 text-sm">
                <span className="text-lg font-bold tabular-nums">{money(latestQuoteData.total)}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-bold",
                    quoteState(latestQuote.id) === "accepted" ? "bg-[#eef6f1] text-[#2f6b4c]" : "bg-surface-blush text-emphasis",
                  )}
                >
                  {quoteState(latestQuote.id) === "accepted" ? "Accepted" : "Waiting for them"}
                </span>
              </p>
              {latestQuoteData.deposit !== null && <p className="mt-1 text-xs text-muted-foreground">Deposit {money(latestQuoteData.deposit)}</p>}
            </div>
          )}
          {plan.length > 0 && (
            <div className="border-t border-border pt-5">
              <p className="text-eyebrow font-semibold text-emphasis uppercase">Event plan</p>
              <dl className="mt-3 space-y-3 text-sm">
                {plan.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 font-semibold wrap-break-word">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
    </>
  );

  return (
    <>
      <section aria-label={`Chat with ${visitorName(chat)}`} className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-3 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link href={backHref} scroll={false} aria-label="Back to chats" className="flex size-11 items-center justify-center rounded-full hover:bg-muted lg:hidden">
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
            <div className="shrink-0 max-sm:hidden">
              <Avatar chat={{ ...chat, admin_unread: 1 }} size="lg" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold">{visitorName(chat)}</p>
              <p className="truncate text-xs text-muted-foreground">{presence(chat, now)}</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5 sm:gap-2">
            {/* The bot for this chat: off while you talk to them, back on when you're done. */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              role="switch"
              aria-checked={botOn}
              aria-disabled={updating || undefined}
              title={botOn ? "The bot answers this visitor's questions. Turn it off before you reply." : "The bot is quiet in this chat. Turn it back on when you're done."}
              onClick={() => !updating && update(() => setChatBot(chat.id, !botOn))}
              className={cn(botOn ? "border-[#cfe5d8] bg-[#eef6f1] text-[#2f6b4c] hover:bg-[#e3f0e8]" : "text-muted-foreground")}
            >
              {botOn ? <Bot data-icon="inline-start" /> : <BotOff data-icon="inline-start" />}
              {botOn ? "Bot on" : "Bot off"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="max-2xl:hidden"
              aria-disabled={updating || undefined}
              onClick={markUnread}
            >
              Mark unread
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="max-sm:hidden"
              aria-disabled={updating || undefined}
              onClick={() => !updating && update(() => setChatStatus(chat.id, chat.status === "closed" ? "open" : "closed"))}
            >
              {chat.status === "closed" ? <RotateCcw data-icon="inline-start" /> : <Check data-icon="inline-start" />}
              {chat.status === "closed" ? "Reopen" : "Close chat"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="xl:hidden"
              aria-label="Visitor details"
              title="Details and enquiry"
              onClick={() => setDetailsOpen(true)}
            >
              <Info />
            </Button>
            <Button
              ref={deleteRef}
              type="button"
              variant="outline"
              size="icon-sm"
              className="max-sm:hidden"
              aria-label="Delete chat"
              title="Delete chat"
              onClick={() => {
                deleteFrom.current = deleteRef.current;
                setConfirmDelete(true);
              }}
            >
              <Trash2 />
            </Button>
            {/* Smaller screens: the actions that don't fit in the header. */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button ref={moreRef} type="button" variant="outline" size="icon-sm" className="2xl:hidden" aria-label="More actions">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-md p-1 shadow-soft">
                <DropdownMenuItem className="min-h-11" disabled={updating} onSelect={markUnread}>
                  <MailOpen aria-hidden="true" /> Mark unread
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="min-h-11 sm:hidden"
                  disabled={updating}
                  onSelect={() => update(() => setChatStatus(chat.id, chat.status === "closed" ? "open" : "closed"))}
                >
                  {chat.status === "closed" ? <RotateCcw aria-hidden="true" /> : <Check aria-hidden="true" />}
                  {chat.status === "closed" ? "Reopen chat" : "Close chat"}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="sm:hidden" />
                <DropdownMenuItem
                  className="min-h-11 sm:hidden"
                  variant="destructive"
                  onSelect={() => {
                    deleteFrom.current = moreRef.current;
                    setConfirmDelete(true);
                  }}
                >
                  <Trash2 aria-hidden="true" /> Delete chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ConfirmDialog
            open={confirmDelete}
            onOpenChange={setConfirmDelete}
            title="Delete this chat?"
            description={`The whole conversation with ${visitorName(chat)} is removed for good, for you and for them. Use this for spam or tests, or when someone asks for their chat to be deleted.`}
            confirmLabel="Delete chat"
            pendingLabel="Deleting…"
            destructive
            returnFocus={deleteFrom}
            onConfirm={async () => {
              const result = await deleteChat(chat.id);
              if (!result.ok) return result.error;
              router.push(backHref, { scroll: false });
            }}
          />
        </header>

        <div ref={listRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto bg-surface-ivory/40 px-4 py-5 sm:px-6">
          {messages.map((m, i) => {
            const day = chatDayLabel(m.created_at, now);
            const newDay = i === 0 || chatDayLabel(messages[i - 1].created_at, now) !== day;
            return (
              <Fragment key={m.id}>
                {newDay && (
                  <p className="my-1 flex items-center gap-2.5 text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
                    <span aria-hidden="true" className="h-px flex-1 bg-border" />
                    {day}
                    <span aria-hidden="true" className="h-px flex-1 bg-border" />
                  </p>
                )}
                <Message
                  message={m}
                  bot={replies.get(m.id)}
                  now={now}
                  status={m.id === lastTeam?.id ? lastTeamStatus : null}
                  quoteState={m.kind === "quote" ? quoteState(m.id) : undefined}
                  acceptedTotal={
                    m.kind === "quote_accept" ? (quoteTotals.get(Number((m.data as { quoteId?: unknown } | null)?.quoteId)) ?? null) : undefined
                  }
                />
              </Fragment>
            );
          })}
        </div>

        <form
          className="border-t border-border p-3 sm:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label htmlFor="chat-reply" className="sr-only">
            Reply to {visitorName(chat)}
          </label>
          <QuickReplyPicker variant="row" replies={quickReplies} onPick={pickQuickReply} />
          <div className="flex items-end gap-2">
            <QuickReplyPicker variant="button" replies={quickReplies} onPick={pickQuickReply} />
            <QuoteMenu chatId={chat.id} lastQuote={latestQuoteData} onError={setError} />
            <textarea
              ref={replyRef}
              id="chat-reply"
              rows={1}
              value={draft}
              maxLength={1000}
              onChange={(e) => {
                setDraft(e.target.value);
                fit(e.target);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Reply to ${firstName}…`}
              className="max-h-40 min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-border bg-surface-ivory px-3.5 py-2.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            {/* Phones: just the arrow, so the reply box keeps its room beside the quick-reply and quote buttons. */}
            <Button type="submit" pending={sending} pendingLabel="Sending…" aria-label="Send" className="shrink-0 max-sm:size-11 max-sm:px-0">
              <span className="max-sm:sr-only">Send</span>
              <ArrowRight data-icon="inline-end" className="max-sm:m-0" />
            </Button>
          </div>
          <p role="alert" className="mt-2 text-sm font-medium text-destructive empty:hidden">
            {error ?? ""}
          </p>
          <p className="mt-2 text-xs text-muted-foreground max-sm:hidden">
            Enter sends, Shift+Enter adds a line. They see it straight away in the chat
            {chat.contact?.includes("@") ? ", and by email if they've left the page." : "."}
          </p>
        </form>
      </section>

      {/* Visitor details: a side panel on large screens, a sheet on smaller ones. */}
      <aside aria-label="Visitor details" className="hidden w-64 shrink-0 space-y-5 overflow-y-auto border-l border-border p-5 xl:block">
        <p className="text-eyebrow font-semibold text-emphasis uppercase">Details</p>
        {details}
      </aside>
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="right" className="w-[min(22rem,100vw)] gap-0 xl:hidden">
          <SheetHeader className="border-b border-border">
            <SheetTitle>{visitorName(chat)}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 space-y-5 overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{details}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function Message({
  message: m,
  bot,
  now,
  status,
  quoteState,
  acceptedTotal,
}: {
  message: InboxMessage;
  bot: BotAnswer | undefined;
  now: number;
  /** Your last reply only: seen / emailed / delivered. */
  status?: "seen" | "emailed" | "delivered" | null;
  /** A quote: accepted, waiting, or replaced by a newer one. */
  quoteState?: "accepted" | "waiting" | "replaced";
  /** "Accepted the quote": that quote's total. */
  acceptedTotal?: number | null;
}) {
  const at = time(m.created_at, now);
  const quote = m.kind === "quote" ? asQuote(m.data) : null;
  if (m.kind === "bot_off" || m.kind === "bot_on") {
    return (
      <p className="my-1 inline-flex items-center gap-1.5 self-center rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
        {m.kind === "bot_off" ? <BotOff className="size-3.5" aria-hidden="true" /> : <Bot className="size-3.5" aria-hidden="true" />}
        {m.kind === "bot_off" ? "Bot turned off · visitor sees “Now chatting with the team”" : "Bot turned back on"} · {at}
      </p>
    );
  }
  if (m.sender === "system") {
    return (
      <p className="my-1 self-center rounded-full border border-highlight/50 bg-surface-ivory px-3 py-1 text-center text-xs text-muted-foreground">
        {m.body} · {at}
      </p>
    );
  }
  if (m.sender === "team") {
    return (
      <div className={cn("self-end text-right", quote ? "w-full max-w-80" : "max-w-[85%] sm:max-w-[72%]")}>
        {quote ? (
          <QuoteCard quote={quote} state={quoteState ?? "waiting"} />
        ) : (
          <p className="rounded-2xl rounded-br-sm bg-(--btn-bg) px-3.5 py-2.5 text-left text-sm leading-relaxed whitespace-pre-line text-(--btn-fg)">
            {m.kind === "quote_form" && <span className="block text-[11px] font-semibold tracking-wide uppercase opacity-80">Quote form sent</span>}
            {m.body}
          </p>
        )}
        <p className={cn("mt-1 mr-1 inline-flex items-center gap-1 text-[11px]", status === "seen" ? "text-[#2f6b4c]" : "text-muted-foreground")}>
          {status === "seen" && <CheckCheck className="size-3.5" aria-hidden="true" />}
          {status === "emailed" && <Mail className="size-3.5" aria-hidden="true" />}
          {status === "delivered" && <Check className="size-3.5" aria-hidden="true" />}
          You · {at}
          {status === "seen" ? " · Seen" : status === "emailed" ? " · Sent by email" : status === "delivered" ? " · Delivered" : ""}
        </p>
      </div>
    );
  }
  if (m.kind === "quote_details" || m.kind === "quote_accept") {
    return (
      <div className="max-w-[85%] self-start sm:max-w-[72%]">
        {m.kind === "quote_details" ? <QuoteDetailsCard details={asQuoteDetails(m.data)} /> : <QuoteAccepted total={acceptedTotal ?? null} />}
        <p className="mt-1 ml-1 text-[11px] text-muted-foreground">{at}</p>
      </div>
    );
  }
  return (
    <>
      <div className="max-w-[85%] self-start sm:max-w-[72%]">
        <p className="rounded-2xl rounded-bl-sm border border-border bg-background px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line">
          {m.choice ? (
            <>
              <span className="text-xs text-muted-foreground">Chose </span>
              {CHOICE_LABELS[m.choice]}
            </>
          ) : m.plan_step ? (
            <>
              <span className="block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{PLAN_LABELS[m.plan_step]}</span>
              {m.body}
            </>
          ) : (
            m.body
          )}
        </p>
        <p className="mt-1 ml-1 text-[11px] text-muted-foreground">{at}</p>
      </div>
      {bot && (
        <p className="max-w-[85%] self-end rounded-2xl sm:max-w-[72%] rounded-br-sm bg-muted px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
          <span className="block text-[11px] font-semibold tracking-wide uppercase" title="Rebuilt from the website's current prices and FAQs">Bot answer</span>
          {bot.text}
        </p>
      )}
    </>
  );
}
