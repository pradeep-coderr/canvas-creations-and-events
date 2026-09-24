import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * "← Parent" link. -my-3 py-3 gives a 44px tap target without shifting the
 * layout; it's the way back in an installed iOS app (no browser back button).
 */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href as never}
      className="-my-3 inline-flex items-center gap-2 rounded-sm py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {children}
    </Link>
  );
}
