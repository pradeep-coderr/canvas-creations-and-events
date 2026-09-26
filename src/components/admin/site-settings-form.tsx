"use client";

import { saveSiteSettings } from "@/app/admin/(portal)/content/actions";
import { siteSchema, type SiteValues } from "@/lib/cms/site-settings";
import { FormSection, TextAreaField, TextField } from "./cms-fields";
import { CmsForm } from "./cms-form";

const PHONE_HINT = "Shown everywhere on the website and in Google's business details. The call link is made from it.";

/** Site details: the wording and business details used across the whole website. */
export function SiteSettingsForm({ defaultValues }: { defaultValues: SiteValues }) {
  return (
    <CmsForm schema={siteSchema} defaultValues={defaultValues} save={(v) => saveSiteSettings(v)} submitLabel="Save site details">
      {(form) => (
        <>
          <FormSection title="Headline" description="The big headline at the top of the homepage. Also used in the page title for Google and social media.">
            <TextField form={form} name="headlineLead" label="Headline" />
            <TextField
              form={form}
              name="headlineEmphasis"
              label="Headline ending (italic rose)"
              optional
              hint="Shown after the headline in italic rose, e.g. “masterpieces”. Leave empty for none."
            />
          </FormSection>

          <FormSection title="Contact details" description="Used in the header, footer, Contact section, enquiry form and Google's business details.">
            <TextField form={form} name="phoneDisplay" label="Phone number" hint={PHONE_HINT} />
            <TextField form={form} name="addressStreet" label="Street" />
            <TextField form={form} name="addressLocality" label="Suburb" />
            <TextField form={form} name="addressRegion" label="State" />
            <TextField form={form} name="addressPostcode" label="Postcode" />
            <TextField form={form} name="instagramUrl" label="Instagram link" optional hint="Leave empty to hide Instagram everywhere." />
            <TextField form={form} name="facebookUrl" label="Facebook link" optional hint="Leave empty to hide Facebook everywhere." />
            <TextField form={form} name="tiktokUrl" label="TikTok link" optional hint="Leave empty to hide TikTok everywhere." />
          </FormSection>

          <FormSection title="Menu and buttons" description="Only the wording changes; where each link goes stays the same.">
            <TextField form={form} name="navHome" label="Menu: Home" />
            <TextField form={form} name="navServices" label="Menu: Services" />
            <TextField form={form} name="navGallery" label="Menu: Gallery" />
            <TextField form={form} name="navAbout" label="Menu: About" />
            <TextField form={form} name="navFaq" label="Menu: FAQ" />
            <TextField form={form} name="navContact" label="Menu: Contact" />
            <TextField form={form} name="enquireLabel" label="Main button text" hint="The Enquire button in the header, the hero, the mobile menu and the footer." />
            <TextField form={form} name="menuLabel" label="Mobile menu button" />
            <TextField form={form} name="mobileEnquireLabel" label="Mobile bar: enquire button" />
            <TextField form={form} name="mobileCallLabel" label="Call link text" hint="Before the number, e.g. “Call”. Also on the mobile bar and in Contact." />
            <TextField form={form} name="callPrompt" label="Call prompt" hint="Before the phone link, e.g. “Prefer to talk?”." />
          </FormSection>

          <FormSection title="Footer and contact labels">
            <TextField form={form} name="footerTagline" label="Footer tagline" />
            <TextField form={form} name="footerExploreHeading" label="Footer: menu heading" />
            <TextField form={form} name="footerContactHeading" label="Footer: contact heading" />
            <TextField form={form} name="footerFollowHeading" label="Social heading" hint="In the footer and the Contact section." />
            <TextField form={form} name="basedInLabel" label="“Based in” label" hint="In the Contact section." />
          </FormSection>

          <FormSection title="Enquiry form" description="The form's error and status messages stay as they are, so they always explain what happened.">
            <TextField form={form} name="formNameLabel" label="Name label" />
            <TextField form={form} name="formEmailLabel" label="Email label" />
            <TextField form={form} name="formPhoneLabel" label="Phone label" />
            <TextField form={form} name="formEventTypeLabel" label="Event type label" />
            <TextField form={form} name="formEventDateLabel" label="Event date label" />
            <TextField form={form} name="formVenueLabel" label="Venue label" />
            <TextField form={form} name="formMessageLabel" label="Message label" />
            <TextField form={form} name="formOptionalLabel" label="Optional marker" hint="Shown after optional fields, e.g. “(optional)”." />
            <TextField form={form} name="formSubmitLabel" label="Send button" />
            <TextField form={form} name="formSuccessTitle" label="Thank-you heading" />
            <TextAreaField form={form} name="formSuccessText" label="Thank-you text" rows={3} />
          </FormSection>
        </>
      )}
    </CmsForm>
  );
}
