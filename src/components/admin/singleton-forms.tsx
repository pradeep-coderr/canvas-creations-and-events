"use client";

import { useWatch } from "react-hook-form";
import { saveAboutContent, saveHomeContent, saveVideoStory } from "@/app/admin/(portal)/content/actions";
import type { MediaOption } from "@/lib/cms/collections";
import {
  aboutSchema,
  homeSchema,
  videoProviderLabels,
  videoProviders,
  videoSchema,
  type AboutValues,
  type HomeValues,
  type VideoValues,
} from "@/lib/cms/singletons";
import { NO_PHOTOS_HINT } from "./collection-forms";
import { FormSection, SelectField, TextAreaField, TextField, type CmsFormApi } from "./cms-fields";
import { CmsForm } from "./cms-form";

/*
 * Editors for the one-row content tables. They load the existing row and
 * save it back (never create or delete it).
 */

const LABEL = "Small label";
const LABEL_HINT = "The short text above the heading.";

function photoOptions(options: MediaOption[]) {
  return options.map((o) => ({ value: o.id, label: o.label }));
}

// ---------------------------------------------------------------------------
// Homepage
// ---------------------------------------------------------------------------

const homeGroups = [
  ["home-hero", "Hero"],
  ["home-intro", "Introduction"],
  ["home-services", "Services"],
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

export function HomeForm({ defaultValues, imageOptions }: { defaultValues: HomeValues; imageOptions: MediaOption[] }) {
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
            <SelectField
              form={form}
              name="heroImageId"
              label="Photo"
              optional
              noneLabel="No photo (shows the monogram)"
              options={photoOptions(imageOptions)}
              disabled={imageOptions.length === 0}
              hint={imageOptions.length === 0 ? NO_PHOTOS_HINT : undefined}
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

          <FormSection id="home-categories" title="Categories section" description="Only shown when at least one category is published.">
            <Heading form={form} prefix="categories" />
          </FormSection>

          <FormSection id="home-gallery" title="Gallery section">
            <Heading form={form} prefix="gallery" />
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

export function AboutForm({ defaultValues, imageOptions }: { defaultValues: AboutValues; imageOptions: MediaOption[] }) {
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
            <SelectField
              form={form}
              name="imageId"
              label="Photo"
              optional
              noneLabel="No photo (shows the logo)"
              options={photoOptions(imageOptions)}
              disabled={imageOptions.length === 0}
              hint={imageOptions.length === 0 ? NO_PHOTOS_HINT : undefined}
            />
          </FormSection>
        </>
      )}
    </CmsForm>
  );
}

// ---------------------------------------------------------------------------
// Video / story
// ---------------------------------------------------------------------------

function VideoFields({
  form,
  imageOptions,
  videoOptions,
}: {
  form: CmsFormApi<VideoValues>;
  imageOptions: MediaOption[];
  videoOptions: MediaOption[];
}) {
  const provider = useWatch({ control: form.control, name: "provider" });
  // "Uploaded video file" needs a video and a poster image to choose from.
  const uploadPossible = (videoOptions.length > 0 && imageOptions.length > 0) || provider === "upload";
  const choices = videoProviders.filter((p) => p !== "upload" || uploadPossible);

  return (
    <FormSection title="Video">
      <SelectField
        form={form}
        name="provider"
        label="Video"
        options={choices.map((p) => ({ value: p, label: videoProviderLabels[p] }))}
        hint={
          uploadPossible
            ? undefined
            : "Uploading a video file isn't set up yet. You can link a YouTube or Vimeo video instead."
        }
      />

      {provider === "upload" && (
        <>
          <SelectField
            form={form}
            name="videoMediaId"
            label="Video file"
            options={photoOptions(videoOptions)}
          />
          <SelectField
            form={form}
            name="posterId"
            label="Poster image"
            hint="Shown before the video plays."
            options={photoOptions(imageOptions)}
          />
        </>
      )}

      {(provider === "youtube" || provider === "vimeo") && (
        <>
          <TextField
            form={form}
            name="embedUrl"
            label={provider === "youtube" ? "YouTube link" : "Vimeo link"}
            maxLength={500}
            hint={
              provider === "youtube"
                ? "The video's address on youtube.com or youtu.be."
                : "The video's address on vimeo.com."
            }
          />
          <p className="border-l-2 border-highlight pl-4 text-sm text-muted-foreground">
            The link is saved, but the website doesn&apos;t show YouTube or Vimeo videos yet. Until it does, visitors
            see the text above.
          </p>
        </>
      )}

      {provider !== "none" && (
        <>
          <TextField
            form={form}
            name="videoTitle"
            label="What the video shows"
            hint="Read out by screen readers, e.g. Styling highlights from a garden wedding."
          />
          <TextField form={form} name="caption" label="Caption" optional />
        </>
      )}
    </FormSection>
  );
}

export function VideoForm({
  defaultValues,
  imageOptions,
  videoOptions,
}: {
  defaultValues: VideoValues;
  imageOptions: MediaOption[];
  videoOptions: MediaOption[];
}) {
  return (
    <CmsForm schema={videoSchema} defaultValues={defaultValues} save={(v) => saveVideoStory(v)} submitLabel="Save video section">
      {(form) => (
        <>
          <FormSection title="Text">
            <TextField form={form} name="eyebrow" label={LABEL} hint={LABEL_HINT} />
            <TextField form={form} name="title" label="Heading" />
            <TextAreaField form={form} name="emptyText" label="Text while there's no video" rows={2} />
            <TextField form={form} name="tiktokCta" label="TikTok link text" />
          </FormSection>
          <VideoFields form={form} imageOptions={imageOptions} videoOptions={videoOptions} />
        </>
      )}
    </CmsForm>
  );
}
