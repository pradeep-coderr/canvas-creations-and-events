"use client";

import { useWatch, type FieldValues, type Path } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { saveCollectionItem } from "@/app/admin/(portal)/content/actions";
import {
  collectionSchema,
  collections,
  type CategoryOption,
  type CollectionKey,
  type CollectionValues,
  type MediaOption,
} from "@/lib/cms/collections";
import { suggestSlug } from "@/lib/cms/fields";
import {
  CheckboxField,
  FormSection,
  OrderField,
  SelectField,
  TextAreaField,
  TextField,
  type CmsFormApi,
} from "./cms-fields";
import { CmsForm } from "./cms-form";

/*
 * One form per collection. Fields are content-specific; submitting, errors
 * and confirmation are handled by CmsForm, and saving by the
 * saveCollectionItem server action (admin-checked, RLS-enforced).
 */

interface ItemFormProps<K extends CollectionKey> {
  /** null when creating. */
  id: string | null;
  defaultValues: CollectionValues<K>;
  initialMessage?: string;
}

function formProps<K extends CollectionKey>(key: K, { id, defaultValues, initialMessage }: ItemFormProps<K>) {
  const { singular } = collections[key];
  return {
    schema: collectionSchema(key),
    defaultValues,
    initialMessage,
    submitLabel: id ? "Save changes" : `Create ${singular}`,
    save: (values: CollectionValues<K>, confirmLastFaq: boolean) =>
      saveCollectionItem(key, id, values, confirmLastFaq),
    createdUrl: id ? undefined : (newId: string) => `/admin/content/${key}/${newId}?created=1`,
  };
}

export const NO_PHOTOS_HINT =
  "Photo uploads aren't set up yet, so there are no photos to choose from. This can be added once uploads are available.";

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

function PhotoSelect<T extends FieldValues>({
  form,
  name,
  label,
  options,
  optional = true,
}: {
  form: CmsFormApi<T>;
  name: Path<T>;
  label: string;
  options: MediaOption[];
  optional?: boolean;
}) {
  return (
    <SelectField
      form={form}
      name={name}
      label={label}
      optional={optional}
      options={options.map((o) => ({ value: o.id, label: o.label }))}
      noneLabel={optional ? "No photo" : undefined}
      disabled={options.length === 0}
      hint={
        options.length === 0
          ? NO_PHOTOS_HINT
          : "Photos are listed by their description (alt text), which is set with the photo."
      }
    />
  );
}

export function ServiceForm(props: ItemFormProps<"services"> & { imageOptions: MediaOption[] }) {
  return (
    <CmsForm {...formProps("services", props)}>
      {(form) => (
        <>
          <FormSection title="Service">
            <TextField form={form} name="title" label="Title" />
            <SlugField form={form} from="title" />
            <TextAreaField form={form} name="summary" label="Summary" hint="One or two sentences." rows={3} />
            <PhotoSelect form={form} name="imageId" label="Photo" options={props.imageOptions} />
          </FormSection>
          <VisibilitySection form={form} featuredLabel="Featured on the homepage" />
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
  props: ItemFormProps<"gallery"> & { imageOptions: MediaOption[]; categoryOptions: CategoryOption[] },
) {
  return (
    <CmsForm {...formProps("gallery", props)}>
      {(form) => (
        <>
          <FormSection title="Photo">
            <PhotoSelect form={form} name="mediaId" label="Photo" options={props.imageOptions} optional={false} />
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
          <VisibilitySection form={form} featuredLabel="Featured on the homepage" />
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
