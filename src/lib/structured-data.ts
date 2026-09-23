import { site } from "@/data/site";
import { absoluteUrl } from "@/lib/site-url";

/**
 * schema.org LocalBusiness for the public homepage. Built only from verified
 * business data in src/data/site.ts — deliberately no opening hours, price
 * range, ratings, email, coordinates, founding date or service radius.
 * Contains no user-submitted data.
 */
export function localBusinessJsonLd() {
  const { phone, address } = site.contact;
  const logo = absoluteUrl("/images/logo/canvas-creations-logo-512.png");

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${absoluteUrl("/")}#business`,
    name: site.name,
    slogan: site.slogan,
    description: site.description,
    url: absoluteUrl("/"),
    telephone: phone.href.replace(/^tel:/, ""),
    logo,
    image: logo,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.locality,
      addressRegion: address.region,
      postalCode: address.postcode,
      addressCountry: address.countryCode,
    },
    sameAs: site.socials.map((social) => social.href),
  };
}

/** Serialise for a <script type="application/ld+json"> without allowing "</script>" break-out. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
