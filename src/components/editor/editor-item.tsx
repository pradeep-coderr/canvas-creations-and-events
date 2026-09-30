"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import {
  CategoryForm,
  FaqForm,
  FilmForm,
  GalleryItemForm,
  PricingForm,
  ServiceForm,
  StepForm,
  TestimonialForm,
} from "@/components/admin/collection-forms";
import type { InlineFormOptions } from "@/components/admin/cms-form";
import { useItemActions } from "@/components/admin/use-item-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { collections, type CollectionKey, type CollectionValues } from "@/lib/cms/collections";
import { useEditor } from "./editor-context";

/*
 * Collection items where they appear on the page. In edit mode each item gets
 * a small bar: its visibility, "Edit" (the item's form opens in place) and a
 * menu with move / publish / delete. Everything goes through the existing
 * Phase 14 server actions and safeguards (useItemActions). In preview mode
 * only what a visitor would see is shown.
 */

/** The item's Phase 14 form, shown in place. */
function ItemForm({
  collection,
  id,
  values,
  options,
}: {
  collection: CollectionKey;
  id: string | null;
  values: Record<string, unknown>;
  options: InlineFormOptions;
}) {
  const { data } = useEditor();
  const common = { id, inlineOptions: options };
  const v = <K extends CollectionKey>() => values as CollectionValues<K>;
  switch (collection) {
    case "services":
      return <ServiceForm {...common} defaultValues={v<"services">()} imageOptions={data.imageOptions} />;
    case "pricing":
      return <PricingForm {...common} defaultValues={v<"pricing">()} />;
    case "films":
      return <FilmForm {...common} defaultValues={v<"films">()} videoOptions={data.videoOptions} />;
    case "categories":
      return <CategoryForm {...common} defaultValues={v<"categories">()} />;
    case "gallery":
      return (
        <GalleryItemForm
          {...common}
          defaultValues={v<"gallery">()}
          imageOptions={data.imageOptions}
          categoryOptions={data.categoryOptions}
        />
      );
    case "testimonials":
      return <TestimonialForm {...common} defaultValues={v<"testimonials">()} />;
    case "faqs":
      return <FaqForm {...common} defaultValues={v<"faqs">()} />;
    case "process":
    case "principles":
      return <StepForm {...common} collection={collection} defaultValues={v<"process">()} />;
  }
}

/** Open/close an in-place form, keeping the editor's unsaved-changes count right. */
function useInlineForm(formKey: string) {
  const editor = useEditor();
  const [open, setOpen] = useState(false);
  const returnTo = useRef<HTMLElement | null>(null);
  const { registerForm, announce } = editor;

  const onDirtyChange = useCallback(
    (dirty: boolean, submit: () => void) => registerForm(formKey, dirty ? submit : null),
    [registerForm, formKey],
  );

  const close = useCallback(() => {
    registerForm(formKey, null);
    setOpen(false);
    // Back to the control that opened the form.
    requestAnimationFrame(() => returnTo.current?.focus());
  }, [registerForm, formKey]);

  useEffect(() => () => registerForm(formKey, null), [registerForm, formKey]);

  const options: InlineFormOptions = {
    inline: true,
    onDirtyChange,
    onCancel: close,
    onSaved: (result) => {
      announce("success", result.message);
      close();
    },
  };

  const start = (from: HTMLElement | null) => {
    returnTo.current = from;
    setOpen(true);
  };

  return { open, start, close, options };
}

export function EditorItem({
  collection,
  id,
  children,
}: {
  collection: CollectionKey;
  id: string;
  children: React.ReactNode;
}) {
  const editor = useEditor();
  const meta = editor.findItem(collection, id);
  const items = editor.data.items[collection];
  const form = useInlineForm(`item:${id}`);
  const editButton = useRef<HTMLButtonElement>(null);
  const actions = useItemActions({
    collection,
    publishedFaqs: editor.data.items.faqs.filter((i) => i.published).length,
    onResult: (r) => editor.announce(r.ok ? "success" : "error", r.ok ? r.message : r.error),
    afterDeleteFocus: () => document.getElementById(`add-${collection}`),
  });

  if (!meta) return children;
  if (editor.mode === "preview") return meta.visibleOnSite ? children : null;

  const index = items.findIndex((i) => i.id === id);
  const { singular } = collections[collection];
  const label = meta.label || `Untitled ${singular}`;
  const visibility = !meta.published
    ? "Draft: hidden from visitors"
    : !meta.visibleOnSite
      ? meta.note ?? "Not shown on the homepage"
      : null;

  return (
    <div className="cc-item" data-hidden-on-site={!meta.visibleOnSite || undefined}>
      <div className="cc-item-bar" data-editor-control="">
        {visibility && <span className="cc-item-note">{visibility}</span>}
        <Button
          ref={editButton}
          type="button"
          variant="outline"
          className="cc-item-button"
          aria-expanded={form.open}
          onClick={() => (form.open ? form.close() : form.start(editButton.current))}
        >
          <Pencil data-icon="inline-start" aria-hidden="true" />
          {form.open ? "Close" : "Edit"}
          <span className="sr-only"> {singular} “{label}”</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="cc-item-button"
              aria-label={`More actions for “${label}”`}
              pending={actions.isActive(id, "up") || actions.isActive(id, "down") || actions.isActive(id, "publish")}
            >
              <MoreHorizontal aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 rounded-md p-1 shadow-soft">
            <DropdownMenuItem className="min-h-11" disabled={index <= 0} onSelect={() => actions.move(meta, "up")}>
              <ArrowUp aria-hidden="true" /> Move up
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-h-11"
              disabled={index === items.length - 1}
              onSelect={() => actions.move(meta, "down")}
            >
              <ArrowDown aria-hidden="true" /> Move down
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-h-11"
              onSelect={() => actions.togglePublish(meta, editButton.current ?? document.body)}
            >
              {meta.published ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              {meta.published ? "Unpublish (make draft)" : "Publish"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="min-h-11"
              variant="destructive"
              onSelect={() => actions.requestDelete(meta, editButton.current ?? document.body)}
            >
              <Trash2 aria-hidden="true" /> Delete…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {form.open ? (
        <div className="cc-item-form" data-editor-control="">
          <ItemForm collection={collection} id={id} values={meta.values} options={form.options} />
        </div>
      ) : (
        children
      )}
      {actions.dialog}
    </div>
  );
}

/** "+ Add …" after a list, opening the item form in place. */
export function AddItem({ collection }: { collection: CollectionKey }) {
  const editor = useEditor();
  const form = useInlineForm(`new:${collection}`);
  const button = useRef<HTMLButtonElement>(null);
  if (editor.mode === "preview") return null;

  const { singular } = collections[collection];
  const items = editor.data.items[collection];
  const nextOrder = items.reduce((max, i) => Math.max(max, Number(i.values.sortOrder) || 0), 0) + 1;
  // A draft at the end. Services and testimonials are featured by default;
  // in the other lists "featured" means shown first, so it's opt-in.
  const defaults = collections[collection].toValues({
    is_published: false,
    is_featured: collection === "services" || collection === "testimonials",
    sort_order: nextOrder,
    price_type: "fixed",
  }) as Record<string, unknown>;

  return (
    <div className="cc-add" data-editor-control="">
      {items.length === 0 && <p className="cc-item-note">No {collections[collection].plural} yet.</p>}
      {form.open ? (
        <div className="cc-item-form">
          <ItemForm collection={collection} id={null} values={defaults} options={form.options} />
        </div>
      ) : (
        <>
          <Button
            ref={button}
            id={`add-${collection}`}
            type="button"
            variant="secondary"
            onClick={() => form.start(button.current)}
          >
            <Plus data-icon="inline-start" aria-hidden="true" />
            Add {singular}
          </Button>
        </>
      )}
    </div>
  );
}
