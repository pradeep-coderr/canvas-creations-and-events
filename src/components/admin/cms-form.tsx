"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type DefaultValues, type FieldValues, type Path, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import type { CmsResult } from "@/app/admin/(portal)/content/actions";
import { ConfirmDialog } from "./confirm-dialog";

type Status = { kind: "success" | "error"; text: string } | null;

/** Options for using a CMS form inside another screen (the visual editor). */
export interface InlineFormOptions {
  /** No sticky save bar; adds a Cancel button when onCancel is given. */
  inline?: boolean;
  onSaved?: (result: Extract<CmsResult, { ok: true }>) => void;
  onCancel?: () => void;
  /** Reports unsaved changes, with a way to submit the form from outside. */
  onDirtyChange?: (dirty: boolean, submit: () => void) => void;
}

/**
 * Form shell shared by every CMS editor: client validation (same Zod schema
 * as the server), submit to a server action, field errors from the server,
 * a polite success message / assertive error message, and the explicit
 * confirmation for hiding the last published FAQ. The actual fields are
 * content-specific (children).
 */
export function CmsForm<TIn extends FieldValues, TOut>({
  schema,
  defaultValues,
  save,
  submitLabel = "Save",
  initialMessage,
  createdUrl,
  children,
  inline = false,
  onSaved,
  onCancel,
  onDirtyChange,
}: InlineFormOptions & {
  schema: z.ZodType<TOut, TIn>;
  defaultValues: TIn;
  save: (values: TIn, confirmLastFaq: boolean) => Promise<CmsResult>;
  submitLabel?: string;
  /** Shown on load, e.g. "Service created." after arriving from the create form. */
  initialMessage?: string;
  /** Create forms: where to continue editing the new item. */
  createdUrl?: (id: string) => string;
  children: (form: UseFormReturn<TIn, unknown, TOut>) => React.ReactNode;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialMessage ? { kind: "success", text: initialMessage } : null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<TIn, unknown, TOut>({
    resolver: zodResolver(schema as never),
    defaultValues: defaultValues as DefaultValues<TIn>,
    mode: "onTouched",
  });

  const { isDirty } = form.formState;
  useEffect(() => {
    onDirtyChange?.(isDirty, () => formRef.current?.requestSubmit());
  }, [isDirty, onDirtyChange]);

  const submit = async (confirmLastFaq: boolean): Promise<string | void> => {
    // The server validates the raw values again with the same schema.
    const values = form.getValues();
    let result: CmsResult;
    try {
      result = await save(values, confirmLastFaq);
    } catch {
      const text = "Couldn't reach the server, so nothing was saved. Check your connection and try again.";
      setStatus({ kind: "error", text });
      return text;
    }

    if (result.ok) {
      setStatus({ kind: "success", text: result.message });
      form.reset(values);
      if (createdUrl && result.id) router.replace(createdUrl(result.id) as never);
      onSaved?.(result);
      return;
    }
    if (result.needsConfirmation === "last-faq" && !confirmLastFaq) {
      setStatus(null);
      setConfirmOpen(true);
      return;
    }
    if (result.fieldErrors) {
      const entries = Object.entries(result.fieldErrors);
      entries.forEach(([name, message], i) =>
        form.setError(name as Path<TIn>, { type: "server", message }, { shouldFocus: i === 0 }),
      );
    }
    setStatus({ kind: "error", text: result.error });
    return result.error;
  };

  return (
    <form
      ref={formRef}
      data-cms-form={inline ? undefined : ""}
      noValidate
      onSubmit={(event) => {
        // Ignore repeat presses while saving. The button isn't disabled:
        // disabling it would drop keyboard focus.
        if (form.formState.isSubmitting) return event.preventDefault();
        return form.handleSubmit(
          () => submit(false),
          () => setStatus({ kind: "error", text: "Check the highlighted fields." }),
        )(event);
      }}
    >
      <div className="grid gap-6">{children(form)}</div>

      {/* Always reachable on long forms (inline forms are short: no sticky bar). */}
      <div
        className={
          inline
            ? "mt-4 flex flex-col gap-3 border-t border-border bg-background px-6 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-8"
            : "sticky bottom-0 z-10 mt-6 flex flex-col gap-3 border-t border-border bg-background px-6 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-8"
        }
      >
        <Button
          ref={submitRef}
          type="submit"
          aria-disabled={form.formState.isSubmitting || undefined}
          className="w-full sm:w-auto"
        >
          {form.formState.isSubmitting ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <div className="min-h-5 text-sm">
          <p role="status" aria-live="polite">
            {status?.kind === "success" && <span className="text-muted-foreground">{status.text}</span>}
          </p>
          <p role="alert" className="font-medium text-destructive">
            {status?.kind === "error" && status.text}
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hide the FAQ section?"
        description={
          <>
            <p>This is the only published FAQ. Saving it as a draft removes the whole FAQ section from the website.</p>
            <p>The FAQ link in the site menu will then go nowhere until an FAQ is published again.</p>
          </>
        }
        confirmLabel="Save and hide FAQ section"
        destructive
        onConfirm={() => submit(true)}
        returnFocus={submitRef}
      />
    </form>
  );
}
