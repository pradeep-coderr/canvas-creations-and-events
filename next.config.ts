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

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
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
