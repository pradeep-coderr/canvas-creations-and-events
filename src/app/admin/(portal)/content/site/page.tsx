import type { Metadata } from "next";
import { BackLink } from "@/components/admin/back-link";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getSingleton } from "@/lib/admin/cms";
import { requireAdmin } from "@/lib/admin/session";
import { siteToValues } from "@/lib/cms/site-settings";

export const metadata: Metadata = { title: "Site details" };

export default async function SiteDetailsPage() {
  await requireAdmin();
  const row = await getSingleton("site_settings");

  return (
    <>
      <BackLink href="/admin/content">Content</BackLink>
      <h1 className="mt-6 font-display text-display-md font-title">Site details</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        The headline, menu and button wording, contact details, social links and enquiry form wording used across the
        whole website. You can also change these in the visual editor.
      </p>
      <div className="mt-8">
        {row ? (
          <SiteSettingsForm defaultValues={siteToValues(row)} />
        ) : (
          <p role="alert" className="text-destructive">
            The site details couldn&apos;t be loaded. Please refresh the page.
          </p>
        )}
      </div>
    </>
  );
}
