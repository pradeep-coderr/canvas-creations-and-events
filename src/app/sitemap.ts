import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

// Only real public pages. The site is currently a single page; add routes
// here when they exist (never /admin or /design-system).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
