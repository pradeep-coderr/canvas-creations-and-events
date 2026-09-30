"use client";

import Link from "next/link";
import { useWatch, type FieldValues, type Path } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { saveCollectionItem } from "@/app/admin/(portal)/content/actions";
import {
  collectionSchema,
  collections,
  priceTypeLabels,
  priceTypes,
  type CategoryOption,
  type CollectionKey,
  type CollectionValues,
} from "@/lib/cms/collections";
import { suggestSlug } from "@/lib/cms/fields";
import { videoProviderLabels, type MediaImage, type MediaVideo } from "@/lib/media/types";
import {
  CheckboxField,
  FormSection,
  MediaFormField,
  OrderField,
  SelectField,
  TextAreaField,
  TextField,
  type CmsFormApi,
} from "./cms-fields";
import { CmsForm, type InlineFormOptions } from "./cms-form";

/*
 * One form per collection. Fields are content-specific; submitting, errors
 * and confirmation are handled by CmsForm, and saving by the
 * saveCollectionItem server action (admin-checked, RLS-enforced).
 */

export interface ItemFormProps<K extends CollectionKey> {
  /** null when creating. */
  id: string | null;
  defaultValues: CollectionValues<K>;
  initialMessage?: string;
  /** Used by the visual editor to show the form in place. */
  inlineOptions?: InlineFormOptions;
}

function formProps<K extends CollectionKey>(
  key: K,
  { id, defaultValues, initialMessage, inlineOptions }: ItemFormProps<K>,
) {
  const { singular } = collections[key];
  return {
    schema: collectionSchema(key),
    defaultValues,
    initialMessage,
    submitLabel: id ? "Save changes" : `Create ${singular}`,
    save: (values: CollectionValues<K>, confirmLastFaq: boolean) =>
      saveCollectionItem(key, id, values, confirmLastFaq),
    // In the editor a new item simply appears in place; on its own page the
    // form continues on the new item's edit page.
    createdUrl: id || inlineOptions ? undefined : (newId: string) => `/admin/content/${key}/${newId}?created=1`,
    ...inlineOptions,
  };
}

/** Published / featured / order, with the difference spelled out. */
function VisibilitySection<T extends FieldValues>({
  form,
  featuredLabel,
}: {
  form: CmsFormApi<T>;
  featuredLabel?: string;
}) {
  return (
    <FormSection title="Visibility">
      <CheckboxField
        form={form}
        name={"isPublished" as Path<T>}
        label="Published on the website"
        hint="Unticked, it's a draft: saved here but hidden from visitors."
      />
      {featuredLabel && (
        <CheckboxField
          form={form}
          name={"isFeatured" as Path<T>}
          label={featuredLabel}
          hint="Only appears if it's also published."
        />
      )}
      <OrderField form={form} name={"sortOrder" as Path<T>} />
    </FormSection>
  );
}

/** Slug with a one-tap suggestion from another field (e.g. the title). */
function SlugField<T extends FieldValues>({ form, from }: { form: CmsFormApi<T>; from: Path<T> }) {
  const source = useWatch({ control: form.control, name: from });
  return (
    <div className="grid gap-2">
      <TextField
        form={form}
        name={"slug" as Path<T>}
        label="Web address name (slug)"
        hint="Lowercase letters, numbers and hyphens, e.g. event-styling. Must be unique."
      />
      <Button
        type="button"
        variant="outline"
        className="justify-self-start"
        disabled={!source}
        onClick={() =>
          form.setValue("slug" as Path<T>, suggestSlug(String(source ?? "")) as never, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
      >
        Suggest from {from === "label" ? "name" : "title"}
      </Button>
    </div>
  );
}

export function ServiceForm(props: ItemFormProps<"services"> & { imageOptions: MediaImage[] }) {
  return (
    <CmsForm {...formProps("services", props)}>
      {(form) => (
        <>
          <FormSection title="Service">
            <TextField form={form} name="title" label="Title" />
            <SlugField form={form} from="title" />
            <TextAreaField form={form} name="summary" label="Summary" hint="One or two sentences." rows={3} />
            <MediaFormField
              form={form}
              name="imageId"
              label="Photo"
              optional
              images={props.imageOptions}
              use="services"
              hint="Shown beside the service on larger screens."
            />
          </FormSection>
          <VisibilitySection form={form} featuredLabel="Featured on the homepage" />
        </>
      )}
    </CmsForm>
  );
}

export function PricingForm(props: ItemFormProps<"pricing">) {
  return (
    <CmsForm {...formProps("pricing", props)}>
      {(form) => <PricingFields form={form} />}
    </CmsForm>
  );
}

function PricingFields({ form }: { form: CmsFormApi<CollectionValues<"pricing">> }) {
  const priceType = useWatch({ control: form.control, name: "priceType" });
  const quote = priceType === "custom_quote";
  return (
    <>
      <FormSection title="Package" description="Real packages only: what you actually offer, at the price you charge.">
        <TextField form={form} name="title" label="Package name" />
        <SlugField form={form} from="title" />
        <TextAreaField form={form} name="description" label="Description" optional rows={3} />
      </FormSection>
      <FormSection title="Price" description="In Australian dollars.">
        <SelectField
          form={form}
          name="priceType"
          label="How the price is shown"
          options={priceTypes.map((p) => ({ value: p, label: priceTypeLabels[p] }))}
          hint={quote ? "Shows “Custom quote” instead of an amount." : "For example $1,500, or From $1,500."}
        />
        {!quote && (
          <>
            <TextField form={form} name="price" label="Amount (AUD)" maxLength={14} hint="Numbers only, e.g. 1500 or 1500.50." />
            <TextField
              form={form}
              name="pricePrefix"
              label="Words before the amount"
              optional
              maxLength={40}
              hint={priceType === "starting_from" ? "Replaces “From” if set." : "Rarely needed."}
            />
            <TextField form={form} name="priceSuffix" label="Words after the amount" optional maxLength={60} hint="For example: per event." />
          </>
        )}
      </FormSection>
      <FormSection title="Included" description="One item per line, up to 12. Leave it empty to describe the package above instead.">
        <TextAreaField form={form} name="features" label="Included" optional rows={6} maxLength={12 * 202} />
      </FormSection>
      <FormSection title="Button">
        <TextField
          form={form}
          name="ctaLabel"
          label="Button text"
          optional
          hint="Goes to the enquiry form. Empty: “Enquire about this package”."
        />
      </FormSection>
      <VisibilitySection form={form} featuredLabel="Highlight this package" />
    </>
  );
}

export function FilmForm(props: ItemFormProps<"films"> & { videoOptions: MediaVideo[] }) {
  // Films play YouTube or Vimeo links from the media library.
  const videos = props.videoOptions.filter((v) => v.provider === "youtube" || v.provider === "vimeo");
  return (
    <CmsForm {...formProps("films", props)}>
      {(form) => (
        <>
          <FormSection title="Film">
            <SelectField
              form={form}
              name="videoMediaId"
              label="Video"
              options={videos.map((v) => ({ value: v.id, label: `${v.title} (${videoProviderLabels[v.provider]})` }))}
              disabled={videos.length === 0}
              hint={
                <>
                  {videos.length === 0 ? "No YouTube or Vimeo videos yet. " : "Each video can be used once. "}
                  Add videos and their cover photos in the{" "}
                  <Link href="/admin/content/media?tab=videos" className="font-semibold underline underline-offset-4">
                    media library
                  </Link>
                  .
                </>
              }
            />
            <TextField
              form={form}
              name="title"
              label="Title"
              hint="Shown under the video and read out on the Play button, e.g. Styling highlights from a garden wedding."
            />
            <TextAreaField form={form} name="caption" label="Caption" optional rows={2} />
          </FormSection>
          <VisibilitySection form={form} featuredLabel="Featured (shown first and largest)" />
        </>
      )}
    </CmsForm>
  );
}

export function CategoryForm(props: ItemFormProps<"categories">) {
  return (
    <CmsForm {...formProps("categories", props)}>
      {(form) => (
        <>
          <FormSection title="Category">
            <TextField form={form} name="label" label="Name" hint="For example, the kind of celebration." />
            <SlugField form={form} from="label" />
          </FormSection>
          <VisibilitySection form={form} />
        </>
      )}
    </CmsForm>
  );
}

export function GalleryItemForm(
  props: ItemFormProps<"gallery"> & { imageOptions: MediaImage[]; categoryOptions: CategoryOption[] },
) {
  return (
    <CmsForm {...formProps("gallery", props)}>
      {(form) => (
        <>
          <FormSection title="Photo">
            <MediaFormField
              form={form}
              name="mediaId"
              label="Photo"
              images={props.imageOptions}
              use="gallery"
              hint="The photo's description (alt text) is set with the photo in the media library."
            />
            <TextField form={form} name="title" label="Caption" optional hint="A short title, e.g. the setting." />
            <SelectField
              form={form}
              name="categoryId"
              label="Category"
              optional
              noneLabel="No category"
              options={props.categoryOptions.map((c) => ({
                value: c.id,
                label: c.isPublished ? c.label : `${c.label} (draft)`,
              }))}
              hint={props.categoryOptions.length === 0 ? "No categories yet. Add them under Content → Categories." : undefined}
            />
          </FormSection>
          <VisibilitySection form={form} featuredLabel="Featured (shown first and larger)" />
        </>
      )}
    </CmsForm>
  );
}

export function TestimonialForm(props: ItemFormProps<"testimonials">) {
  return (
    <CmsForm {...formProps("testimonials", props)}>
      {(form) => (
        <>
          <FormSection
            title="Testimonial"
            description="Only real words from a client who has agreed to them being published."
          >
            <TextAreaField form={form} name="quote" label="Quote" rows={5} />
            <TextField
              form={form}
              name="authorName"
              label="Name"
              hint="As the client agreed to be credited, e.g. first names only."
            />
            <TextField form={form} name="eventType" label="Event" optional hint="For example, the type of celebration." />
          </FormSection>
          <VisibilitySection form={form} featuredLabel="Featured on the homepage" />
        </>
      )}
    </CmsForm>
  );
}

export function FaqForm(props: ItemFormProps<"faqs">) {
  return (
    <CmsForm {...formProps("faqs", props)}>
      {(form) => (
        <>
          <FormSection title="Question">
            <TextField form={form} name="question" label="Question" />
            <TextAreaField form={form} name="answer" label="Answer" rows={5} />
          </FormSection>
          <FormSection title="Link under the answer" description="Optional. Fill in both, or leave both empty.">
            <TextField form={form} name="actionLabel" label="Link text" optional hint="For example, Send an enquiry." />
            <TextField
              form={form}
              name="actionHref"
              label="Link address"
              optional
              maxLength={500}
              hint="A page link like /#enquire, or a full https://, tel: or mailto: link."
            />
          </FormSection>
          <VisibilitySection form={form} />
        </>
      )}
    </CmsForm>
  );
}

/** Process steps and "Why Canvas" principles share the same fields. */
export function StepForm(props: ItemFormProps<"process"> & { collection: "process" | "principles" }) {
  const isProcess = props.collection === "process";
  return (
    <CmsForm {...formProps(props.collection, props)}>
      {(form) => (
        <>
          <FormSection title={isProcess ? "Step" : "Principle"}>
            <TextField form={form} name="title" label="Title" />
            <TextAreaField form={form} name="description" label="Description" rows={3} />
          </FormSection>
          <VisibilitySection form={form} />
        </>
      )}
    </CmsForm>
  );
}
