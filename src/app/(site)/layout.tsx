import type { Metadata } from "next";
import { SiteFrame } from "@/components/layout/site-frame";
import { ScrollMotion } from "@/components/motion/scroll-motion";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { SiteThemeStyle } from "@/components/theme/site-theme-style";
import { site } from "@/data/site";
import { headlineText, withSectionLinks } from "@/lib/cms/site-settings";
import { getPageStyles, getSectionAvailability, getSiteSettings } from "@/lib/content/public";
import { textStylesCss } from "@/lib/styles/schema";

// The real client logo (square) — no promotional image is fabricated.
const logo = {
  url: "/images/logo/canvas-creations-logo-512.png",
  width: 512,
  height: 512,
  alt: `${site.name} logo`,
};

// Public-site metadata. Relative URLs resolve against metadataBase (root
// layout, from NEXT_PUBLIC_SITE_URL). The title uses the editable headline.
export async function generateMetadata(): Promise<Metadata> {
  const title = `${site.name} | ${headlineText(await getSiteSettings())}`;
  return {
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
}

/**
 * Public website chrome. The admin area (/admin) has its own layout.
 * The global site theme (admin → Design) is applied here for every visitor.
 */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [saved, styles, available] = await Promise.all([getSiteSettings(), getPageStyles(), getSectionAvailability()]);
  // Pricing and Films appear in the menu only while they have published content.
  const settings = withSectionLinks(saved, available);
  const textCss = textStylesCss(styles.text);
  return (
    <>
      <SiteThemeStyle />
      {/* Text style presets (visual editor): generated from fixed options only. */}
      {textCss && <style id="page-styles" dangerouslySetInnerHTML={{ __html: textCss }} />}
      <SiteFrame settings={settings}>{children}</SiteFrame>
      <ServiceWorkerRegistration />
      <SmoothScroll />
      <ScrollMotion />
    </>
  );
}
