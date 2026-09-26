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
 * "Edit photo" on a photo shown on the page (hero, About). Choosing a photo
 * in the picker saves it straight away (the picker's "Use this photo" is the
 * confirmation), through the same server action as the section panel.
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
  if (editor.mode === "preview") return null;

  const value = String(editor.value(scope, field) ?? "");
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

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2" data-editor-control="">
      <Button ref={button} type="button" variant="secondary" className="shadow-soft" onClick={() => void openPicker()}>
        <ImageIcon data-icon="inline-start" aria-hidden="true" />
        {value ? "Change photo" : "Add photo"}
        <span className="sr-only">: {label}</span>
      </Button>
      {value && (
        <Button
          type="button"
          variant="secondary"
          className="shadow-soft"
          onClick={() => void editor.saveScope(scope, [field], { [field]: "" })}
        >
          Remove photo<span className="sr-only">: {label}</span>
        </Button>
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
        onSelect={(image) => void editor.saveScope(scope, [field], { [field]: image.id })}
        onDeleted={(deletedId) => setLibrary((l) => l.filter((i) => i.id !== deletedId))}
        returnFocus={button}
      />
    </div>
  );
}
