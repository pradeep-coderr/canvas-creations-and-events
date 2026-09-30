import type { PriceType } from "@/lib/cms/collections";

/**
 * Pricing packages. The live list comes from the CMS (`pricing_packages`,
 * via src/lib/content/public.ts). No pricing is built in: real packages and
 * prices come only from the owner, so without a database the section is
 * simply not shown.
 */
export interface PricingPackage {
  id: string;
  title: string;
  description?: string;
  priceType: PriceType;
  /** Australian dollars; null for a custom quote. */
  price: number | null;
  pricePrefix?: string;
  priceSuffix?: string;
  features: string[];
  /** Button text; the button always goes to the enquiry form. */
  ctaLabel?: string;
  featured: boolean;
  order: number;
}

export const pricingPackages: PricingPackage[] = [];
