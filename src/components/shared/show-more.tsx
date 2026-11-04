"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shows the first `limit` items of a server-rendered list, and a "Show more"
 * button for the rest (long sections stay a sensible length). The items are
 * all in the page from the start (search engines and screen readers get
 * them); only their display is held back until the button is pressed.
 *
 * `listSelector` points at the list inside `children` (its direct children
 * are the items).
 */
export function ShowMore({
  limit,
  count,
  label,
  listSelector,
  children,
  variant = "outline",
}: {
  limit: number;
  count: number;
  /** e.g. "Show all 6 stories". */
  label: string;
  listSelector: string;
  children: React.ReactNode;
  variant?: "outline" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const collapsed = !open && count > limit;
  return (
    <div data-show-more={id}>
      {collapsed && <style>{`[data-show-more="${id}"] ${listSelector} > :nth-child(n+${limit + 1}){display:none}`}</style>}
      {children}
      {collapsed && (
        <div className="mt-12 flex justify-center">
          <Button type="button" variant={variant} size="lg" onClick={() => setOpen(true)}>
            {label}
            <ChevronDown data-icon="inline-end" />
          </Button>
        </div>
      )}
    </div>
  );
}
