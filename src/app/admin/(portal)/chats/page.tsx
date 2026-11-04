import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/session";
import { getChatBotContext } from "@/lib/chat/context";
import { createClient } from "@/lib/supabase/server";
import { checkEmailDomains, loadVisitorIndex, viewVisitor } from "@/lib/visitor/admin";
import { ChatInbox, type InboxChat, type InboxFilter, type InboxMessage } from "./inbox";
import type { QuickReply } from "./quick-replies";

export const metadata: Metadata = { title: "Chats" };

const FILTERS: InboxFilter[] = ["open", "unread", "closed"];
/** When this render's data was read (for "on the website now" and times). */
const readAt = () => Date.now();

/**
 * Website chats. The list and the open chat are rendered here; the inbox
 * refreshes itself when a new message arrives (Realtime), and the push alert
 * for a new chat opens /admin/chats?c=<id>.
 */
export default async function AdminChatsPage({ searchParams }: PageProps<"/admin/chats">) {
  await requireAdmin();
  const params = await searchParams;
  const filter: InboxFilter = FILTERS.includes(params.show as InboxFilter) ? (params.show as InboxFilter) : "open";
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const selectedId = typeof params.c === "string" && /^[0-9a-f-]{36}$/i.test(params.c) ? params.c : null;

  const supabase = await createClient();
  const now = readAt();
  const COLUMNS =
    "id, status, name, contact, event_date, topic, handed_over, admin_unread, last_message_at, last_preview, visitor_seen_at, admin_read_at, visitor_read_at, last_email_at, meta, created_at";

  // The list for this filter and search, worked out in the database (any number of chats).
  let list = supabase.from("chat_conversations").select(COLUMNS).order("last_message_at", { ascending: false }).limit(200);
  if (filter === "unread") list = list.gt("admin_unread", 0);
  else list = list.eq("status", filter);
  // Search words: letters, digits, @ . - + and spaces only (safe inside the filter).
  const needle = query.replace(/[^\p{L}\p{N}@.+\- ]/gu, "").trim();
  if (needle) {
    const like = `%${needle}%`;
    list = list.or(`name.ilike.${like},contact.ilike.${like},last_preview.ilike.${like},topic.ilike.${like}`);
  }
  const count = (q: "open" | "closed" | "unread") => {
    const base = supabase.from("chat_conversations").select("id", { count: "exact", head: true });
    return q === "unread" ? base.gt("admin_unread", 0) : base.eq("status", q);
  };

  const [{ data, error }, open, unread, closed, ctx, { data: quick }] = await Promise.all([
    list,
    count("open"),
    count("unread"),
    count("closed"),
    getChatBotContext(),
    supabase.from("chat_quick_replies").select("id, label, body").order("sort_order").order("created_at"),
  ]);
  if (error) console.error("[admin] chat list failed", { code: error.code });
  // Visitor info: "Looks real / Check this / Likely spam" for each chat.
  const index = await loadVisitorIndex(supabase);
  await checkEmailDomains(index, (data ?? []).map((c) => c.contact));
  const withVisitor = (row: Record<string, unknown>): InboxChat => {
    const { meta, ...chat } = row as unknown as InboxChat & { meta: unknown };
    return { ...chat, visitor: viewVisitor(index, { kind: "c", id: chat.id, meta, contact: chat.contact }) };
  };
  const chats = (data ?? []).map(withVisitor);
  const counts = { open: open.count ?? 0, unread: unread.count ?? 0, closed: closed.count ?? 0 };

  // The open chat (also when it isn't in this list, e.g. from a notification link).
  let selected = selectedId ? (chats.find((c) => c.id === selectedId) ?? null) : null;
  if (selectedId && !selected) {
    const { data: one } = await supabase.from("chat_conversations").select(COLUMNS).eq("id", selectedId).maybeSingle();
    if (one) await checkEmailDomains(index, [one.contact]);
    selected = one ? withVisitor(one) : null;
  }
  let messages: InboxMessage[] = [];
  let enquiryId: string | null = null;
  if (selected) {
    const { data: enquiry } = await supabase.from("enquiries").select("id").eq("chat_id", selected.id).maybeSingle();
    enquiryId = enquiry?.id ?? null;
    const { data: rows, error: messagesError } = await supabase
      .from("chat_messages")
      .select("id, sender, body, choice, kind, plan_step, data, created_at")
      .eq("conversation_id", selected.id)
      .order("id", { ascending: true })
      .limit(500);
    if (messagesError) console.error("[admin] chat messages failed", { code: messagesError.code });
    messages = (rows ?? []) as InboxMessage[];
  }

  return (
    <ChatInbox
      chats={chats}
      counts={counts}
      filter={filter}
      query={query}
      selected={selected}
      messages={messages}
      ctx={ctx}
      now={now}
      quickReplies={(quick ?? []) as QuickReply[]}
      away={ctx.away}
      enquiryId={enquiryId}
    />
  );
}
