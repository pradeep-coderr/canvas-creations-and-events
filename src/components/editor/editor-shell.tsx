"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, PencilLine } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { textStylesCss } from "@/lib/styles/schema";
import { EditorProvider, useEditor, type EditorData } from "./editor-context";
import { ChromePanelButton } from "./editor-section";
import "./editor.css";

/*
 * The visual editor around the real website: a slim toolbar (status, Save,
 * Preview, Exit) and the page itself. Inside the page, links and the
 * enquiry form are switched off so nothing navigates away or sends a real
 * enquiry while editing; hash links still scroll to their section.
 */

function Toolbar() {
  const editor = useEditor();
  const router = useRouter();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const exitRef = useRef<HTMLButtonElement>(null);
  const { unsavedCount: unsaved, mode, status } = editor;
  const preview = mode === "preview";

  // Closing the tab or reloading with unsaved changes: the browser's own prompt.
  useEffect(() => {
    if (!unsaved) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  const leave = () => {
    setLeaving(true);
    router.push("/admin");
  };

  const exit = () => (unsaved ? setLeaveOpen(true) : leave());

  const saveAndLeave = async () => {
    if (await editor.saveAll()) {
      setLeaveOpen(false);
      leave();
    } else {
      setLeaveOpen(false);
    }
  };

  const summary = unsaved
    ? `${unsaved} unsaved change${unsaved === 1 ? "" : "s"}`
    : status?.kind === "success"
      ? status.text
      : "All changes saved";

  return (
    <div className="cc-toolbar" role="region" aria-label="Website editor">
      <div className="cc-toolbar-inner">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg leading-tight font-title">
            {preview ? "Previewing website" : "Editing website"}
          </p>
          <p role="status" className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            {unsaved ? (
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-primary" />
            ) : (
              <Check aria-hidden="true" className="size-3.5 shrink-0 text-emphasis" />
            )}
            <span className="truncate">{summary}</span>
          </p>
        </div>
        {/* Icon-only on phones (with a spoken label), text from sm up. */}
        {!preview && <ChromePanelButton />}
        <Button
          type="button"
          variant="outline"
          aria-pressed={preview}
          className="max-sm:size-11 max-sm:px-0"
          onClick={() => editor.setMode(preview ? "edit" : "preview")}
        >
          {preview ? <PencilLine aria-hidden="true" /> : <Eye aria-hidden="true" />}
          <span className="max-sm:sr-only">{preview ? "Back to editing" : "Preview"}</span>
        </Button>
        <Button
          type="button"
          aria-disabled={!unsaved || undefined}
          pending={editor.saving}
          pendingLabel="Saving…"
          onClick={() => unsaved && !editor.saving && void editor.saveAll()}
        >
          Save
        </Button>
        <Button ref={exitRef} type="button" variant="ghost" className="max-sm:px-3" onClick={exit} aria-disabled={leaving || undefined}>
          Exit
        </Button>
      </div>
      <p role="alert" className="cc-toolbar-alert">
        {status?.kind === "error" && status.text}
      </p>

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            exitRef.current?.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Leave with unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have {unsaved} unsaved change{unsaved === 1 ? "" : "s"}. If you leave without saving, they&apos;ll
              be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <Button type="button" variant="destructive" onClick={leave}>
              Leave without saving
            </Button>
            <Button type="button" onClick={() => void saveAndLeave()}>
              Save and leave
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** The page: links don't navigate and forms don't send while editing. */
function Canvas({ children }: { children: React.ReactNode }) {
  const { announce } = useEditor();

  // React events bubble through portals, so dialogs (photo pickers, panels)
  // reach these handlers too: only act on the page itself.
  const onPage = (event: React.SyntheticEvent<HTMLDivElement>) => event.currentTarget.contains(event.target as Node);

  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onPage(event)) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-editor-control]")) return;
    const link = target.closest("a[href]");
    if (!link) return;
    event.preventDefault();
    const href = link.getAttribute("href") ?? "";
    const hash = href.includes("#") ? href.slice(href.indexOf("#") + 1) : "";
    const section = hash ? document.getElementById(hash) : null;
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    else announce("success", "Links are turned off while editing, so you stay in the editor.");
  };

  const onSubmitCapture = (event: React.SyntheticEvent<HTMLDivElement>) => {
    if (!onPage(event)) return;
    const form = event.target as HTMLElement;
    if (form.closest("[data-editor-control]")) return;
    event.preventDefault();
    event.stopPropagation();
    announce("success", "The enquiry form doesn't send from the editor.");
  };

  return (
    <div className="cc-canvas" onClickCapture={onClickCapture} onSubmitCapture={onSubmitCapture}>
      {children}
    </div>
  );
}

/** Text style presets, live: the saved ones plus any just chosen. */
function LiveStyles() {
  const { styles } = useEditor();
  return <style>{textStylesCss(styles.text)}</style>;
}

export function EditorShell({ data, children }: { data: EditorData; children: React.ReactNode }) {
  return (
    <EditorProvider data={data}>
      <LiveStyles />
      <Toolbar />
      <Canvas>{children}</Canvas>
    </EditorProvider>
  );
}
