"use client";

import { useState } from "react";
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

/**
 * Accessible confirmation (Radix AlertDialog: focus trap, Escape). These
 * dialogs are opened from code rather than a Radix Trigger, so the caller
 * says where focus goes on close (`returnFocus`), usually the button that
 * opened it. The dialog stays open while `onConfirm` runs and shows its
 * error in place; it closes only when the action succeeds.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pendingLabel,
  destructive = false,
  onConfirm,
  returnFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  /** Shown with a spinner while the action runs, e.g. "Deleting…". */
  pendingLabel?: string;
  destructive?: boolean;
  /** Returns an error message to show, or nothing on success. */
  onConfirm: () => Promise<string | void>;
  /** Element to focus when the dialog closes. */
  returnFocus?: React.RefObject<HTMLElement | null>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const change = (next: boolean) => {
    if (pending) return;
    if (!next) setError(null);
    onOpenChange(next);
  };

  const confirm = async () => {
    setPending(true);
    setError(null);
    let message: string | void;
    try {
      message = await onConfirm();
    } catch {
      message = "Couldn't reach the server, so nothing changed. Try again.";
    }
    setPending(false);
    if (message) setError(message);
    else onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={change}>
      <AlertDialogContent
        onCloseAutoFocus={(event) => {
          const target = returnFocus?.current;
          if (target?.isConnected) {
            event.preventDefault();
            target.focus();
          }
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={() => void confirm()}
            pending={pending}
            pendingLabel={pendingLabel ?? (destructive ? "Deleting…" : "Working…")}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
