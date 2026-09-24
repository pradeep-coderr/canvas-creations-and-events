"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteItem, moveItem, setItemPublished, type CmsResult } from "@/app/admin/(portal)/content/actions";
import { collections, type CollectionKey } from "@/lib/cms/collections";
import { ConfirmDialog } from "./confirm-dialog";
import { FeaturedBadge, VisibilityBadge } from "./content-badges";

export interface ListItem {
  id: string;
  label: string;
  detail: string | null;
  published: boolean;
  featured: boolean;
}

type Status = { kind: "success" | "error"; text: string } | null;
// `confirmed`: the server asked for the last-FAQ confirmation and the admin is re-confirming.
type Pending = { type: "delete" | "unpublish"; item: ListItem; confirmed?: boolean } | null;

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
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<Pending>(null);
  // "up:<id>" / "down:<id>": the arrow to refocus once the re-ordered list renders.
  const focusAfter = useRef<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Where focus goes when a dialog closes: the button that opened it, or the
  // heading after a delete (that button no longer exists).
  const returnFocus = useRef<HTMLElement | null>(null);

  const publishedFaqs = collection === "faqs" ? items.filter((i) => i.published).length : 0;
  const isLastPublishedFaq = (item: ListItem) => collection === "faqs" && item.published && publishedFaqs === 1;

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

  const report = (result: CmsResult) =>
    setStatus(result.ok ? { kind: "success", text: result.message } : { kind: "error", text: result.error });

  // Buttons stay enabled while an action runs (disabling them would drop
  // keyboard focus); a second action is simply ignored until it finishes.
  const run = (action: () => Promise<CmsResult>, after?: (r: CmsResult) => void) =>
    !isPending &&
    startTransition(async () => {
      try {
        const result = await action();
        report(result);
        after?.(result);
      } catch {
        setStatus({ kind: "error", text: "Couldn't reach the server, so nothing changed. Try again." });
      }
    });

  const move = (item: ListItem, dir: "up" | "down") => {
    if (isPending) return;
    focusAfter.current = `${dir}:${item.id}`;
    run(
      () => moveItem(collection, item.id, dir),
      (r) => {
        if (!r.ok) focusAfter.current = null;
      },
    );
  };

  const togglePublish = (item: ListItem, button: HTMLElement) => {
    if (item.published && isLastPublishedFaq(item)) {
      returnFocus.current = button;
      setConfirm({ type: "unpublish", item });
      return;
    }
    run(() => setItemPublished(collection, item.id, !item.published));
  };

  // Used by the dialogs: returns an error to keep the dialog open.
  const confirmAction = async (): Promise<string | void> => {
    if (!confirm) return;
    const { type, item } = confirm;
    const lastFaq = confirm.confirmed === true || isLastPublishedFaq(item);
    let result: CmsResult;
    try {
      result =
        type === "delete"
          ? await deleteItem(collection, item.id, lastFaq)
          : await setItemPublished(collection, item.id, false, true);
    } catch {
      return "Couldn't reach the server, so nothing changed. Try again.";
    }
    if (!result.ok && result.needsConfirmation) {
      // Someone else unpublished the other FAQs meanwhile: ask again, explicitly.
      setConfirm({ ...confirm, confirmed: true });
      return "This is now the only published FAQ. Press the button again to confirm removing the FAQ section.";
    }
    if (!result.ok) return result.error;
    report(result);
    if (type === "delete") returnFocus.current = headingRef.current;
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

  const dialogItem = confirm?.item;
  const dialogLastFaq = confirm ? confirm.confirmed === true || isLastPublishedFaq(confirm.item) : false;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 ref={headingRef} tabIndex={-1} className="font-display text-display-md font-medium outline-none">
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
        <p className="mt-4 bg-background p-8 text-center text-muted-foreground">
          No {plural} yet.
        </p>
      ) : (
        <ol className="mt-4 divide-y divide-border border-y border-border bg-background" aria-busy={isPending}>
          {items.map((item, i) => (
            <li key={item.id} className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold break-words">{item.label}</span>
                  <VisibilityBadge published={item.published} />
                  {item.featured && <FeaturedBadge />}
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
                  onClick={() => move(item, "up")}
                >
                  <ArrowUp aria-hidden="true" />
                </Button>
                <Button
                  id={`move-down-${item.id}`}
                  variant="outline"
                  size="icon"
                  aria-label={`Move “${item.label}” down`}
                  disabled={i === items.length - 1}
                  onClick={() => move(item, "down")}
                >
                  <ArrowDown aria-hidden="true" />
                </Button>
                <Button variant="outline" onClick={(e) => togglePublish(item, e.currentTarget)}>
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
                  onClick={(e) => {
                    if (isPending) return;
                    returnFocus.current = e.currentTarget;
                    setConfirm({ type: "delete", item });
                  }}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={
          confirm?.type === "unpublish"
            ? "Hide the FAQ section?"
            : `Delete this ${singular}?`
        }
        description={
          <>
            {confirm?.type === "delete" && (
              <p>
                “{dialogItem?.label}” will be permanently deleted. This can&apos;t be undone.
              </p>
            )}
            {dialogLastFaq && (
              <p className="font-medium text-foreground">
                It&apos;s the only published FAQ, so the FAQ section will disappear from the website, and the FAQ
                link in the site menu will go nowhere until another FAQ is published.
              </p>
            )}
          </>
        }
        confirmLabel={
          confirm?.type === "unpublish"
            ? "Unpublish and hide FAQ section"
            : dialogLastFaq
              ? "Delete and hide FAQ section"
              : `Delete ${singular}`
        }
        destructive
        onConfirm={confirmAction}
        returnFocus={returnFocus}
      />
    </>
  );
}
