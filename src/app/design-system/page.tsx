import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Phone } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { DecorativeDivider } from "@/components/shared/decorative-divider";
import { Eyebrow } from "@/components/shared/eyebrow";
import { ImageFrame } from "@/components/shared/image-frame";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { stagger } from "@/lib/motion";

// Internal reference for the design system. Available in development only.
export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const tones = ["default", "ivory", "blush", "dark"] as const;

// Transparent 1×1 stand-in until client photography is added, so the frame's
// own bg-muted surface shows. Not a business asset.
const placeholder =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 border-b pb-3 text-sm font-semibold text-muted-foreground">
      {children}
    </p>
  );
}

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main>
      <Section>
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Internal reference"
            title="Canvas Creations design system"
            description="Every primitive the site is built from. Development only."
          />
        </Container>
      </Section>

      <Section tone="ivory" aria-labelledby="type">
        <Container>
          <Label>Type scale</Label>
          <div id="type" className="space-y-6">
            <p className="font-display text-display-xl font-medium">
              Turning moments into masterpieces
            </p>
            <p className="font-display text-display-lg font-medium">
              display-lg — section headings
            </p>
            <p className="font-display text-display-md italic">
              display-md — “Editorial statements and quotes.”
            </p>
            <p className="font-display text-display-sm font-semibold">
              display-sm — small titles
            </p>
            <p className="max-w-2xl text-lead text-muted-foreground">
              lead — Introductory copy under a heading. Manrope, relaxed line
              height, muted foreground.
            </p>
            <p className="max-w-2xl">
              base — Body copy for descriptions, details and supporting text.
              Set in Manrope at 16px with a relaxed line height for comfortable
              reading on every screen size.
            </p>
            <p className="text-sm text-muted-foreground">
              sm — metadata, captions, footer
            </p>
            <Eyebrow>eyebrow — our services</Eyebrow>
          </div>
        </Container>
      </Section>

      {tones.map((tone) => (
        <Section key={tone} tone={tone} aria-label={`${tone} tone`}>
          <Container>
            <Label>Section tone: {tone}</Label>
            <SectionHeading
              eyebrow="Our creations"
              title="A glimpse of what’s possible."
              description="Every celebration starts with an idea."
            />
            <DecorativeDivider className="my-12" />
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button>Enquire now</Button>
              <Button variant="secondary">View services</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">
                View gallery
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </Container>
        </Section>
      ))}

      <Section aria-label="Buttons">
        <Container>
          <Label>Buttons — sizes, icons, states</Label>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg">
              Plan your event
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button>Default</Button>
            <Button size="sm">Small</Button>
            <Button variant="secondary">
              <Phone data-icon="inline-start" />
              Call us
            </Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost" size="icon" aria-label="Call">
              <Phone />
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </Container>
      </Section>

      <Section tone="ivory" aria-label="Form primitives">
        <Container size="narrow">
          <Label>Form primitives (not the enquiry form)</Label>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ds-name">Your name</FieldLabel>
              <Input id="ds-name" placeholder="Jane Smith" autoComplete="off" />
            </Field>
            <Field data-invalid="true">
              <FieldLabel htmlFor="ds-email">Email</FieldLabel>
              <Input
                id="ds-email"
                type="email"
                defaultValue="jane@"
                aria-invalid="true"
                aria-describedby="ds-email-error"
              />
              <FieldError id="ds-email-error">
                Enter a valid email address.
              </FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="ds-event">Event type</FieldLabel>
              <Select>
                <SelectTrigger id="ds-event">
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="baby-shower">Baby shower</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="ds-message">Tell us about it</FieldLabel>
              <Textarea id="ds-message" placeholder="Date, venue, ideas…" />
              <FieldDescription>
                A few details help us prepare a tailored quote.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="ds-disabled">Disabled</FieldLabel>
              <Input id="ds-disabled" disabled defaultValue="Not editable" />
            </Field>
          </FieldGroup>
        </Container>
      </Section>

      <Section aria-label="Image frames and reveal">
        <Container>
          <Label>Image frames + Reveal (scroll to trigger)</Label>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(["portrait", "square", "landscape", "tall"] as const).map(
              (ratio, i) => (
                <Reveal key={ratio} delay={i * stagger}>
                  <ImageFrame
                    src={placeholder}
                    alt=""
                    ratio={ratio}
                    rounded={i % 2 === 0}
                    zoomOnHover
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {ratio}
                    {i % 2 === 0 ? ", rounded" : ""}
                  </p>
                </Reveal>
              ),
            )}
          </div>
        </Container>
      </Section>
    </main>
  );
}
