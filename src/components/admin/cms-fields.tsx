"use client";

import {
  Controller,
  get,
  type FieldValues,
  type Path,
  type UseFormReturn,
} from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MediaSlot } from "@/components/media/media-picker";
import { LINE_MAX, TEXT_MAX } from "@/lib/cms/fields";
import type { ImageUse, MediaImage } from "@/lib/media/types";
import { cn } from "@/lib/utils";

/*
 * Labelled, validated fields for the CMS forms (React Hook Form). Same
 * pattern as the public enquiry form: visible label, aria-invalid,
 * aria-describedby pointing at the hint and the error (role="alert").
 */

// Forms whose submitted type differs from their input type (Zod transforms).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CmsFormApi<T extends FieldValues> = UseFormReturn<T, any, any>;

interface BaseProps<T extends FieldValues> {
  form: CmsFormApi<T>;
  name: Path<T>;
  label: string;
  hint?: React.ReactNode;
  optional?: boolean;
  className?: string;
}

const fieldId = (name: string) => `cms-${name.replace(/\./g, "-")}`;

function useFieldState<T extends FieldValues>(form: CmsFormApi<T>, name: Path<T>, hasHint: boolean) {
  const id = fieldId(name);
  const error = get(form.formState.errors, name)?.message as string | undefined;
  const describedBy = [hasHint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return { id, error, describedBy };
}

function Label({ id, label, optional }: { id: string; label: string; optional?: boolean }) {
  return (
    <FieldLabel htmlFor={id}>
      {label}
      {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
    </FieldLabel>
  );
}

function Messages({ id, hint, error }: { id: string; hint?: React.ReactNode; error?: string }) {
  return (
    <>
      {hint && <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </>
  );
}

export function TextField<T extends FieldValues>({
  form,
  name,
  label,
  hint,
  optional,
  className,
  maxLength = LINE_MAX,
}: BaseProps<T> & { maxLength?: number }) {
  const { id, error, describedBy } = useFieldState(form, name, !!hint);
  return (
    <Field data-invalid={!!error || undefined} className={className}>
      <Label id={id} label={label} optional={optional} />
      <Input
        id={id}
        maxLength={maxLength}
        aria-required={!optional || undefined}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy}
        {...form.register(name)}
      />
      <Messages id={id} hint={hint} error={error} />
    </Field>
  );
}

export function TextAreaField<T extends FieldValues>({
  form,
  name,
  label,
  hint,
  optional,
  className,
  rows = 4,
  maxLength = TEXT_MAX,
}: BaseProps<T> & { rows?: number; maxLength?: number }) {
  const { id, error, describedBy } = useFieldState(form, name, !!hint);
  return (
    <Field data-invalid={!!error || undefined} className={className}>
      <Label id={id} label={label} optional={optional} />
      <Textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        aria-required={!optional || undefined}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy}
        {...form.register(name)}
      />
      <Messages id={id} hint={hint} error={error} />
    </Field>
  );
}

export function OrderField<T extends FieldValues>({ form, name, className }: Pick<BaseProps<T>, "form" | "name" | "className">) {
  const hint = "Lower numbers come first. You can also use the arrows in the list.";
  const { id, error, describedBy } = useFieldState(form, name, true);
  return (
    <Field data-invalid={!!error || undefined} className={cn("max-w-48", className)}>
      <Label id={id} label="Order" />
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy}
        {...form.register(name, { valueAsNumber: true })}
      />
      <Messages id={id} hint={hint} error={error} />
    </Field>
  );
}

/** A labelled checkbox with a sentence explaining what it does. */
export function CheckboxField<T extends FieldValues>({ form, name, label, hint, className }: BaseProps<T>) {
  const { id, error, describedBy } = useFieldState(form, name, !!hint);
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <Field orientation="horizontal" data-invalid={!!error || undefined} className={cn("items-start", className)}>
          <Checkbox
            id={id}
            ref={field.ref}
            checked={field.value === true}
            onCheckedChange={(v) => field.onChange(v === true)}
            onBlur={field.onBlur}
            aria-describedby={describedBy}
            className="mt-0.5"
          />
          <div className="flex flex-col gap-1">
            {/* The label toggles the box too, so the tap target is the whole line. */}
            <FieldLabel htmlFor={id} className="min-h-6 font-semibold">
              {label}
            </FieldLabel>
            <Messages id={id} hint={hint} error={error} />
          </div>
        </Field>
      )}
    />
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

const NONE = "__none__";

/**
 * shadcn Select bound to a string field. `noneLabel` adds an empty choice
 * (saved as ""). Disabled with an explanation when there's nothing to pick.
 */
export function SelectField<T extends FieldValues>({
  form,
  name,
  label,
  hint,
  optional,
  className,
  options,
  noneLabel,
  placeholder = "Choose…",
  disabled,
}: BaseProps<T> & {
  options: SelectOption[];
  noneLabel?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const { id, error, describedBy } = useFieldState(form, name, !!hint);
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <Field data-invalid={!!error || undefined} className={className}>
          <Label id={id} label={label} optional={optional} />
          <Select
            value={field.value ? String(field.value) : noneLabel ? NONE : ""}
            onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
            disabled={disabled}
          >
            <SelectTrigger
              id={id}
              ref={field.ref}
              onBlur={field.onBlur}
              aria-invalid={!!error || undefined}
              aria-describedby={describedBy}
              className="w-full"
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {noneLabel && <SelectItem value={NONE}>{noneLabel}</SelectItem>}
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Messages id={id} hint={hint} error={error} />
        </Field>
      )}
    />
  );
}

/** A titled panel grouping related fields (fieldset + legend). */
export function FormSection({
  id,
  title,
  description,
  children,
  className,
}: {
  id?: string;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <fieldset id={id} className={cn("min-w-0 scroll-mt-6 bg-background p-6 sm:p-8", className)}>
      <legend className="float-left w-full text-eyebrow font-semibold text-emphasis uppercase">{title}</legend>
      {description && <p className="clear-both pt-2 text-sm text-muted-foreground">{description}</p>}
      <div className="clear-both grid gap-6 pt-6">{children}</div>
    </fieldset>
  );
}

/** A photo field bound to the form: current photo, Change / Remove, library picker. */
export function MediaFormField<T extends FieldValues>({
  form,
  name,
  label,
  hint,
  optional,
  images,
  use,
  emptyText,
}: BaseProps<T> & { images: MediaImage[]; use: ImageUse; emptyText?: string }) {
  const error = get(form.formState.errors, name)?.message as string | undefined;
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <MediaSlot
          label={label}
          value={String(field.value ?? "")}
          images={images}
          required={!optional}
          use={use}
          hint={hint}
          error={error}
          emptyText={emptyText}
          buttonRef={field.ref}
          onChange={(id) => {
            field.onChange(id);
            field.onBlur();
          }}
        />
      )}
    />
  );
}
