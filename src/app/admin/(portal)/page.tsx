import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { formatEventDate, formatShortDateTime } from "@/lib/datetime";
import {
  enquiryStatusLabels,
  enquiryStatusSchema,
  enquiryStatuses,
  type EnquiryStatus,
} from "@/lib/enquiry-status";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

export const metadata: Metadata = { title: "Enquiries" };

interface EnquiryListRow {
  id: string;
  name: string;
  event_type: string | null;
  event_date: string | null;
  status: EnquiryStatus;
  created_at: string;
}

export default async function AdminEnquiriesPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const { status: statusParam } = await searchParams;
  const filter = enquiryStatusSchema.safeParse(statusParam);
  const status = filter.success ? filter.data : null;

  const supabase = await createClient();
  let query = supabase
    .from("enquiries")
    .select("id, name, event_type, event_date, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);

  const [{ data, error }, { data: allStatuses }] = await Promise.all([
    query,
    supabase.from("enquiries").select("status"),
  ]);
  if (error) console.error("[admin] enquiry list failed", { code: error.code });

  const enquiries = (data ?? []) as EnquiryListRow[];
  const counts = new Map<string, number>();
  for (const row of allStatuses ?? []) counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
  const total = allStatuses?.length ?? 0;

  const filters: { label: string; href: string; value: EnquiryStatus | null; count: number }[] = [
    { label: "All", href: "/admin", value: null, count: total },
    ...enquiryStatuses.map((value) => ({
      label: enquiryStatusLabels[value],
      href: `/admin?status=${value}`,
      value,
      count: counts.get(value) ?? 0,
    })),
  ];

  return (
    <>
      <h1 className="font-display text-display-md font-medium">
        {status ? `${enquiryStatusLabels[status]} enquiries` : "All enquiries"}
      </h1>

      <nav aria-label="Filter by status" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = f.value === status;
            return (
              <li key={f.label}>
                <Link
                  href={f.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-foreground/35",
                  )}
                >
                  {f.label}
                  <span className={cn("tabular-nums", active ? "opacity-80" : "text-muted-foreground")}>
                    {f.count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {error ? (
        <p role="alert" className="mt-10 text-destructive">
          Enquiries couldn&apos;t be loaded. Please refresh the page.
        </p>
      ) : enquiries.length === 0 ? (
        <p className="mt-10 bg-background p-8 text-center text-muted-foreground">
          {status ? `No ${enquiryStatusLabels[status].toLowerCase()} enquiries.` : "No enquiries yet."}
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border bg-background">
          {enquiries.map((e) => (
            <li key={e.id}>
              <Link
                href={`/admin/enquiries/${e.id}`}
                className="flex flex-col gap-2 px-4 py-4 transition-colors hover:bg-accent sm:flex-row sm:items-center sm:gap-6 sm:px-6"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{e.name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {[e.event_type, e.event_date && formatEventDate(e.event_date)]
                      .filter(Boolean)
                      .join(" · ") || "No event details"}
                  </span>
                </span>
                <span className="flex items-center gap-4 sm:justify-end">
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {formatShortDateTime(e.created_at)}
                  </span>
                  <StatusBadge status={e.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
