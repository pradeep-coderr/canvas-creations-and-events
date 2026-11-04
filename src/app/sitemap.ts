import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

// Only real public pages: the home page, the terms and the privacy policy
// (never /admin or /design-system).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/terms"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/privacy"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
