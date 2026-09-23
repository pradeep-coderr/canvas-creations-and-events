import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

// Public site is crawlable. Private and development routes are also marked
// noindex at page level (robots.txt alone doesn't prevent indexing).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/design-system"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
