"use client";

import { useId, useRef, useState } from "react";
import { PanelTop, SlidersHorizontal } from "lucide-react";
import { sectionAttrs } from "@/lib/styles/schema";
import type { HomeSectionKey } from "@/components/home/home-sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { videoSourceLabels, videoSources, type VideoSource as VideoSourceKey } from "@/lib/cms/singletons";
import {
  chromeSection,
  sections,
  validateField,
  type EditableField,
  type EditorScope,
  type SectionDef,
} from "@/lib/editor/fields";
import { useEditor } from "./editor-context";
import { SectionStyleControls } from "./style-controls";
import { EditorMediaField } from "./editor-media";

/*
 * Wraps each homepage section in the editor: an "Edit section" button that
 * opens a panel with every text of that section (including text inside
 * links and buttons, which can't be edited inline). Panel edits are drafts
 * shown live on the page; "Save section" sends them through the existing
 * server action. In preview, the wrapper disappears; sections a visitor
 * wouldn't see (nothing published) are hidden.
 */

const NONE = "__none__";

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

/** A select bound to an editor draft (photos, video type). */
function PanelSelect({
  scope,
  field,
  label,
  options,
  noneLabel,
  hint,
  disabled,
}: {
  scope: EditorScope;
  field: string;
  label: string;
  options: { value: string; label: string }[];
  noneLabel?: string;
  hint?: string;
  disabled?: boolean;
}) {
  const editor = useEditor();
  const id = useId();
  const value = String(editor.value(scope, field) ?? "");
  const error = editor.error(scope, field);
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <Select
        value={value || (noneLabel ? NONE : "")}
        onValueChange={(v) => editor.setDraft(scope, field, v === NONE ? "" : v)}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          className="w-full"
          aria-invalid={error ? true : undefined}
          aria-describedby={[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined}
        >
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent>
          {noneLabel && <SelectItem value={NONE}>{noneLabel}</SelectItem>}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
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

/** Where the video comes from: same choices and rules as /admin/content/video. */
function VideoSource() {
  const editor = useEditor();
  const { videoOptions, uploadedVideoConfigured } = editor.data;
  const provider = String(editor.value("video", "provider")) as VideoSourceKey;
  const streamVideos = videoOptions.filter((v) => v.provider === "stream");
  const text = (field: string, label: string, hint?: string, optional?: boolean) => (
    <PanelField def={{ scope: "video", field, label, kind: "line", hint, optional }} />
  );
  return (
    <fieldset className="grid gap-4 border-t border-border pt-5">
      <legend className="sr-only">Video</legend>
      <PanelSelect
        scope="video"
        field="provider"
        label="Video"
        options={videoSources
          .filter((p) => p !== "stream" || uploadedVideoConfigured || provider === "stream")
          .map((p) => ({ value: p, label: videoSourceLabels[p] }))}
        hint={
          uploadedVideoConfigured
            ? undefined
            : "Uploaded video is not configured yet. Add a YouTube or Vimeo link instead."
        }
      />
      {(provider === "youtube" || provider === "vimeo") &&
        text(
          "videoUrl",
          provider === "youtube" ? "YouTube link" : "Vimeo link",
          "Copy it from the video's Share button.",
        )}
      {provider === "stream" && (
        <PanelSelect
          scope="video"
          field="videoMediaId"
          label="Uploaded video"
          options={streamVideos.map((v) => ({ value: v.id, label: v.title }))}
          disabled={streamVideos.length === 0}
          hint={streamVideos.length === 0 ? "No uploaded videos yet." : undefined}
        />
      )}
      {provider !== "none" && (
        <>
          {text("videoTitle", "What the video shows", "Read out by screen readers and shown on the play button.")}
          {text("caption", "Caption", undefined, true)}
          <EditorMediaField
            scope="video"
            field="posterId"
            label="Cover photo"
            use="posters"
            hint="Shown before the video plays. The player only loads when a visitor presses Play."
            emptyText="No cover photo: a Canvas Creations cover is shown."
          />
        </>
      )}
    </fieldset>
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
  const extraFields =
    section === "video" ? ["provider", "videoUrl", "videoMediaId", "posterId", "videoTitle", "caption"] : photoField ? [photoField] : [];
  // The scope the photo/video fields belong to (the section's own record).
  const ownScope = section === "about" ? "about" : section === "video" ? "video" : "home";
  const unsaved = new Set(
    [...def.fields.map((f) => [f.scope, f.field] as const), ...extraFields.map((f) => [ownScope, f] as const)]
      .filter(([scope, field]) => editor.hasDraft(scope, field))
      .map(([scope, field]) => `${scope}.${field}`),
  ).size;

  const save = async () => {
    let ok = true;
    for (const scope of scopes) {
      const fields = [...def.fields.filter((f) => f.scope === scope).map((f) => f.field), ...(scope === ownScope ? extraFields : [])];
      ok = (await editor.saveScope(scope, fields)) && ok;
    }
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
          {section === "video" && <VideoSource />}
          {section && <SectionStyleControls section={section} spacing={section !== "hero"} />}
          {def.collection && (
            <p className="border-l-2 border-highlight pl-3 text-sm text-muted-foreground">
              {collections[def.collection].title} are edited where they appear on the page: use “Edit” on an item, or
              “Add {collections[def.collection].singular}” under the list.
            </p>
          )}
        </div>
        <SheetFooter className="flex-col gap-2 sm:flex-row">
          <Button type="button" onClick={() => void save()} aria-disabled={editor.saving || undefined}>
            {editor.saving ? "Saving…" : unsaved ? `Save section (${unsaved} change${unsaved === 1 ? "" : "s"})` : "Save section"}
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
