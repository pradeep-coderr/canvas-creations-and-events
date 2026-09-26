"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Paintbrush, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paragraphsFromText } from "@/lib/cms/singletons";
import { fieldDef, validateField, type EditorScope } from "@/lib/editor/fields";
import { isStyleKey } from "@/lib/styles/schema";
import { cn } from "@/lib/utils";
import { useEditor } from "./editor-context";
import { TextStyleControls } from "./style-controls";

/*
 * Page text that can be edited where it appears. It is never contenteditable:
 * in edit mode the text is a button; activating it swaps in a controlled
 * input styled like the text around it, with Save / Cancel. Drafts are kept
 * in the editor state (marked "unsaved") until saved. In preview mode it
 * renders plain text, exactly like the public site.
 */

type Lines = [string, string, string];

/** How a value is shown on the page. */
function Display({ kind, value }: { kind: string; value: unknown }) {
  if (kind === "lines") {
    const lines = (value as Lines).filter(Boolean);
    return lines.map((line, i) => (
      // Same markup as the Why Canvas heading: one line per block, a space between for screen readers.
      <span key={i} className="block">
        {i > 0 && " "}
        {line}
      </span>
    ));
  }
  if (kind === "paragraphs") {
    return paragraphsFromText(String(value ?? "")).map((p, i) => (
      <span key={i} className={cn("block", i > 0 && "mt-5")}>
        {p}
      </span>
    ));
  }
  return String(value ?? "");
}

export function EditableText({ scope, field }: { scope: EditorScope; field: string }) {
  const editor = useEditor();
  const def = fieldDef(scope, field);
  const kind = def?.kind ?? "line";
  const label = def?.label ?? field;
  const value = editor.value(scope, field);
  const draft = editor.hasDraft(scope, field);
  const serverError = editor.error(scope, field);
  const [open, setOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [styling, setStyling] = useState(false);
  const styleKey = `${scope}.${field}`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const returnFocus = useRef(false);
  const id = useId();
  const error = localError ?? serverError;

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else if (returnFocus.current) {
      returnFocus.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  if (editor.mode === "preview") return <Display kind={kind} value={value} />;

  const close = () => {
    returnFocus.current = true;
    setLocalError(null);
    setOpen(false);
  };

  const save = async () => {
    const problem = validateField(scope, field, value);
    if (problem) {
      setLocalError(problem);
      inputRef.current?.focus();
      return;
    }
    if (!draft) return close();
    if (await editor.saveScope(scope, [field])) close();
  };

  const cancel = () => {
    editor.discardDraft(scope, field);
    close();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      // Close but keep the change as an unsaved draft (never silently discarded).
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === "Enter" && (kind === "line" || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void save();
    }
  };

  if (!open) {
    return (
      <button
        ref={triggerRef}
        type="button"
        className="cc-editable"
        data-unsaved={draft || undefined}
        data-invalid={serverError ? true : undefined}
        data-editor-control=""
        onClick={() => setOpen(true)}
      >
        <span className="sr-only">Edit {label}: </span>
        {def?.optional && !String(value ?? "").trim() ? (
          // Empty optional text: something to click (the website shows nothing).
          <span className="cc-placeholder">Add {label.toLowerCase()}</span>
        ) : (
          <Display kind={kind} value={value} />
        )}
        {draft && <span className="sr-only"> (unsaved change)</span>}
        <span aria-hidden="true" className="cc-editable-badge">
          <Pencil />
        </span>
      </button>
    );
  }

  const describedBy = [error && `${id}-error`, def?.hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  const set = (next: unknown) => {
    setLocalError(null);
    editor.setDraft(scope, field, next);
  };

  return (
    <span className="cc-editing" data-editor-control="" onKeyDown={onKeyDown}>
      {kind === "lines" ? (
        <span className="grid gap-2">
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              ref={i === 0 ? inputRef : undefined}
              className="cc-edit-input"
              aria-label={`${label}, line ${i + 1}${i > 0 ? " (optional)" : ""}`}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              maxLength={200}
              value={(value as Lines)[i] ?? ""}
              onChange={(e) => {
                const next = [...(value as Lines)] as Lines;
                next[i] = e.target.value;
                set(next);
              }}
            />
          ))}
        </span>
      ) : kind === "line" ? (
        <input
          ref={inputRef}
          className="cc-edit-input"
          aria-label={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          maxLength={200}
          value={String(value ?? "")}
          onChange={(e) => set(e.target.value)}
        />
      ) : (
        <textarea
          ref={inputRef}
          className="cc-edit-input"
          aria-label={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          maxLength={kind === "paragraphs" ? 12_000 : 2000}
          rows={kind === "paragraphs" ? 6 : 3}
          value={String(value ?? "")}
          onChange={(e) => set(e.target.value)}
        />
      )}
      {def?.hint && (
        <span id={`${id}-hint`} className="cc-edit-hint">
          {def.hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} role="alert" className="cc-edit-error">
          {error}
        </span>
      )}
      <span className="cc-edit-actions">
        <Button type="button" size="sm" className="h-11" onClick={() => void save()} aria-disabled={editor.saving || undefined}>
          {editor.saving ? "Saving…" : "Save"}
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-11" onClick={cancel}>
          Cancel
        </Button>
        {isStyleKey(styleKey) && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-11"
            aria-expanded={styling}
            onClick={() => setStyling((s) => !s)}
          >
            <Paintbrush data-icon="inline-start" aria-hidden="true" />
            Style
          </Button>
        )}
        <span className="cc-edit-tip">
          {kind === "line" ? "Enter to save · " : "Ctrl+Enter to save · "}Esc keeps it as unsaved
        </span>
      </span>
      {styling && isStyleKey(styleKey) && <TextStyleControls styleKey={styleKey} label={label} />}
    </span>
  );
}

/**
 * Text that lives inside a link or button on the page (so it can't be a
 * button itself). It shows the current value, drafts included, and is
 * edited from the section's "Edit section" panel.
 */
export function LiveText({ scope, field }: { scope: EditorScope; field: string }) {
  const editor = useEditor();
  return <>{String(editor.value(scope, field) ?? "")}</>;
}
