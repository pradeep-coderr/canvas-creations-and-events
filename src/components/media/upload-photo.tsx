"use client";

import { useEffect, useId, useRef, useState } from "react";
import { finalizeImageUpload } from "@/app/admin/(portal)/content/media/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ALT_MAX, CMS_MEDIA_BUCKET, IMAGE_MAX_BYTES, imageTypes, type ImageUse, type MediaImage } from "@/lib/media/types";
import { createClient } from "@/lib/supabase/client";

/*
 * The one photo-upload form (media library, and every photo picker).
 * 1. Quick checks in the browser (type, size, a description) for fast feedback.
 * 2. The raw file goes straight to Storage at incoming/<uuid> with the admin's
 *    session (Storage RLS: admins only; bucket limits type and size).
 * 3. finalizeImageUpload checks it again on the server (real bytes, full
 *    decode), stores the prepared image and creates the library entry.
 */

const accept = Object.keys(imageTypes).join(",");

export function UploadPhoto({
  use,
  onUploaded,
  onCancel,
}: {
  use: ImageUse;
  onUploaded: (image: MediaImage, message: string) => void;
  onCancel?: () => void;
}) {
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  const [errors, setErrors] = useState<{ file?: string; alt?: string }>({});
  const [status, setStatus] = useState<{ kind: "working" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const altRef = useRef<HTMLTextAreaElement>(null);

  // Free the local preview when it changes or the form closes.
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const choose = (next: File | null) => {
    setStatus(null);
    setErrors((e) => ({ ...e, file: undefined }));
    setFile(next);
    setPreview(next ? URL.createObjectURL(next) : null);
  };

  const checkFile = (f: File | null) => {
    if (!f) return "Choose a photo to upload.";
    if (!(f.type in imageTypes)) return "Choose a JPEG, PNG or WebP photo.";
    if (f.size > IMAGE_MAX_BYTES) return "The photo is larger than 10 MB. Choose a smaller file.";
    return undefined;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation(); // never submit an outer form (pickers live inside CMS forms)
    if (status?.kind === "working") return;
    const fileError = checkFile(file);
    const altError = alt.trim() ? undefined : "Describe the photo for people who can't see it.";
    setErrors({ file: fileError, alt: altError });
    if (fileError) return fileRef.current?.focus();
    if (altError) return altRef.current?.focus();

    setStatus({ kind: "working", text: "Uploading…" });
    const incomingPath = `incoming/${crypto.randomUUID()}`;
    const upload = await createClient()
      .storage.from(CMS_MEDIA_BUCKET)
      .upload(incomingPath, file!, { contentType: file!.type, upsert: false });
    if (upload.error) {
      setStatus({ kind: "error", text: "This image could not be uploaded. Check your connection and try again." });
      return;
    }

    setStatus({ kind: "working", text: "Checking and preparing the photo…" });
    let result: Awaited<ReturnType<typeof finalizeImageUpload>>;
    try {
      result = await finalizeImageUpload({ incomingPath, alt, use, originalFilename: file!.name });
    } catch {
      setStatus({ kind: "error", text: "This image could not be uploaded. Check your connection and try again." });
      return;
    }
    if (!result.ok) {
      if (result.fieldErrors?.alt) {
        setErrors({ alt: result.fieldErrors.alt });
        altRef.current?.focus();
      }
      setStatus({ kind: "error", text: result.error });
      return;
    }
    setStatus(null);
    onUploaded(result.item, result.message);
  };

  const working = status?.kind === "working";

  return (
    <form onSubmit={submit} noValidate className="grid gap-5" aria-busy={working}>
      <div className="grid gap-2">
        <label htmlFor={`${id}-file`} className="text-sm font-semibold">
          Photo
        </label>
        <input
          ref={fileRef}
          id={`${id}-file`}
          type="file"
          accept={accept}
          className="block w-full text-sm file:mr-4 file:h-11 file:rounded-md file:border file:border-foreground/20 file:bg-background file:px-4 file:font-semibold file:text-foreground hover:file:bg-muted"
          aria-invalid={errors.file ? true : undefined}
          aria-describedby={`${id}-file-hint${errors.file ? ` ${id}-file-error` : ""}`}
          onChange={(e) => choose(e.target.files?.[0] ?? null)}
        />
        <p id={`${id}-file-hint`} className="text-sm text-muted-foreground">
          JPEG, PNG or WebP, up to 10 MB. Location data and other hidden details are removed; very large photos are
          resized.
        </p>
        {errors.file && (
          <p id={`${id}-file-error`} role="alert" className="text-sm font-medium text-destructive">
            {errors.file}
          </p>
        )}
      </div>

      {preview && (
        // Local preview of the chosen file (not yet uploaded).
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="max-h-56 w-auto justify-self-start rounded-sm bg-muted object-contain" />
      )}

      <div className="grid gap-2">
        <label htmlFor={`${id}-alt`} className="text-sm font-semibold">
          Description (alt text)
        </label>
        <Textarea
          ref={altRef}
          id={`${id}-alt`}
          rows={2}
          maxLength={ALT_MAX}
          value={alt}
          onChange={(e) => {
            setAlt(e.target.value.replace(/[\r\n]+/g, " "));
            setErrors((er) => ({ ...er, alt: undefined }));
          }}
          aria-invalid={errors.alt ? true : undefined}
          aria-describedby={`${id}-alt-hint${errors.alt ? ` ${id}-alt-error` : ""}`}
        />
        <p id={`${id}-alt-hint`} className="text-sm text-muted-foreground">
          What the photo shows, for people using screen readers. For example: “Blush roses and gold candles on a
          long wedding table.”
        </p>
        {errors.alt && (
          <p id={`${id}-alt-error`} role="alert" className="text-sm font-medium text-destructive">
            {errors.alt}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" aria-disabled={working || undefined}>
          {working ? status.text : "Upload photo"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
      <p role="alert" className="text-sm font-medium text-destructive empty:hidden">
        {status?.kind === "error" && status.text}
      </p>
      <p role="status" className="sr-only">
        {working ? status.text : ""}
      </p>
    </form>
  );
}
