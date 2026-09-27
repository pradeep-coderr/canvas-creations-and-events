import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown by Next.js while an admin page loads its data (navigating between
 * Enquiries, Content lists, the Media library, Design…). Shaped like a page
 * heading and a list, so the page doesn't jump when the content arrives.
 * Admin only: the public site never loads this.
 */
export default function AdminLoading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-10 w-56 max-w-full" />
      <Skeleton className="mt-4 h-5 w-full max-w-xl" />
      <div className="mt-10 grid gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border pb-4">
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
            <Skeleton className="hidden h-11 w-28 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
