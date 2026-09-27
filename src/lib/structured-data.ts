import { site } from "@/data/site";
import { headlineText, type SiteSettings } from "@/lib/cms/site-settings";
import { absoluteUrl } from "@/lib/site-url";

/**
 * schema.org LocalBusiness for the public homepage. Built only from verified
 * business data (site details from the CMS; the name and description from
 * src/data/site.ts) — deliberately no opening hours, price
 * range, ratings, email, coordinates, founding date or service radius.
 * Contains no user-submitted data.
 */
export function localBusinessJsonLd(settings: SiteSettings) {
  const { phone, address } = settings;
  const logo = absoluteUrl("/images/logo/canvas-creations-logo-512.png");

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${absoluteUrl("/")}#business`,
    name: site.name,
    slogan: headlineText(settings),
    description: site.description,
    url: absoluteUrl("/"),
    telephone: phone.href.replace(/^tel:/, ""),
    logo,
    image: logo,
    address: {
      "@type": "PostalAddress",
      // Only the parts that are set: no invented street or postcode.
      ...(address.street ? { streetAddress: address.street } : {}),
      addressLocality: address.locality,
      addressRegion: address.region,
      ...(address.postcode ? { postalCode: address.postcode } : {}),
      addressCountry: site.contact.address.countryCode,
    },
    sameAs: settings.socials.map((social) => social.href),
  };
}

/** Serialise for a <script type="application/ld+json"> without allowing "</script>" break-out. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
