import type { SiteCopy } from "@/lib/cms/site-settings";
import { MobileCtaBar } from "./mobile-cta-bar";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/**
 * The public website chrome around page content (also shown in the admin
 * visual editor). Labels and contact details come from the site details
 * (admin → Content → Site details, or the visual editor).
 */
export function SiteFrame({ settings, children }: { settings: SiteCopy; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader settings={settings} />
      {children}
      <SiteFooter settings={settings} />
      <MobileCtaBar settings={settings} />
    </>
  );
}
