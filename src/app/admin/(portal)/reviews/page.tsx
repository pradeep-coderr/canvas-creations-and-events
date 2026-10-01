import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { ReviewStatus } from "@/lib/review";
import { AddReview, ReviewCard, type AdminReview } from "./review-admin";

export const metadata: Metadata = { title: "Reviews" };

const filters = [
  { value: "new", label: "New" },
  { value: "approved", label: "On the website" },
  { value: "hidden", label: "Hidden" },
  { value: "private", label: "Private feedback" },
  { value: "all", label: "All" },
] as const;
type Filter = (typeof filters)[number]["value"];

/**
 * Reviews & feedback from clients. New reviews wait here until an admin
 * approves them; private feedback (the client said no to the website) is
 * listed separately and can't be approved.
 */
export default async function AdminReviewsPage({ searchParams }: PageProps<"/admin/reviews">) {
  await requireAdmin();
  const { show } = await searchParams;
  const filter: Filter = filters.some((f) => f.value === show) ? (show as Filter) : "new";

  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("id, name, email, event_type, rating, message, can_publish, status, source, created_at, approved_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filter === "private") query = query.eq("can_publish", false);
  else if (filter !== "all") query = query.eq("status", filter).eq("can_publish", true);

  const [{ data, error }, { data: all }] = await Promise.all([
    query,
    supabase.from("reviews").select("status, can_publish"),
  ]);
  if (error) console.error("[admin] review list failed", { code: error.code });

  const count = (f: Filter) =>
    (all ?? []).filter((r) =>
      f === "all" ? true : f === "private" ? !r.can_publish : r.can_publish && (r.status as ReviewStatus) === f,
    ).length;
  const reviews = (data ?? []) as AdminReview[];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md font-title">Reviews</h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Reviews and feedback from the website. Nothing appears on the website until you approve it, and only
            reviews whose authors said yes can be shown.
          </p>
        </div>
        <AddReview />
      </div>

      <nav aria-label="Filter reviews" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = f.value === filter;
            return (
              <li key={f.value}>
                <Link
                  href={`/admin/reviews?show=${f.value}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-foreground/35",
                  )}
                >
                  {f.label}
                  <span className={cn("tabular-nums", active ? "opacity-80" : "text-muted-foreground")}>{count(f.value)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {error ? (
        <p role="alert" className="mt-10 text-destructive">
          Reviews couldn&apos;t be loaded. Please refresh the page.
        </p>
      ) : reviews.length === 0 ? (
        <p className="mt-10 bg-background p-8 text-center text-muted-foreground">
          {filter === "new"
            ? "No new reviews. When a client leaves one on the website, it appears here."
            : "Nothing here yet."}
        </p>
      ) : (
        <ul className="mt-8 grid gap-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </ul>
      )}
    </>
  );
}
