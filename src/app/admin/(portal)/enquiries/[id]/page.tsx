import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { formatDateTime, formatEventDate } from "@/lib/datetime";
import type { EnquiryStatus } from "@/lib/enquiry-status";
import { createClient } from "@/lib/supabase/server";
import { VisitorInfo } from "@/components/admin/visitor-info";
import { checkEmailDomains, loadVisitorIndex, viewVisitor } from "@/lib/visitor/admin";
import { StatusBadge } from "../../status-badge";
import { StatusForm } from "./status-form";

export const metadata: Metadata = { title: "Enquiry" };

interface EnquiryRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  event_type: string | null;
  event_date: string | null;
  venue: string | null;
  message: string;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
  source: "website" | "chat";
  chat_id: string | null;
  meta: unknown;
}

export default async function AdminEnquiryPage({ params }: PageProps<"/admin/enquiries/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select("id, name, email, phone, event_type, event_date, venue, message, status, created_at, updated_at, source, chat_id, meta")
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("[admin] enquiry load failed", { id, code: error.code });
  if (!data) notFound();
  const e = data as EnquiryRow;

  // Visitor info: the form's own, or (for an enquiry made from a chat) the chat's.
  const index = await loadVisitorIndex(supabase);
  await checkEmailDomains(index, [e.email]);
  let visitor = viewVisitor(index, { kind: "e", id: e.id, meta: e.meta, contact: e.email ?? e.phone, phone: e.phone, text: e.message });
  if (!visitor && e.chat_id) {
    const { data: chat } = await supabase.from("chat_conversations").select("id, meta, contact").eq("id", e.chat_id).maybeSingle();
    if (chat) await checkEmailDomains(index, [chat.contact]);
    if (chat) visitor = viewVisitor(index, { kind: "c", id: chat.id, meta: chat.meta, contact: chat.contact });
  }

  const details: [label: string, value: React.ReactNode][] = [
    ["Email", e.email ? <a key="email" href={`mailto:${e.email}`} className="underline decoration-primary/40 underline-offset-4 hover:text-primary">{e.email}</a> : null],
    ["Phone", e.phone ? <a key="phone" href={`tel:${e.phone.replace(/[^\d+]/g, "")}`} className="underline decoration-primary/40 underline-offset-4 hover:text-primary">{e.phone}</a> : null],
    ["Event type", e.event_type],
    ["Event date", e.event_date ? formatEventDate(e.event_date) : null],
    ["Venue", e.venue],
    [
      "From",
      e.source === "chat" ? (
        e.chat_id ? (
          <Link key="from" href={`/admin/chats?c=${e.chat_id}`} className="underline decoration-primary/40 underline-offset-4 hover:text-primary">
            A website chat (open it)
          </Link>
        ) : (
          "A website chat (since deleted)"
        )
      ) : (
        "The enquiry form"
      ),
    ],
    ["Received", formatDateTime(e.created_at)],
    ["Last updated", formatDateTime(e.updated_at)],
    ["Reference", <span key="ref" className="font-mono text-sm break-all">{e.id}</span>],
  ];

  return (
    <>
      <Link
        href="/admin"
        // -my-3 py-3: a 44px tap target (the only way back in an installed
        // iOS app, which has no browser back button) without shifting layout.
        className="-my-3 inline-flex items-center gap-2 rounded-sm py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All enquiries
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <h1 className="font-display text-display-md font-title break-words">{e.name}</h1>
        <StatusBadge status={e.status} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <section aria-labelledby="details-title" className="bg-background p-6 sm:p-8 lg:col-span-8">
          <h2 id="details-title" className="text-eyebrow font-semibold text-emphasis uppercase">
            Details
          </h2>
          <dl className="mt-4 divide-y divide-border">
            {details.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-semibold text-muted-foreground">{label}</dt>
                <dd className="break-words sm:col-span-2">{value ?? <span className="text-muted-foreground">—</span>}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-10 text-eyebrow font-semibold text-emphasis uppercase">Message</h2>
          <p className="mt-4 border-l-2 border-primary bg-surface-ivory px-4 py-3 break-words whitespace-pre-wrap">
            {e.message}
          </p>
        </section>

        <aside aria-labelledby="status-title" className="self-start bg-background p-6 sm:p-8 lg:col-span-4">
          <h2 id="status-title" className="text-eyebrow font-semibold text-emphasis uppercase">
            Status
          </h2>
          <StatusForm id={e.id} status={e.status} />
          {e.email ? (
            <a
              href={`mailto:${e.email}`}
              className="mt-6 block text-sm font-semibold underline decoration-primary/40 underline-offset-4 hover:text-primary"
            >
              Reply by email
            </a>
          ) : e.phone ? (
            <a
              href={`tel:${e.phone.replace(/[^\d+]/g, "")}`}
              className="mt-6 block text-sm font-semibold underline decoration-primary/40 underline-offset-4 hover:text-primary"
            >
              Call {e.phone}
            </a>
          ) : null}

          <h2 className="mt-10 text-eyebrow font-semibold text-emphasis uppercase">Visitor</h2>
          <div className="mt-4">
            <VisitorInfo view={visitor} />
          </div>
        </aside>
      </div>
    </>
  );
}
