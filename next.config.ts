import type { NextConfig } from "next";

// Baseline security headers for every response. A full Content-Security-
// Policy (script/style/connect sources) is deliberately not set yet: Next.js
// inline scripts would need per-request nonces, which forces dynamic
// rendering of the static public pages. `frame-ancestors` alone is safe.
// HSTS is provided by Vercel on its domains; add it here only once the
// custom domain is confirmed HTTPS-only (including subdomains).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

// CMS images: only the public "cms-media" bucket of this project's Supabase
// (see src/lib/content/media.ts). No other remote images are allowed.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: supabaseUrl
    ? { remotePatterns: [new URL(`${supabaseUrl}/storage/v1/object/public/cms-media/**`)] }
    : undefined,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Service worker: always revalidated so updates are picked up promptly.
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
      // Defence in depth for the private area (pages also set noindex meta).
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/admin",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
