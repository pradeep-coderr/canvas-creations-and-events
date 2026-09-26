import type { Metadata } from "next";
import { SiteFrame } from "@/components/layout/site-frame";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { SiteThemeStyle } from "@/components/theme/site-theme-style";
import { site } from "@/data/site";

const title = `${site.name} | ${site.slogan}`;
// The real client logo (square) — no promotional image is fabricated.
const logo = {
  url: "/images/logo/canvas-creations-logo-512.png",
  width: 512,
  height: 512,
  alt: `${site.name} logo`,
};

// Public-site metadata. Relative URLs resolve against metadataBase (root
// layout, from NEXT_PUBLIC_SITE_URL).
export const metadata: Metadata = {
  title: { default: title, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: site.name,
    title,
    description: site.description,
    url: "/",
    images: [logo],
  },
  twitter: {
    card: "summary",
    title,
    description: site.description,
    images: [logo],
  },
};

/**
 * Public website chrome. The admin area (/admin) has its own layout.
 * The global site theme (admin → Design) is applied here for every visitor.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteThemeStyle />
      <SiteFrame>{children}</SiteFrame>
      <ServiceWorkerRegistration />
    </>
  );
}
