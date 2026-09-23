/**
 * The site's canonical origin, used for metadata (canonical, Open Graph),
 * robots.txt, the sitemap and structured data. No domain is hard-coded:
 *
 *   1. NEXT_PUBLIC_SITE_URL           — set this in production, e.g. https://example.com.au
 *   2. VERCEL_PROJECT_PRODUCTION_URL  — Vercel system variable (the project's production domain)
 *   3. http://localhost:3000          — local development
 *
 * An invalid NEXT_PUBLIC_SITE_URL fails the build rather than publishing
 * wrong canonical URLs.
 */
export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return new URL(configured);

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return new URL(`https://${vercelProduction}`);

  return new URL("http://localhost:3000");
}

/** Absolute URL for a site path, e.g. absoluteUrl("/sitemap.xml"). */
export function absoluteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}
