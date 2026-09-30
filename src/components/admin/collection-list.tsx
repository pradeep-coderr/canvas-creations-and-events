"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CmsResult } from "@/app/admin/(portal)/content/actions";
import { collections, type CollectionKey } from "@/lib/cms/collections";
import { FeaturedBadge, SampleContentBadge, VisibilityBadge } from "./content-badges";
import { useItemActions } from "./use-item-actions";

export interface ListItem {
  id: string;
  label: string;
  detail: string | null;
  published: boolean;
  featured: boolean;
  /** Temporary sample content. */
  demo?: boolean;
}

type Status = { kind: "success" | "error"; text: string } | null;

/**
 * A collection in display order, with the everyday actions: reorder,
 * publish/unpublish, edit and delete. Every action runs on the server and
 * the list re-renders from the database afterwards (no optimistic updates).
 */
export function CollectionList({
  collection,
  items,
  addDisabledReason,
}: {
  collection: CollectionKey;
  items: ListItem[];
  /** When adding isn't possible yet (e.g. no photos to choose from). */
  addDisabledReason?: string;
}) {
  const { singular, plural, title } = collections[collection];
  const [status, setStatus] = useState<Status>(null);
  // "up:<id>" / "down:<id>": the arrow to refocus once the re-ordered list renders.
  const focusAfter = useRef<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const { isPending, isActive, move, togglePublish, requestDelete, dialog } = useItemActions({
    collection,
    publishedFaqs: items.filter((i) => i.published).length,
    onResult: (result: CmsResult) =>
      setStatus(result.ok ? { kind: "success", text: result.message } : { kind: "error", text: result.error }),
    afterDeleteFocus: () => headingRef.current,
  });

  // Keep keyboard focus on the moved item's arrow after the list re-renders.
  useEffect(() => {
    if (!focusAfter.current) return;
    const [dir, id] = focusAfter.current.split(":");
    focusAfter.current = null;
    // Same arrow if it's still usable; at the top/bottom, the other one.
    const target = [`move-${dir}-${id}`, `move-${dir === "up" ? "down" : "up"}-${id}`]
      .map((elementId) => document.getElementById(elementId) as HTMLButtonElement | null)
      .find((el) => el && !el.disabled);
    target?.focus();
  }, [items]);

  const moveWithFocus = (item: ListItem, dir: "up" | "down") => {
    if (isPending) return;
    focusAfter.current = `${dir}:${item.id}`;
    move(item, dir, (r) => {
      if (!r.ok) focusAfter.current = null;
    });
  };

  const addButton = addDisabledReason ? (
    <Button disabled aria-describedby="add-disabled-reason">
      <Plus data-icon="inline-start" aria-hidden="true" />
      Add {singular}
    </Button>
  ) : (
    <Button asChild>
      <Link href={`/admin/content/${collection}/new` as never}>
        <Plus data-icon="inline-start" aria-hidden="true" />
        Add {singular}
      </Link>
    </Button>
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 ref={headingRef} tabIndex={-1} className="font-display text-display-md font-title outline-none">
          {title}
        </h1>
        {addButton}
      </div>
      <p className="mt-3 max-w-2xl text-muted-foreground">{collections[collection].description}</p>
      {addDisabledReason && (
        <p id="add-disabled-reason" className="mt-3 max-w-2xl border-l-2 border-highlight pl-4 text-sm text-muted-foreground">
          {addDisabledReason}
        </p>
      )}

      <div className="mt-6 min-h-5 text-sm">
        <p role="status">{status?.kind === "success" && <span className="text-muted-foreground">{status.text}</span>}</p>
        <p role="alert" className="font-medium text-destructive">
          {status?.kind === "error" && status.text}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 bg-background p-8 text-center text-muted-foreground">No {plural} yet.</p>
      ) : (
        <ol className="mt-4 divide-y divide-border border-y border-border bg-background" aria-busy={isPending}>
          {items.map((item, i) => (
            <li key={item.id} className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold break-words">{item.label}</span>
                  <VisibilityBadge published={item.published} />
                  {item.featured && <FeaturedBadge />}
                  {item.demo && <SampleContentBadge />}
                </div>
                {item.detail && <p className="mt-1 text-sm break-words text-muted-foreground">{item.detail}</p>}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  id={`move-up-${item.id}`}
                  variant="outline"
                  size="icon"
                  aria-label={`Move “${item.label}” up`}
                  disabled={i === 0}
                  pending={isActive(item.id, "up")}
                  onClick={() => moveWithFocus(item, "up")}
                >
                  <ArrowUp aria-hidden="true" />
                </Button>
                <Button
                  id={`move-down-${item.id}`}
                  variant="outline"
                  size="icon"
                  aria-label={`Move “${item.label}” down`}
                  disabled={i === items.length - 1}
                  pending={isActive(item.id, "down")}
                  onClick={() => moveWithFocus(item, "down")}
                >
                  <ArrowDown aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  pending={isActive(item.id, "publish")}
                  pendingLabel={item.published ? "Unpublishing…" : "Publishing…"}
                  onClick={(e) => togglePublish(item, e.currentTarget)}
                >
                  {item.published ? "Unpublish" : "Publish"}
                  <span className="sr-only"> “{item.label}”</span>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/admin/content/${collection}/${item.id}` as never}>
                    Edit<span className="sr-only"> “{item.label}”</span>
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  aria-label={`Delete “${item.label}”`}
                  onClick={(e) => requestDelete(item, e.currentTarget)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {dialog}
    </>
  );
}
