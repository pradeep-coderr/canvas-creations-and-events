"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { enquirySection } from "@/data/home";
import { site } from "@/data/site";
import {
  enquirySchema,
  type Enquiry,
  type EnquiryInput,
  type EnquiryResult,
} from "@/lib/enquiry";
import { submitEnquiry } from "@/lib/submit-enquiry";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | EnquiryResult["status"];

const emptyForm: EnquiryInput = {
  name: "",
  email: "",
  phone: "",
  eventType: "",
  eventDate: "",
  venue: "",
  message: "",
};

// Simulated delivery for the /design-system preview only.
async function previewSubmit(): Promise<EnquiryResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { status: "sent", notified: true };
}

interface FieldConfig {
  name: FieldPath<EnquiryInput>;
  label: string;
  optional?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  wide?: boolean;
}

const fields: FieldConfig[] = [
  { name: "name", label: "Name", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone", optional: true, type: "tel", autoComplete: "tel", inputMode: "tel" },
  { name: "eventType", label: "Type of event", optional: true },
  { name: "eventDate", label: "Event date", optional: true },
  { name: "venue", label: "Venue or location", optional: true },
];

/**
 * Enquiry form. Validates in the browser, then calls the `submitEnquiry`
 * server action, which validates again and stores the enquiry. The success
 * state appears only after the database confirms the insert.
 *
 * `enabled` comes from the server (is Supabase configured?). When false the
 * form says so up front and never pretends to send.
 */
export function EnquiryForm({
  enabled = false,
  preview = false,
}: {
  enabled?: boolean;
  preview?: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  // False when the enquiry was stored but the business wasn't notified.
  const [notified, setNotified] = useState(true);
  const thanksRef = useRef<HTMLHeadingElement>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryInput, unknown, Enquiry>({
    resolver: zodResolver(enquirySchema),
    defaultValues: emptyForm,
    mode: "onTouched",
  });

  const live = preview || enabled;

  useEffect(() => {
    if (status === "sent") thanksRef.current?.focus();
  }, [status]);

  const onSubmit = async (enquiry: Enquiry, event?: React.BaseSyntheticEvent) => {
    // Read the honeypot from the submitted form (not part of the schema).
    const form = event?.target instanceof HTMLFormElement ? event.target : null;
    const honeypot = form ? String(new FormData(form).get("hp_field") ?? "") : "";
    setStatus("submitting");
    try {
      const result = preview
        ? await previewSubmit()
        : await submitEnquiry(enquiry, honeypot);
      if (result.status === "sent") {
        setNotified(result.notified);
        reset(emptyForm);
      }
      setStatus(result.status);
    } catch {
      // The server action itself failed (e.g. network): nothing was confirmed.
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="bg-background px-6 py-12 text-center sm:px-10">
        <h3
          ref={thanksRef}
          tabIndex={-1}
          className="font-display text-display-md font-medium outline-none"
        >
          Thank you.
        </h3>
        <p className="mt-4 text-muted-foreground">
          We&apos;ve received your enquiry.
        </p>
        {!notified && (
          <p className="mt-2 text-sm text-muted-foreground">
            If it&apos;s urgent, please also call us on{" "}
            <a
              href={site.contact.phone.href}
              className="font-semibold whitespace-nowrap text-foreground underline decoration-highlight/70 underline-offset-4 hover:text-primary"
            >
              {site.contact.phone.display}
            </a>
            .
          </p>
        )}
        <Button variant="link" className="mt-8" onClick={() => setStatus("idle")}>
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-describedby={live ? undefined : "enquiry-offline"}
      className="relative"
    >
      {!live && (
        <p
          id="enquiry-offline"
          className="mb-8 border-l-2 border-highlight pl-4 text-sm text-muted-foreground"
        >
          {enquirySection.offlineNotice}{" "}
          <a
            href={site.contact.phone.href}
            className="font-semibold whitespace-nowrap text-foreground underline decoration-highlight/70 underline-offset-4 hover:text-primary"
          >
            Call {site.contact.phone.display}
          </a>
        </p>
      )}

      {/* Honeypot for bots: hidden from sight, assistive tech and keyboard.
          Deliberately named so browsers don't autofill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="enquiry-hp-field">Leave this field empty</label>
        <input
          id="enquiry-hp-field"
          name="hp_field"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
        {fields.map((f) => {
          const error = errors[f.name];
          const id = `enquiry-${f.name}`;
          return (
            <Field key={f.name} data-invalid={!!error || undefined}>
              <FieldLabel htmlFor={id} id={`${id}-label`}>
                {f.label}
                {f.optional && (
                  <span className="font-normal text-muted-foreground">(optional)</span>
                )}
              </FieldLabel>
              {f.name === "eventDate" ? (
                <Controller
                  control={control}
                  name="eventDate"
                  render={({ field }) => (
                    <DatePicker
                      id={id}
                      labelId={`${id}-label`}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      disablePast
                      aria-invalid={!!error || undefined}
                      aria-describedby={error ? `${id}-error` : undefined}
                    />
                  )}
                />
              ) : (
              <Input
                id={id}
                type={f.type ?? "text"}
                autoComplete={f.autoComplete}
                inputMode={f.inputMode}
                aria-required={!f.optional || undefined}
                aria-invalid={!!error || undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                {...register(f.name)}
              />
              )}
              {error && <FieldError id={`${id}-error`}>{error.message}</FieldError>}
            </Field>
          );
        })}

        <Field className="sm:col-span-2" data-invalid={!!errors.message || undefined}>
          <FieldLabel htmlFor="enquiry-message">Tell us about your celebration</FieldLabel>
          <Textarea
            id="enquiry-message"
            rows={5}
            aria-required
            aria-invalid={!!errors.message || undefined}
            aria-describedby={errors.message ? "enquiry-message-error" : undefined}
            className="min-h-36"
            {...register("message")}
          />
          {errors.message && (
            <FieldError id="enquiry-message-error">{errors.message.message}</FieldError>
          )}
        </Field>
      </div>

      <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center">
        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Send enquiry"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Or call{" "}
          <a
            href={site.contact.phone.href}
            className="font-semibold whitespace-nowrap text-foreground underline decoration-highlight/70 underline-offset-4 hover:text-primary"
          >
            {site.contact.phone.display}
          </a>
        </p>
      </div>

      {/* Announces the outcome of a submit attempt. */}
      <div role="status" aria-live="polite" className={cn(status !== "unavailable" && status !== "error" && "sr-only")}>
        {status === "unavailable" && (
          <p className="mt-8 flex items-start gap-3 bg-background p-5 text-sm">
            <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              Your details look good, but online enquiries aren&apos;t connected yet, so
              nothing has been sent. Please call us on{" "}
              <a
                href={site.contact.phone.href}
                className="font-semibold whitespace-nowrap underline decoration-highlight/70 underline-offset-4 hover:text-primary"
              >
                {site.contact.phone.display}
              </a>
              . Your details are still in the form.
            </span>
          </p>
        )}
        {status === "error" && (
          <p className="mt-8 bg-background p-5 text-sm text-destructive">
            Something went wrong and your enquiry wasn&apos;t sent. Please try again,
            or call us on {site.contact.phone.display}.
          </p>
        )}
      </div>
    </form>
  );
}
