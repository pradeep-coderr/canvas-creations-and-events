"use client";

import { useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { getLibraryImages } from "@/app/admin/(portal)/content/media/actions";
import { MediaPicker, MediaSlot } from "@/components/media/media-picker";
import { Button } from "@/components/ui/button";
import type { ImageUse, MediaImage } from "@/lib/media/types";
import type { EditorScope } from "@/lib/editor/fields";
import { useEditor } from "./editor-context";

/*
 * Photos in the visual editor use the same media library picker as the
 * content forms (and the same upload). Nothing here stores files: a photo
 * field only points at a library photo.
 */

/** A photo field bound to an editor draft (section panels). */
export function EditorMediaField({
  scope,
  field,
  label,
  use,
  emptyText,
  required = false,
  hint,
}: {
  scope: EditorScope;
  field: string;
  label: string;
  use: ImageUse;
  emptyText?: string;
  required?: boolean;
  hint?: string;
}) {
  const editor = useEditor();
  return (
    <MediaSlot
      label={label}
      value={String(editor.value(scope, field) ?? "")}
      images={editor.data.imageOptions}
      required={required}
      use={use}
      hint={hint}
      error={editor.error(scope, field)}
      emptyText={emptyText}
      onChange={(id) => editor.setDraft(scope, field, id)}
    />
  );
}

/**
 * "Change photo" on a photo shown on the page (hero, About). Like every other
 * editor change, the choice is a draft: the page shows it straight away (laid
 * over the saved photo) and Save puts it on the website.
 */
export function EditPhotoButton({
  scope,
  field,
  label,
  use,
}: {
  scope: EditorScope;
  field: string;
  label: string;
  use: ImageUse;
}) {
  const editor = useEditor();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [library, setLibrary] = useState<MediaImage[]>(editor.data.imageOptions);
  const button = useRef<HTMLButtonElement>(null);
  if (editor.mode === "preview" && !editor.hasDraft(scope, field)) return null;

  const value = String(editor.value(scope, field) ?? "");
  const draft = editor.hasDraft(scope, field);
  const draftImage = draft && value ? library.find((i) => i.id === value) : undefined;
  const openPicker = async () => {
    setOpen(true);
    setLoading(true);
    try {
      setLibrary(await getLibraryImages());
    } catch {
      // Keep the list we have.
    } finally {
      setLoading(false);
    }
  };

  const preview = draft && (
    // The unsaved choice, over the saved photo (which the server rendered).
    <div className="absolute inset-0 bg-surface-ivory" aria-hidden="true">
      {draftImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL of an admin-only draft
        <img src={draftImage.url} alt="" className="size-full object-cover" />
      ) : (
        <p className="flex size-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
          Photo removed. The website shows its placeholder once saved.
        </p>
      )}
    </div>
  );
  if (editor.mode === "preview") return preview;

  return (
    <>
      {preview}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-2" data-editor-control="">
        <Button ref={button} type="button" variant="secondary" className="shadow-soft" onClick={() => void openPicker()}>
          <ImageIcon data-icon="inline-start" aria-hidden="true" />
          {value ? "Change photo" : "Add photo"}
          <span className="sr-only">: {label}</span>
        </Button>
        {value && (
          <Button type="button" variant="secondary" className="shadow-soft" onClick={() => editor.setDraft(scope, field, "")}>
            Remove photo<span className="sr-only">: {label}</span>
          </Button>
        )}
        {draft && (
          <>
            <span className="rounded-sm bg-background px-2 py-1 text-xs font-medium text-primary shadow-soft">
              Unsaved photo
            </span>
            <Button type="button" variant="ghost" className="bg-background/90 shadow-soft" onClick={() => editor.discardDraft(scope, field)}>
              Undo<span className="sr-only"> photo change: {label}</span>
            </Button>
          </>
        )}
        <MediaPicker
          open={open}
          onOpenChange={setOpen}
          images={library}
          loading={loading}
          selectedId={value}
          use={use}
          title={`Choose a photo: ${label}`}
          onUploaded={(image) => setLibrary((l) => [image, ...l.filter((i) => i.id !== image.id)])}
          onSelect={(image) => editor.setDraft(scope, field, image.id)}
          onDeleted={(deletedId) => setLibrary((l) => l.filter((i) => i.id !== deletedId))}
          returnFocus={button}
        />
      </div>
    </>
  );
}
