import Link from "next/link";

/** Shown inside the admin shell for unknown or malformed enquiry ids. */
export default function AdminNotFound() {
  return (
    <div className="bg-background p-8 text-center sm:p-12">
      <h1 className="font-display text-display-sm font-medium">Enquiry not found</h1>
      <p className="mt-3 text-muted-foreground">It may have been removed, or the link is incorrect.</p>
      <Link
        href="/admin"
        className="mt-6 inline-block text-sm font-semibold underline decoration-highlight/70 underline-offset-4 hover:text-primary"
      >
        Back to all enquiries
      </Link>
    </div>
  );
}
