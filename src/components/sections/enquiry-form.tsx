"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { enquirySection } from "@/data/home";
import { site } from "@/data/site";
import {
  enquiriesEnabled,
  enquirySchema,
  submitEnquiry,
  type Enquiry,
  type EnquiryInput,
  type EnquiryResult,
} from "@/lib/enquiry";
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
  return { status: "sent" };
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
  { name: "eventDate", label: "Event date", optional: true, type: "date" },
  { name: "venue", label: "Venue or location", optional: true },
];

/**
 * Enquiry form. Validation is real; delivery goes through `submitEnquiry`,
 * which reports "unavailable" until a backend exists — the form never
 * claims an enquiry was received when it wasn't.
 */
export function EnquiryForm({ preview = false }: { preview?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const thanksRef = useRef<HTMLHeadingElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryInput, unknown, Enquiry>({
    resolver: zodResolver(enquirySchema),
    defaultValues: emptyForm,
    mode: "onTouched",
  });

  const live = preview || enquiriesEnabled;

  useEffect(() => {
    if (status === "sent") thanksRef.current?.focus();
  }, [status]);

  const onSubmit = async (enquiry: Enquiry) => {
    setStatus("submitting");
    const result = preview ? await previewSubmit() : await submitEnquiry(enquiry);
    setStatus(result.status);
    if (result.status === "sent") reset(emptyForm);
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
          Your enquiry has been sent. We will be in touch.
        </p>
        <Button variant="link" className="mt-8" onClick={() => setStatus("idle")}>
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-describedby={live ? undefined : "enquiry-offline"}>
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

      <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
        {fields.map((f) => {
          const error = errors[f.name];
          const id = `enquiry-${f.name}`;
          return (
            <Field key={f.name} data-invalid={!!error || undefined}>
              <FieldLabel htmlFor={id}>
                {f.label}
                {f.optional && (
                  <span className="font-normal text-muted-foreground">(optional)</span>
                )}
              </FieldLabel>
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
