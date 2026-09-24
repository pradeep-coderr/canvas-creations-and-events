import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { enquirySection, type EnquiryCopy } from "@/data/home";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { EnquiryForm } from "./enquiry-form";

/** The canonical enquiry target (#enquire) for every Enquire CTA. */
export function Enquiry({ copy = enquirySection }: { copy?: EnquiryCopy }) {
  return (
    <Section id="enquire" tone="blush" aria-labelledby="enquire-title">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <SectionHeading
          id="enquire-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          align="start"
          className="lg:sticky lg:top-[calc(var(--header-height)+3rem)] lg:col-span-5 lg:self-start"
        />
        {/* Not wrapped in Reveal: form controls stay static and fully present. */}
        <div className="lg:col-span-7">
          <EnquiryForm enabled={isSupabaseConfigured()} />
        </div>
      </Container>
    </Section>
  );
}
