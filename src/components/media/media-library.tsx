"use client";

import { useId, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Plus } from "lucide-react";
import {
  addVideoLink,
  deleteMedia,
  getLibraryImages,
  setVideoPoster,
  updateImageAlt,
  updateVideoTitle,
} from "@/app/admin/(portal)/content/media/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { describeActionFailure } from "@/lib/admin/action-error";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ALT_MAX, TITLE_MAX, videoProviderLabels, type MediaImage, type MediaVideo } from "@/lib/media/types";
import { cn } from "@/lib/utils";
import { MediaPicker } from "./media-picker";
import { UploadPhoto } from "./upload-photo";

/*
 * The media library: every photo and video the website can use. Photos are
 * uploaded once and reused anywhere; deleting is only possible when nothing
 * (published or draft) uses the item — the database enforces it too.
 */

type Status = { kind: "success" | "error"; text: string } | null;

const formatSize = (bytes: number | null) =>
  bytes === null ? null : bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function Usage({ usage }: { usage: string[] }) {
  if (usage.length === 0) {
    return <span className="inline-flex rounded-sm border border-dashed border-foreground/40 px-2 py-0.5 text-xs font-semibold text-muted-foreground">Unused</span>;
  }
  return (
    <div className="text-xs">
      <span className="font-semibold">Used by:</span>
      <ul className="mt-1 list-disc pl-4 text-muted-foreground">
        {usage.map((u) => (
          <li key={u}>{u}</li>
        ))}
      </ul>
    </div>
  );
}

export function MediaLibrary({
  tab,
  images,
  videos,
  uploadedVideoConfigured,
}: {
  tab: "photos" | "videos";
  images: MediaImage[];
  videos: MediaVideo[];
  uploadedVideoConfigured: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(null);
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editing, setEditing] = useState<MediaImage | null>(null);
  const [replacing, setReplacing] = useState<MediaImage | null>(null);
  const [deleting, setDeleting] = useState<{ id: string; name: string; kind: "photo" | "video" } | null>(null);
  const uploadButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const report = (r: { ok: boolean; message?: string; error?: string }) =>
    setStatus(r.ok ? { kind: "success", text: r.message ?? "Done." } : { kind: "error", text: r.error ?? "Something went wrong." });

  const q = query.trim().toLowerCase();
  const shownImages = q
    ? images.filter((i) => `${i.alt} ${i.originalFilename ?? ""}`.toLowerCase().includes(q))
    : images;

  const tabs = [
    { key: "photos", label: `Photos (${images.length})`, href: "/admin/content/media" },
    { key: "videos", label: `Videos (${videos.length})`, href: "/admin/content/media?tab=videos" },
  ] as const;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 ref={headingRef} tabIndex={-1} className="font-display text-display-md font-title outline-none">
          Media library
        </h1>
        {tab === "photos" && (
          <Button ref={uploadButton} onClick={() => setUploadOpen(true)}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Upload photo
          </Button>
        )}
      </div>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Photos and videos for the website. Upload a photo once and use it anywhere. Anything still used on the
        website (published or draft) can&apos;t be deleted.
      </p>

      <nav aria-label="Media type" className="mt-6">
        <ul className="flex gap-2 border-b border-border">
          {tabs.map((t) => (
            <li key={t.key}>
              <Link
                href={t.href as never}
                aria-current={tab === t.key ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex h-11 items-center border-b-2 px-3 text-sm font-semibold",
                  tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 min-h-5 text-sm">
        <p role="status">{status?.kind === "success" && <span className="text-muted-foreground">{status.text}</span>}</p>
        <p role="alert" className="font-medium text-destructive">
          {status?.kind === "error" && status.text}
        </p>
      </div>

      {tab === "photos" ? (
        <>
          {images.length > 0 && (
            <Input
              type="search"
              className="mt-4 max-w-md"
              aria-label="Search photos by description or file name"
              placeholder="Search by description or file name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          )}
          {images.length === 0 ? (
            <div className="mt-6 bg-background p-10 text-center">
              <p className="font-display text-display-sm">No photos yet</p>
              <p className="mt-2 text-muted-foreground">Upload your first photo to start building the portfolio.</p>
            </div>
          ) : shownImages.length === 0 ? (
            <p className="mt-6 text-muted-foreground">No photos match “{query}”.</p>
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy={isPending}>
              {shownImages.map((image) => (
                <li key={image.id} className="flex flex-col bg-background">
                  <div className="relative aspect-4/3 bg-muted">
                    {image.url && (
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        sizes="(min-width: 1280px) 300px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <p className="text-sm font-medium break-words">{image.alt}</p>
                    {image.credit && (
                      <p className="text-xs text-muted-foreground">
                        Source:{" "}
                        {image.credit.href ? (
                          <a href={image.credit.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                            {image.credit.text}
                            <span className="sr-only"> (opens in a new tab)</span>
                          </a>
                        ) : (
                          image.credit.text
                        )}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {image.width} × {image.height}
                      {formatSize(image.fileSize) && ` · ${formatSize(image.fileSize)}`}
                      {image.originalFilename && <span className="block truncate">{image.originalFilename}</span>}
                    </p>
                    <Usage usage={image.usage} />
                    <div className="mt-auto flex flex-wrap gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          returnFocus.current = e.currentTarget;
                          setEditing(image);
                        }}
                      >
                        Edit description<span className="sr-only">: {image.alt}</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          returnFocus.current = e.currentTarget;
                          setReplacing(image);
                        }}
                      >
                        Replace<span className="sr-only"> photo: {image.alt}</span>
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={image.usage.length > 0}
                        aria-describedby={image.usage.length > 0 ? `used-${image.id}` : undefined}
                        onClick={(e) => {
                          returnFocus.current = e.currentTarget;
                          setDeleting({ id: image.id, name: image.alt, kind: "photo" });
                        }}
                      >
                        Delete<span className="sr-only">: {image.alt}</span>
                      </Button>
                    </div>
                    {image.usage.length > 0 && (
                      <p id={`used-${image.id}`} className="text-xs text-muted-foreground">
                        Still used, so it can&apos;t be deleted. Replace it where it&apos;s used first.
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <VideosTab
          images={images}
          videos={videos}
          uploadedVideoConfigured={uploadedVideoConfigured}
          onResult={(r) => {
            report(r);
            if (r.ok) router.refresh();
          }}
          onDelete={(video, button) => {
            returnFocus.current = button;
            setDeleting({ id: video.id, name: video.title, kind: "video" });
          }}
        />
      )}

      {/* Upload */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            uploadButton.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Upload a photo</DialogTitle>
            <DialogDescription>It&apos;s added to your media library, ready to use anywhere on the website.</DialogDescription>
          </DialogHeader>
          <UploadPhoto
            use="library"
            onCancel={() => setUploadOpen(false)}
            onUploaded={(_image, message) => {
              setUploadOpen(false);
              setStatus({ kind: "success", text: message });
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Replace a photo's file (same library entry, so every use updates) */}
      <Dialog open={!!replacing} onOpenChange={(open) => !open && setReplacing(null)}>
        <DialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            returnFocus.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Replace this photo</DialogTitle>
            <DialogDescription>
              Upload the new version. Everywhere this photo is used ({replacing?.usage.length ? replacing.usage.join(", ") : "nowhere yet"}) will show it.
            </DialogDescription>
          </DialogHeader>
          {replacing && (
            <UploadPhoto
              use="library"
              replace={{ id: replacing.id, alt: replacing.alt }}
              onCancel={() => setReplacing(null)}
              onUploaded={(_image, message) => {
                setReplacing(null);
                setStatus({ kind: "success", text: message });
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit description */}
      <EditDescription
        image={editing}
        onClose={() => setEditing(null)}
        returnFocus={returnFocus}
        onSaved={(message) => {
          setStatus({ kind: "success", text: message });
          router.refresh();
        }}
      />

      {/* Delete */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting?.kind === "video" ? "Remove this video from the library?" : "Delete this photo?"}
        description={
          <p>
            “{deleting?.name}” will be permanently {deleting?.kind === "video" ? "removed from the library" : "deleted"}.
            This can&apos;t be undone.
          </p>
        }
        confirmLabel={deleting?.kind === "video" ? "Remove video" : "Delete photo"}
        destructive
        returnFocus={returnFocus}
        onConfirm={async () => {
          if (!deleting) return;
          let result: Awaited<ReturnType<typeof deleteMedia>>;
          try {
            result = await deleteMedia(deleting.id);
          } catch (error) {
            return describeActionFailure(error).text;
          }
          if (!result.ok) return result.error;
          returnFocus.current = headingRef.current;
          startTransition(() => {
            report(result);
            router.refresh();
          });
        }}
      />
    </>
  );
}

function EditDescription({
  image,
  onClose,
  onSaved,
  returnFocus,
}: {
  image: MediaImage | null;
  onClose: () => void;
  onSaved: (message: string) => void;
  returnFocus: React.RefObject<HTMLElement | null>;
}) {
  const id = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  return (
    <Dialog
      open={!!image}
      onOpenChange={(open) => {
        if (open && image) setValue(image.alt);
        if (!open) {
          setError(null);
          onClose();
        }
      }}
    >
      <DialogContent
        onOpenAutoFocus={() => {
          setValue(image?.alt ?? "");
          setError(null);
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          returnFocus.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Photo description</DialogTitle>
          <DialogDescription>
            Read out by screen readers wherever this photo is used. Describe what the photo shows.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!image || saving) return;
            setSaving(true);
            const result = await updateImageAlt(image.id, value).catch((error: unknown) => ({
              ok: false as const,
              error: describeActionFailure(error).text,
            }));
            setSaving(false);
            if (!result.ok) return setError(result.error);
            onSaved(result.message);
            onClose();
          }}
        >
          <label htmlFor={`${id}-alt`} className="text-sm font-semibold">
            Description (alt text)
          </label>
          <Textarea
            id={`${id}-alt`}
            rows={3}
            maxLength={ALT_MAX}
            value={value}
            onChange={(e) => {
              setValue(e.target.value.replace(/[\r\n]+/g, " "));
              setError(null);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          {error && (
            <p id={`${id}-error`} role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" pending={saving} pendingLabel="Saving…">
              Save description
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** A video's cover photo and title (the cover is shown wherever the video appears). */
function VideoDetails({
  video,
  images,
  onResult,
}: {
  video: MediaVideo;
  images: MediaImage[];
  onResult: (r: { ok: boolean; message?: string; error?: string }) => void;
}) {
  const id = useId();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [library, setLibrary] = useState(images);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<null | "poster" | "remove" | "title">(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(video.title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const coverButton = useRef<HTMLButtonElement>(null);

  const run = async (kind: "poster" | "remove" | "title", work: () => Promise<{ ok: boolean; message?: string; error?: string }>) => {
    setBusy(kind);
    try {
      const result = await work();
      onResult(result);
      return result;
    } catch (error) {
      const result = { ok: false, error: describeActionFailure(error).text };
      onResult(result);
      return result;
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-3 sm:grid-cols-[12rem_1fr] sm:gap-5">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {video.posterUrl ? (
          <Image src={video.posterUrl} alt="" fill sizes="192px" className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center p-3 text-center text-xs text-muted-foreground">
            No cover photo (the Canvas cover is shown)
          </span>
        )}
      </div>
      <div className="grid content-start gap-2">
        {editingTitle ? (
          <form
            noValidate
            className="grid gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy) return;
              const result = await run("title", () => updateVideoTitle(video.id, title));
              if (result.ok) setEditingTitle(false);
              else setTitleError(result.error ?? null);
            }}
          >
            <label htmlFor={`${id}-title`} className="text-sm font-semibold">
              Title
            </label>
            <Input
              id={`${id}-title`}
              maxLength={TITLE_MAX}
              value={title}
              autoFocus
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError(null);
              }}
              aria-invalid={titleError ? true : undefined}
              aria-describedby={titleError ? `${id}-title-error` : undefined}
            />
            {titleError && (
              <p id={`${id}-title-error`} role="alert" className="text-sm font-medium text-destructive">
                {titleError}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" pending={busy === "title"} pendingLabel="Saving…" aria-disabled={title.trim() === video.title || undefined}>
                Save title
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTitle(video.title);
                  setTitleError(null);
                  setEditingTitle(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <p className="font-semibold break-words">{video.title}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {!editingTitle && (
            <Button type="button" variant="outline" onClick={() => setEditingTitle(true)}>
              Edit title<span className="sr-only">: {video.title}</span>
            </Button>
          )}
          <Button
            ref={coverButton}
            type="button"
            variant="outline"
            pending={busy === "poster"}
            pendingLabel="Saving cover…"
            onClick={async () => {
              setPickerOpen(true);
              setLoading(true);
              try {
                setLibrary(await getLibraryImages());
              } catch {
                // Keep the list we have.
              } finally {
                setLoading(false);
              }
            }}
          >
            {video.posterId ? "Change cover photo" : "Choose cover photo"}
            <span className="sr-only">: {video.title}</span>
          </Button>
          {video.posterId && (
            <Button
              type="button"
              variant="ghost"
              pending={busy === "remove"}
              pendingLabel="Removing…"
              onClick={() => void run("remove", () => setVideoPoster(video.id, null))}
            >
              Remove cover<span className="sr-only">: {video.title}</span>
            </Button>
          )}
        </div>
      </div>
      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        images={library}
        loading={loading}
        selectedId={video.posterId ?? ""}
        use="posters"
        title={`Cover photo: ${video.title}`}
        onUploaded={(image) => setLibrary((l) => [image, ...l.filter((i) => i.id !== image.id)])}
        onSelect={(image) => void run("poster", () => setVideoPoster(video.id, image.id))}
        onDeleted={(deletedId) => setLibrary((l) => l.filter((i) => i.id !== deletedId))}
        returnFocus={coverButton}
      />
    </div>
  );
}

function VideosTab({
  images,
  videos,
  uploadedVideoConfigured,
  onResult,
  onDelete,
}: {
  images: MediaImage[];
  videos: MediaVideo[];
  uploadedVideoConfigured: boolean;
  onResult: (r: { ok: boolean; message?: string; error?: string }) => void;
  onDelete: (video: MediaVideo, button: HTMLElement) => void;
}) {
  const id = useId();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  return (
    <div className="mt-4 grid gap-8">
      <form
        noValidate
        className="grid max-w-xl gap-4 bg-background p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (saving) return;
          setSaving(true);
          const result = await addVideoLink({ url, title }).catch((error: unknown) => ({
            ok: false as const,
            error: describeActionFailure(error).text,
            fieldErrors: undefined,
          }));
          setSaving(false);
          if (!result.ok) {
            setErrors(result.fieldErrors ?? {});
            onResult(result);
            return;
          }
          setUrl("");
          setTitle("");
          setErrors({});
          onResult(result);
        }}
      >
        <h2 className="text-eyebrow font-semibold text-emphasis uppercase">Add a YouTube or Vimeo video</h2>
        <div className="grid gap-2">
          <label htmlFor={`${id}-url`} className="text-sm font-semibold">
            Link
          </label>
          <Input
            id={`${id}-url`}
            inputMode="url"
            maxLength={500}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-invalid={errors.url ? true : undefined}
            aria-describedby={`${id}-url-hint${errors.url ? ` ${id}-url-error` : ""}`}
          />
          <p id={`${id}-url-hint`} className="text-sm text-muted-foreground">
            From the video&apos;s Share button on YouTube or Vimeo. The video stays on YouTube or Vimeo; nothing is
            uploaded.
          </p>
          {errors.url && (
            <p id={`${id}-url-error`} role="alert" className="text-sm font-medium text-destructive">
              {errors.url}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <label htmlFor={`${id}-title`} className="text-sm font-semibold">
            Title
          </label>
          <Input
            id={`${id}-title`}
            maxLength={TITLE_MAX}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? `${id}-title-error` : undefined}
          />
          {errors.title && (
            <p id={`${id}-title-error`} role="alert" className="text-sm font-medium text-destructive">
              {errors.title}
            </p>
          )}
        </div>
        <Button type="submit" className="justify-self-start" pending={saving} pendingLabel="Adding video…">
          Add video
        </Button>
      </form>

      <div className="max-w-xl border-l-2 border-highlight pl-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Uploaded video</p>
        <p className="mt-1">
          {uploadedVideoConfigured
            ? "An uploaded-video provider is configured for playback. Uploading from the admin isn't available yet."
            : "Uploaded video is not configured yet. Add a YouTube or Vimeo link instead. (Video files are never stored with the photos.)"}
        </p>
      </div>

      {videos.length === 0 ? (
        <div className="bg-background p-10 text-center">
          <p className="font-display text-display-sm">No video added yet</p>
          <p className="mt-2 text-muted-foreground">
            Add a YouTube or Vimeo link, or connect an uploaded-video provider.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border border-y border-border bg-background">
          {videos.map((video) => (
            <li key={video.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="min-w-0 flex-1">
                <VideoDetails video={video} images={images} onResult={onResult} />
                <p className="mt-3 text-sm text-muted-foreground">{videoProviderLabels[video.provider]}</p>
                {video.sourceUrl && (
                  <a
                    href={video.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm break-all underline underline-offset-4"
                  >
                    Open on {videoProviderLabels[video.provider]}
                    <span className="sr-only"> (opens in a new tab)</span>
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                )}
                <div className="mt-2">
                  <Usage usage={video.usage} />
                </div>
              </div>
              <Button
                variant="destructive"
                disabled={video.usage.length > 0}
                onClick={(e) => onDelete(video, e.currentTarget)}
              >
                Remove<span className="sr-only">: {video.title}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
