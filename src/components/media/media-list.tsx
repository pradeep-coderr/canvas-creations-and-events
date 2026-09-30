"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import { getLibraryImages } from "@/app/admin/(portal)/content/media/actions";
import { Button } from "@/components/ui/button";
import type { ImageUse, MediaImage } from "@/lib/media/types";
import { MediaPicker } from "./media-picker";

/**
 * An ordered list of library photos (an event story's extra photos): add
 * from the same picker as every photo field (upload included), move, remove.
 * Nothing is saved here — the form's own Save does that.
 */
export function MediaList({
  label,
  value,
  images,
  use,
  max,
  hint,
  error,
  onChange,
}: {
  label: string;
  value: string[];
  images: MediaImage[];
  use: ImageUse;
  max: number;
  hint?: React.ReactNode;
  error?: string;
  onChange: (ids: string[]) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [library, setLibrary] = useState<MediaImage[]>(images);
  const addRef = useRef<HTMLButtonElement>(null);
  const find = (mediaId: string) => library.find((i) => i.id === mediaId) ?? images.find((i) => i.id === mediaId);
  const move = (from: number, to: number) => {
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset className="grid min-w-0 gap-3" aria-describedby={describedBy}>
      <legend className="mb-1 text-sm font-semibold">
        {label} <span className="font-normal text-muted-foreground">(optional, up to {max})</span>
      </legend>
      {value.length > 0 && (
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((mediaId, i) => {
            const image = find(mediaId);
            const name = image?.alt ?? `Photo ${i + 1}`;
            return (
              <li key={mediaId} className="grid gap-2">
                <div className="relative aspect-4/3 overflow-hidden rounded-sm border border-border bg-muted">
                  {image?.url && <Image src={image.url} alt="" fill sizes="200px" className="object-cover" />}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {i + 1}. {name}
                </p>
                <div className="flex gap-1">
                  <Button type="button" variant="outline" size="icon" aria-label={`Move “${name}” earlier`} aria-disabled={i === 0 || undefined} onClick={() => i > 0 && move(i, i - 1)}>
                    <ArrowLeft aria-hidden="true" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" aria-label={`Move “${name}” later`} aria-disabled={i === value.length - 1 || undefined} onClick={() => i < value.length - 1 && move(i, i + 1)}>
                    <ArrowRight aria-hidden="true" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" aria-label={`Remove “${name}”`} onClick={() => onChange(value.filter((v) => v !== mediaId))}>
                    <X aria-hidden="true" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <Button
        ref={addRef}
        type="button"
        variant="outline"
        className="justify-self-start"
        aria-disabled={value.length >= max || undefined}
        onClick={async () => {
          if (value.length >= max) return;
          setOpen(true);
          setLoading(true);
          try {
            setLibrary(await getLibraryImages());
          } catch {
            // Keep what we have.
          } finally {
            setLoading(false);
          }
        }}
      >
        <ImagePlus data-icon="inline-start" aria-hidden="true" />
        Add photo
      </Button>
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
      <MediaPicker
        open={open}
        onOpenChange={setOpen}
        images={library}
        loading={loading}
        selectedId=""
        use={use}
        title={`Add a photo: ${label}`}
        onUploaded={(image) => setLibrary((l) => [image, ...l.filter((i) => i.id !== image.id)])}
        onSelect={(image) => !value.includes(image.id) && onChange([...value, image.id])}
        onDeleted={(deletedId) => setLibrary((l) => l.filter((i) => i.id !== deletedId))}
        returnFocus={addRef}
      />
    </fieldset>
  );
}
