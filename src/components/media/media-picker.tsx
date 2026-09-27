"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { Check, ImageIcon } from "lucide-react";
import { deleteMedia, getLibraryImages } from "@/app/admin/(portal)/content/media/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ImageUse, MediaImage } from "@/lib/media/types";
import { cn } from "@/lib/utils";
import { UploadPhoto } from "./upload-photo";

/*
 * Choosing a photo from the media library, from any image field (content
 * forms, the visual editor, gallery items, video poster). Photos can also be
 * uploaded right here — the same upload as the library — and an unused
 * photo can be deleted here (same action and rules as the library: a photo
 * used anywhere on the website can't be deleted). Selecting only changes
 * which library photo the field points to; files are never copied.
 */

export function MediaPicker({
  open,
  onOpenChange,
  images,
  loading,
  selectedId,
  use,
  title,
  onSelect,
  onUploaded,
  onDeleted,
  returnFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: MediaImage[];
  loading: boolean;
  selectedId: string;
  use: ImageUse;
  title: string;
  onSelect: (image: MediaImage) => void;
  onUploaded: (image: MediaImage) => void;
  onDeleted: (id: string) => void;
  returnFocus: React.RefObject<HTMLElement | null>;
}) {
  const name = useId();
  const [choice, setChoice] = useState(selectedId);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const uploadRef = useRef<HTMLButtonElement>(null);

  const q = query.trim().toLowerCase();
  const shown = q
    ? images.filter((i) => `${i.alt} ${i.originalFilename ?? ""}`.toLowerCase().includes(q))
    : images;
  const chosen = images.find((i) => i.id === choice);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setChoice(selectedId);
          setUploading(false);
          setMessage("");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="sm:max-w-3xl"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          returnFocus.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{uploading ? "Upload a photo" : title}</DialogTitle>
          <DialogDescription>
            {uploading
              ? "It's added to your media library, so you can use it anywhere."
              : "From your media library. The same photo can be used in several places."}
          </DialogDescription>
        </DialogHeader>

        {uploading ? (
          <UploadPhoto
            use={use}
            onCancel={() => setUploading(false)}
            onUploaded={(image, text) => {
              onUploaded(image);
              setChoice(image.id);
              setUploading(false);
              setMessage(`${text} It's selected below.`);
            }}
          />
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="search"
                aria-label="Search photos by description"
                placeholder="Search by description"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button ref={uploadRef} type="button" variant="secondary" onClick={() => setUploading(true)}>
                Upload new photo
              </Button>
            </div>
            <p role="status" className="text-sm text-muted-foreground empty:hidden">
              {loading ? "Loading photos…" : message}
            </p>
            {loading && images.length === 0 ? (
              // The library is being fetched: placeholders shaped like photo cards.
              <ul aria-hidden="true" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="overflow-hidden rounded-md border border-border">
                    <Skeleton className="aspect-square rounded-none" />
                    <div className="grid gap-1.5 p-2">
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : !loading && images.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-8 text-center">
                <p className="font-display text-display-sm">No photos yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload your first photo to start building the portfolio.
                </p>
              </div>
            ) : !loading && shown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No photos match “{query}”.</p>
            ) : (
              <fieldset className="min-w-0">
                <legend className="sr-only">Photos</legend>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {shown.map((image) => {
                    const checked = choice === image.id;
                    return (
                      <li key={image.id}>
                        <label
                          className={cn(
                            "block cursor-pointer overflow-hidden rounded-md border bg-background transition-colors",
                            "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
                            checked ? "border-primary ring-1 ring-primary" : "border-border hover:border-foreground/35",
                          )}
                        >
                          <input
                            type="radio"
                            name={name}
                            value={image.id}
                            checked={checked}
                            onChange={() => setChoice(image.id)}
                            className="sr-only"
                          />
                          <span className="relative block aspect-square bg-muted">
                            {image.url && (
                              <Image src={image.url} alt="" fill sizes="(min-width: 1024px) 180px, (min-width: 640px) 30vw, 45vw" className="object-cover" />
                            )}
                            {checked && (
                              <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-sm bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                                <Check className="size-3.5" aria-hidden="true" /> Selected
                              </span>
                            )}
                          </span>
                          <span className="block p-2 text-sm">
                            <span className="line-clamp-2">{image.alt}</span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {image.width} × {image.height}
                              {image.usage.length > 0 ? ` · used ${image.usage.length}×` : " · unused"}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            )}
          </>
        )}

        {!uploading && (
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            {chosen && chosen.usage.length === 0 && (
              <Button
                type="button"
                variant="destructive"
                className="sm:mr-auto"
                onClick={() => setConfirmDelete(true)}
              >
                Delete photo<span className="sr-only">: {chosen.alt}</span>
              </Button>
            )}
            {chosen && chosen.usage.length > 0 && (
              <p className="text-xs text-muted-foreground sm:mr-auto sm:max-w-64 sm:self-center">
                Used on the website, so it can&apos;t be deleted here.
              </p>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              aria-disabled={!chosen || undefined}
              onClick={() => {
                if (!chosen) return;
                onSelect(chosen);
                onOpenChange(false);
              }}
            >
              Use this photo
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this photo?"
        description={
          <p>
            “{chosen?.alt}” will be permanently deleted from your media library. This can&apos;t be undone.
          </p>
        }
        confirmLabel="Delete photo"
        destructive
        returnFocus={uploadRef}
        onConfirm={async () => {
          if (!chosen) return;
          const result = await deleteMedia(chosen.id);
          if (!result.ok) return result.error;
          onDeleted(chosen.id);
          setChoice("");
          setMessage("Photo deleted.");
        }}
      />
    </Dialog>
  );
}

/**
 * An image field: the current photo with Change / Remove, opening the
 * library picker. Used by the content forms and the visual editor.
 */
export function MediaSlot({
  label,
  value,
  images,
  required = false,
  use,
  hint,
  error,
  onChange,
  buttonRef,
  emptyText = "No photo selected.",
}: {
  label: string;
  /** Selected media id ("" = none). */
  value: string;
  /** Library photos known up front (from the server). */
  images: MediaImage[];
  required?: boolean;
  use: ImageUse;
  hint?: React.ReactNode;
  error?: string;
  onChange: (id: string) => void;
  /** For focusing the field (React Hook Form's field.ref, for validation errors). */
  buttonRef?: (el: HTMLButtonElement | null) => void;
  emptyText?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [library, setLibrary] = useState<MediaImage[]>(images);
  const changeRef = useRef<HTMLButtonElement | null>(null);
  const current = library.find((i) => i.id === value) ?? images.find((i) => i.id === value) ?? null;

  const openPicker = async () => {
    setOpen(true);
    setLoading(true);
    try {
      setLibrary(await getLibraryImages());
    } catch {
      // Keep what we have; the picker still works with it.
    } finally {
      setLoading(false);
    }
  };

  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset className="grid min-w-0 gap-3" aria-describedby={describedBy}>
      <legend className="mb-1 text-sm font-semibold">
        {label}
        {!required && <span className="font-normal text-muted-foreground"> (optional)</span>}
      </legend>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex aspect-4/3 w-full max-w-44 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-muted">
          {current?.url ? (
            <Image src={current.url} alt="" fill sizes="176px" className="object-cover" />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="grid min-w-0 gap-3">
          <p className="text-sm">
            {current ? (
              <>
                <span className="font-medium">{current.alt}</span>
                <span className="block text-muted-foreground">
                  {current.width} × {current.height}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">{value ? "The selected photo couldn't be shown." : emptyText}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              ref={(el) => {
                changeRef.current = el;
                buttonRef?.(el);
              }}
              type="button"
              variant="outline"
              aria-invalid={error ? true : undefined}
              onClick={() => void openPicker()}
            >
              {value ? "Change photo" : "Choose photo"}
              <span className="sr-only">: {label}</span>
            </Button>
            {!required && value && (
              <Button type="button" variant="ghost" onClick={() => onChange("")}>
                Remove photo<span className="sr-only">: {label}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
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
        selectedId={value}
        use={use}
        title={`Choose a photo: ${label}`}
        onSelect={(image) => onChange(image.id)}
        onUploaded={(image) => setLibrary((l) => [image, ...l.filter((i) => i.id !== image.id)])}
        onDeleted={(deletedId) => {
          setLibrary((l) => l.filter((i) => i.id !== deletedId));
          // An unsaved choice of the deleted photo can't stay in the field.
          if (value === deletedId) onChange("");
        }}
        returnFocus={changeRef}
      />
    </fieldset>
  );
}
