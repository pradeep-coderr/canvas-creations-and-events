import { MobileCtaBar } from "./mobile-cta-bar";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** The public website chrome around page content (also shown in the admin visual editor). */
export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <MobileCtaBar />
    </>
  );
}
