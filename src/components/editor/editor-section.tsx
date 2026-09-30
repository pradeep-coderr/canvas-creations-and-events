"use client";

import { useId, useRef, useState } from "react";
import { PanelTop, SlidersHorizontal } from "lucide-react";
import { isStyleKey, sectionAttrs } from "@/lib/styles/schema";
import type { HomeSectionKey } from "@/components/home/home-sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { collections } from "@/lib/cms/collections";
import {
  chromeSection,
  sections,
  validateField,
  type EditableField,
  type SectionDef,
} from "@/lib/editor/fields";
import { useEditor, type StyleRef } from "./editor-context";
import { SectionStyleControls, TextStyleControls } from "./style-controls";
import { EditorMediaField } from "./editor-media";

/*
 * Wraps each homepage section in the editor: an "Edit section" button that
 * opens a panel with every text of that section (including text inside
 * links and buttons, which can't be edited inline). Panel edits are drafts
 * shown live on the page; "Save section" sends them through the existing
 * server action. In preview, the wrapper disappears; sections a visitor
 * wouldn't see (nothing published) are hidden.
 */

/** One labelled control bound to an editor draft. */
function PanelField({ def }: { def: EditableField }) {
  const editor = useEditor();
  const id = useId();
  const [blurError, setBlurError] = useState<string | null>(null);
  const value = editor.value(def.scope, def.field);
  const error = editor.error(def.scope, def.field) ?? blurError;
  const describedBy = [def.hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  const set = (next: unknown) => {
    setBlurError(null);
    editor.setDraft(def.scope, def.field, next);
  };
  const check = () => setBlurError(validateField(def.scope, def.field, editor.value(def.scope, def.field)));
  const common = {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    onBlur: check,
  };

  return (
    <div className="grid gap-2">
      {def.kind === "lines" ? (
        <fieldset className="grid gap-2">
          <legend className="text-sm font-semibold">{def.label}</legend>
          {[0, 1, 2].map((i) => (
            <Input
              key={i}
              aria-label={`${def.label}, line ${i + 1}${i > 0 ? " (optional)" : ""}`}
              maxLength={200}
              value={(value as string[])[i] ?? ""}
              onChange={(e) => {
                const next = [...(value as string[])];
                next[i] = e.target.value;
                set(next);
              }}
              {...common}
            />
          ))}
        </fieldset>
      ) : (
        <>
          <label htmlFor={id} className="text-sm font-semibold">
            {def.label}
            {def.optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
            {editor.hasDraft(def.scope, def.field) && (
              <span className="ml-2 text-xs font-medium text-primary">Unsaved</span>
            )}
          </label>
          {def.kind === "line" ? (
            <Input id={id} maxLength={200} value={String(value ?? "")} onChange={(e) => set(e.target.value)} {...common} />
          ) : (
            <Textarea
              id={id}
              rows={def.kind === "paragraphs" ? 7 : 3}
              value={String(value ?? "")}
              onChange={(e) => set(e.target.value)}
              {...common}
            />
          )}
        </>
      )}
      {def.hint && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {def.hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function SectionPanel({
  section,
  def,
  title,
  open,
  onOpenChange,
  returnFocus,
}: {
  /** The homepage section (photos, video); none for the header & footer. */
  section?: HomeSectionKey;
  def: SectionDef;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Opened from code (no Radix Trigger), so say where focus goes on close. */
  returnFocus: React.RefObject<HTMLElement | null>;
}) {
  const editor = useEditor();
  const scopes = [...new Set(def.fields.map((f) => f.scope))];
  const photoField = section === "hero" ? "heroImageId" : section === "about" ? "imageId" : null;
  const extraFields = photoField ? [photoField] : [];
  // The scope the photo fields belong to (the section's own record).
  const ownScope = section === "about" ? "about" : "home";
  // This section's style presets: its own, its texts', and its list's parts.
  const styleRefs: StyleRef[] = [
    ...(section ? [{ kind: "section", key: section } as const] : []),
    ...def.fields
      .map((f) => `${f.scope}.${f.field}`)
      .filter(isStyleKey)
      .map((key) => ({ kind: "text", key }) as const),
    ...(def.styleKeys ?? []).map((s) => ({ kind: "text", key: s.key }) as const),
  ];
  const unsaved =
    new Set(
      [...def.fields.map((f) => [f.scope, f.field] as const), ...extraFields.map((f) => [ownScope, f] as const)]
        .filter(([scope, field]) => editor.hasDraft(scope, field))
        .map(([scope, field]) => `${scope}.${field}`),
    ).size + styleRefs.filter((ref) => editor.hasStyleDraft(ref)).length;

  const save = async () => {
    let ok = true;
    for (const scope of scopes) {
      const fields = [...def.fields.filter((f) => f.scope === scope).map((f) => f.field), ...(scope === ownScope ? extraFields : [])];
      ok = (await editor.saveScope(scope, fields)) && ok;
    }
    ok = (await editor.saveStyles(styleRefs)) && ok;
    if (ok) onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="overflow-y-auto"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocus.current?.focus();
        }}
      >
        <SheetHeader>
          <SheetTitle className="font-display text-display-sm font-title">{title}</SheetTitle>
          <SheetDescription>
            Changes show on the page as you type. Save to put them on the website.
            {def.note && <span className="mt-2 block">{def.note}</span>}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-5 px-6">
          {def.fields.map((f) => (
            <PanelField key={`${f.scope}.${f.field}`} def={f} />
          ))}
          {photoField && (
            <EditorMediaField
              scope={ownScope}
              field={photoField}
              label="Photo"
              use={section === "hero" ? "hero" : "founder"}
              emptyText={
                section === "hero"
                  ? "No photo: the Canvas Creations monogram is shown."
                  : "No photo: the Canvas Creations logo is shown."
              }
            />
          )}
          {def.styleKeys && def.styleKeys.length > 0 && (
            <fieldset className="grid gap-4 border-t border-border pt-5">
              <legend className="text-sm font-semibold">
                {def.collection ? `${collections[def.collection].title}: text styles` : "Text styles"}
              </legend>
              <p className="-mt-2 text-sm text-muted-foreground">One look for every item in the list.</p>
              {def.styleKeys.map((s) => (
                <div key={s.key} className="grid gap-1">
                  <p className="text-sm font-medium">{s.label}</p>
                  <TextStyleControls styleKey={s.key} label={s.label} />
                </div>
              ))}
            </fieldset>
          )}
          {section && <SectionStyleControls section={section} spacing={section !== "hero"} />}
          {def.collection && (
            <p className="border-l-2 border-highlight pl-3 text-sm text-muted-foreground">
              {collections[def.collection].title} are edited where they appear on the page: use “Edit” on an item, or
              “Add {collections[def.collection].singular}” under the list.
            </p>
          )}
        </div>
        <SheetFooter className="flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            aria-disabled={!unsaved || undefined}
            onClick={() => void save()}
            pending={editor.saving}
            pendingLabel="Saving section…"
          >
            {unsaved ? `Save section (${unsaved} change${unsaved === 1 ? "" : "s"})` : "Save section"}
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/** Editor wrapper for a homepage section (styles come from the editor state, not the `styles` prop). */
export function EditorSection({ section, children }: { section: HomeSectionKey; styles?: unknown; children: React.ReactNode }) {
  const editor = useEditor();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  if (editor.mode === "preview") {
    if (editor.data.hiddenInPreview.includes(section)) return null;
    // Same wrapper as the public page: only when the section has a style.
    const attrs = sectionAttrs(editor.styles.sections[section]);
    return attrs ? (
      <div data-ss={section} {...attrs}>
        {children}
      </div>
    ) : (
      children
    );
  }

  const def = sections[section];
  return (
    <div className="cc-section" data-section={section} {...sectionAttrs(editor.styles.sections[section])}>
      {children}
      <div className="cc-section-bar" data-editor-control="">
        <Button
          ref={trigger}
          type="button"
          variant="secondary"
          className="cc-section-button max-sm:size-11 max-sm:px-0"
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal aria-hidden="true" />
          <span className="max-sm:sr-only">Edit section</span>
          <span className="sr-only">: {def.title}</span>
        </Button>
      </div>
      <SectionPanel
        section={section}
        def={def}
        title={`${def.title} section`}
        open={open}
        onOpenChange={setOpen}
        returnFocus={trigger}
      />
    </div>
  );
}

/** Toolbar button: the header & footer wording and contact details (site details). */
export function ChromePanelButton() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button ref={trigger} type="button" variant="outline" className="max-sm:size-11 max-sm:px-0" onClick={() => setOpen(true)}>
        <PanelTop aria-hidden="true" />
        <span className="max-sm:sr-only">Header &amp; footer</span>
      </Button>
      <SectionPanel def={chromeSection} title="Header & footer" open={open} onOpenChange={setOpen} returnFocus={trigger} />
    </>
  );
}
