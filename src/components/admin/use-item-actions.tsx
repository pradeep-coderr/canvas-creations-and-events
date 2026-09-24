"use client";

import { useRef, useState, useTransition } from "react";
import { deleteItem, moveItem, setItemPublished, type CmsResult } from "@/app/admin/(portal)/content/actions";
import { collections, type CollectionKey } from "@/lib/cms/collections";
import { ConfirmDialog } from "./confirm-dialog";

/** The minimum an action needs to know about a collection item. */
export interface ActionItem {
  id: string;
  label: string;
  published: boolean;
}

// `confirmed`: the server asked for the last-FAQ confirmation and the admin is re-confirming.
type Pending = { type: "delete" | "unpublish"; item: ActionItem; confirmed?: boolean } | null;

/**
 * Publish/unpublish, move and delete for one collection, with the delete
 * confirmation and the "last published FAQ" safeguard. Shared by the
 * /admin/content lists and the visual editor so both behave identically.
 * Every action is an existing server action (admin-checked, RLS-enforced);
 * nothing is optimistic.
 */
export function useItemActions({
  collection,
  publishedFaqs,
  onResult,
  afterDeleteFocus,
}: {
  collection: CollectionKey;
  /** How many FAQs are published right now (for the safeguard). */
  publishedFaqs: number;
  onResult: (result: CmsResult) => void;
  /** Where focus goes after a delete (the deleted item's controls are gone). */
  afterDeleteFocus?: () => HTMLElement | null;
}) {
  const { singular } = collections[collection];
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<Pending>(null);
  // Where focus goes when a dialog closes: the button that opened it.
  const returnFocus = useRef<HTMLElement | null>(null);

  const isLastPublishedFaq = (item: ActionItem) => collection === "faqs" && item.published && publishedFaqs === 1;

  const OFFLINE = "Couldn't reach the server, so nothing changed. Try again.";

  // Controls stay enabled while an action runs (disabling them would drop
  // keyboard focus); a second action is simply ignored until it finishes.
  const run = (action: () => Promise<CmsResult>, after?: (r: CmsResult) => void) => {
    if (isPending) return false;
    startTransition(async () => {
      let result: CmsResult;
      try {
        result = await action();
      } catch {
        result = { ok: false, error: OFFLINE };
      }
      onResult(result);
      after?.(result);
    });
    return true;
  };

  const move = (item: ActionItem, dir: "up" | "down", after?: (r: CmsResult) => void) =>
    run(() => moveItem(collection, item.id, dir), after);

  const togglePublish = (item: ActionItem, button: HTMLElement) => {
    if (isPending) return;
    if (item.published && isLastPublishedFaq(item)) {
      returnFocus.current = button;
      setConfirm({ type: "unpublish", item });
      return;
    }
    run(() => setItemPublished(collection, item.id, !item.published));
  };

  const requestDelete = (item: ActionItem, button: HTMLElement) => {
    if (isPending) return;
    returnFocus.current = button;
    setConfirm({ type: "delete", item });
  };

  // Used by the dialog: returns an error to keep it open.
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
      return OFFLINE;
    }
    if (!result.ok && result.needsConfirmation) {
      // Someone else unpublished the other FAQs meanwhile: ask again, explicitly.
      setConfirm({ ...confirm, confirmed: true });
      return "This is now the only published FAQ. Press the button again to confirm removing the FAQ section.";
    }
    if (!result.ok) return result.error;
    onResult(result);
    if (type === "delete") returnFocus.current = afterDeleteFocus?.() ?? null;
  };

  const dialogLastFaq = confirm ? confirm.confirmed === true || isLastPublishedFaq(confirm.item) : false;

  const dialog = (
    <ConfirmDialog
      open={!!confirm}
      onOpenChange={(open) => !open && setConfirm(null)}
      title={confirm?.type === "unpublish" ? "Hide the FAQ section?" : `Delete this ${singular}?`}
      description={
        <>
          {confirm?.type === "delete" && (
            <p>“{confirm.item.label}” will be permanently deleted. This can&apos;t be undone.</p>
          )}
          {dialogLastFaq && (
            <p className="font-medium text-foreground">
              It&apos;s the only published FAQ, so the FAQ section will disappear from the website, and the FAQ link in
              the site menu will go nowhere until another FAQ is published.
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
  );

  return { isPending, move, togglePublish, requestDelete, dialog };
}
