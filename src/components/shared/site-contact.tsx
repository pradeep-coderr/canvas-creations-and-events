"use client";

import { createContext, useContext } from "react";
import { defaultSiteSettings, type SiteSettings } from "@/lib/cms/site-settings";

type SiteContact = Pick<SiteSettings, "phone" | "email">;

const SiteContactContext = createContext<SiteContact>({
  phone: defaultSiteSettings.phone,
  email: defaultSiteSettings.email,
});

/**
 * The contact details from Site details, for client components that can't
 * receive them as props (the public error page renders inside the layout,
 * but Next gives it no data). Everything else gets them from the layout.
 */
export function SiteContactProvider({ contact, children }: { contact: SiteContact; children: React.ReactNode }) {
  return <SiteContactContext value={contact}>{children}</SiteContactContext>;
}

export const useSiteContact = () => useContext(SiteContactContext);
