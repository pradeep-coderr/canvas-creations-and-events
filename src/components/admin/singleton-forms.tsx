"use client";

import { saveAboutContent, saveHomeContent, saveVideoStory } from "@/app/admin/(portal)/content/actions";
import {
  aboutSchema,
  homeSchema,
  videoSchema,
  type AboutValues,
  type HomeValues,
  type VideoValues,
} from "@/lib/cms/singletons";
import type { MediaImage } from "@/lib/media/types";
import { FormSection, MediaFormField, TextAreaField, TextField, type CmsFormApi } from "./cms-fields";
import { CmsForm } from "./cms-form";

/*
 * Editors for the one-row content tables. They load the existing row and
 * save it back (never create or delete it).
 */

const LABEL = "Small label";
const LABEL_HINT = "The short text above the heading.";

// ---------------------------------------------------------------------------
// Homepage
// ---------------------------------------------------------------------------

const homeGroups = [
  ["home-hero", "Hero"],
  ["home-intro", "Introduction"],
  ["home-services", "Services"],
  ["home-pricing", "Pricing"],
  ["home-categories", "Categories"],
  ["home-gallery", "Gallery"],
  ["home-process", "Process"],
  ["home-why", "Why Canvas"],
  ["home-testimonials", "Testimonials"],
  ["home-faq", "FAQ"],
  ["home-enquiry", "Enquiry"],
  ["home-contact", "Contact"],
] as const;

/** Label + heading pair used by most sections. */
function Heading({ form, prefix }: { form: CmsFormApi<HomeValues>; prefix: string }) {
  return (
    <>
      <TextField form={form} name={`${prefix}Eyebrow` as never} label={LABEL} hint={LABEL_HINT} />
      <TextField form={form} name={`${prefix}Title` as never} label="Heading" />
    </>
  );
}

export function HomeForm({ defaultValues, imageOptions }: { defaultValues: HomeValues; imageOptions: MediaImage[] }) {
  return (
    <CmsForm schema={homeSchema} defaultValues={defaultValues} save={(v) => saveHomeContent(v)} submitLabel="Save homepage">
      {(form) => (
        <>
          <nav aria-label="Homepage sections" className="bg-background p-6 sm:p-8">
            <p className="text-sm text-muted-foreground">
              The text of each homepage section, from top to bottom. Lists such as services and FAQs are edited in their
              own pages.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {homeGroups.map(([id, label]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="inline-flex h-11 items-center rounded-md border border-border px-3 text-sm font-medium hover:border-foreground/35"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <FormSection
            id="home-hero"
            title="Hero"
            description="The main headline is the business slogan, which is set with the business details."
          >
            <TextField form={form} name="heroEyebrow" label={LABEL} hint="The short text above the headline." />
            <TextAreaField form={form} name="heroDescription" label="Text" rows={3} />
            <TextField
              form={form}
              name="heroSecondaryCtaLabel"
              label="Second button text"
              hint="This button takes visitors to the gallery."
            />
            <MediaFormField
              form={form}
              name="heroImageId"
              label="Photo"
              optional
              images={imageOptions}
              use="hero"
              emptyText="No photo: the Canvas Creations monogram is shown."
            />
          </FormSection>

          <FormSection id="home-intro" title="Introduction">
            <Heading form={form} prefix="intro" />
            <TextAreaField form={form} name="introBody" label="Text" rows={4} />
          </FormSection>

          <FormSection id="home-services" title="Services section">
            <Heading form={form} prefix="services" />
            <TextAreaField form={form} name="servicesDescription" label="Text" rows={3} />
            <TextField
              form={form}
              name="servicesEnquiryTitle"
              label="Enquiry prompt heading"
              hint="The link under the services list that goes to the enquiry form."
            />
            <TextField form={form} name="servicesEnquiryText" label="Enquiry prompt text" />
          </FormSection>

          <FormSection
            id="home-pricing"
            title="Pricing section"
            description="Only shown when at least one package is published. The packages themselves are edited under Content → Pricing."
          >
            <Heading form={form} prefix="pricing" />
            <TextAreaField form={form} name="pricingDescription" label="Text under the heading" optional rows={2} />
          </FormSection>

          <FormSection id="home-categories" title="Categories section" description="Only shown when at least one category is published.">
            <Heading form={form} prefix="categories" />
          </FormSection>

          <FormSection id="home-gallery" title="Gallery section">
            <Heading form={form} prefix="gallery" />
            <TextAreaField form={form} name="galleryIntro" label="Text under the heading" optional rows={2} />
            <TextField
              form={form}
              name="galleryFilterAll"
              label="First filter button"
              hint="Shown when photos are in three or more categories, e.g. All."
            />
            <TextField form={form} name="galleryInstagramCta" label="Instagram link text" />
            <TextField
              form={form}
              name="galleryEmptyTitle"
              label="Heading while there are no photos"
            />
            <TextAreaField form={form} name="galleryEmptyText" label="Text while there are no photos" rows={3} />
          </FormSection>

          <FormSection id="home-process" title="Process section" description="The steps themselves are edited under Content → Process.">
            <Heading form={form} prefix="process" />
          </FormSection>

          <FormSection id="home-why" title="Why Canvas section" description="The principles themselves are edited under Content → Why Canvas.">
            <TextField form={form} name="whyEyebrow" label={LABEL} hint={LABEL_HINT} />
            <TextField form={form} name="whyTitleLines.0" label="Heading, line 1" />
            <TextField form={form} name="whyTitleLines.1" label="Heading, line 2" optional />
            <TextField form={form} name="whyTitleLines.2" label="Heading, line 3" optional />
          </FormSection>

          <FormSection id="home-testimonials" title="Testimonials section" description="Only shown when at least one testimonial is published and featured.">
            <Heading form={form} prefix="testimonials" />
          </FormSection>

          <FormSection id="home-faq" title="FAQ section">
            <Heading form={form} prefix="faq" />
          </FormSection>

          <FormSection id="home-enquiry" title="Enquiry section" description="The form's own labels and messages are part of the website and aren't edited here.">
            <Heading form={form} prefix="enquiry" />
            <TextAreaField form={form} name="enquiryDescription" label="Text" rows={3} />
          </FormSection>

          <FormSection id="home-contact" title="Contact section" description="The phone number and social links are part of the business details.">
            <Heading form={form} prefix="contact" />
            <TextAreaField form={form} name="contactDescription" label="Text" rows={2} />
          </FormSection>
        </>
      )}
    </CmsForm>
  );
}

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

export function AboutForm({ defaultValues, imageOptions }: { defaultValues: AboutValues; imageOptions: MediaImage[] }) {
  return (
    <CmsForm schema={aboutSchema} defaultValues={defaultValues} save={(v) => saveAboutContent(v)} submitLabel="Save About section">
      {(form) => (
        <>
          <FormSection title="Text">
            <TextField form={form} name="eyebrow" label={LABEL} hint={LABEL_HINT} />
            <TextField form={form} name="title" label="Heading" />
            <TextAreaField
              form={form}
              name="body"
              label="Text"
              rows={8}
              maxLength={12_000}
              hint="Separate paragraphs with a blank line. Up to six paragraphs."
            />
            <TextField form={form} name="ctaLabel" label="Link text" hint="This link takes visitors to the enquiry form." />
          </FormSection>

          <FormSection
            title="Founder"
            description="Optional. Leave these empty until you want them on the website. The name and role appear under the text once a name is added."
          >
            <TextField form={form} name="founderName" label="Name" optional />
            <TextField form={form} name="founderRole" label="Role or title" optional hint="For example, Founder & stylist." />
            <MediaFormField
              form={form}
              name="imageId"
              label="Photo"
              optional
              images={imageOptions}
              use="founder"
              emptyText="No photo: the Canvas Creations logo is shown."
            />
          </FormSection>
        </>
      )}
    </CmsForm>
  );
}

// ---------------------------------------------------------------------------
// Films section wording (the films themselves: Content → Films)
// ---------------------------------------------------------------------------

export function VideoForm({ defaultValues }: { defaultValues: VideoValues }) {
  return (
    <CmsForm schema={videoSchema} defaultValues={defaultValues} save={(v) => saveVideoStory(v)} submitLabel="Save films section">
      {(form) => (
        <FormSection
          title="Text"
          description="The section is shown once a film is published. Add and order the films under Content → Films."
        >
          <TextField form={form} name="eyebrow" label={LABEL} hint={LABEL_HINT} />
          <TextField form={form} name="title" label="Heading" />
          <TextAreaField form={form} name="emptyText" label="Text in the editor while there are no films" rows={2} />
          <TextField form={form} name="tiktokCta" label="TikTok link text (with that text)" />
        </FormSection>
      )}
    </CmsForm>
  );
}
