import type { NextConfig } from "next";

// Video players the site may embed (after the visitor presses Play). Same
// hosts as src/lib/media/video-providers.ts. The uploaded-video provider's
// player host is added only when that provider is configured.
function frameSources() {
  const sources = ["'self'", "https://www.youtube-nocookie.com", "https://player.vimeo.com"];
  const stream = process.env.VIDEO_STREAM_CUSTOMER_CODE;
  if (stream && /^[a-z0-9]+$/.test(stream)) sources.push(`https://customer-${stream}.cloudflarestream.com`);
  return sources.join(" ");
}

// Baseline security headers for every response. A full Content-Security-
// Policy (script/style/connect sources) is deliberately not set yet: Next.js
// inline scripts would need per-request nonces, which forces dynamic
// rendering of the static public pages. `frame-ancestors` and `frame-src`
// (only the video players above) are safe to set without nonces.
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
  { key: "Content-Security-Policy", value: `frame-ancestors 'none'; frame-src ${frameSources()}` },
];

// CMS images: only signed URLs for the private "cms-media" bucket of this
// project's Supabase (src/lib/media/server.ts). No other remote images.
// Query strings are allowed (the signature token). Against the local
// Supabase stack (127.0.0.1) the optimizer must be allowed to fetch a local
// address; that is never enabled for a hosted project.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
const localSupabase = supabaseUrl !== null && ["127.0.0.1", "localhost"].includes(supabaseUrl.hostname);

// The public site's own domain, for production builds on Vercel (same order
// as src/lib/site-url.ts). Null elsewhere, or if it is itself a vercel.app
// address (a redirect to it would loop).
function productionOrigin() {
  if (process.env.VERCEL_ENV !== "production") return null;
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const origin = configured ? new URL(configured).origin : host ? `https://${host}` : null;
  return origin && !new URL(origin).hostname.endsWith(".vercel.app") ? origin : null;
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // One public address: in production, *.vercel.app requests (the old
  // project address, bookmarks, the old installed app) move permanently to
  // the custom domain, same path and query. Vercel can't redirect its own
  // vercel.app domain from the dashboard. Preview deployments are untouched.
  async redirects() {
    const origin = productionOrigin();
    if (!origin) return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        destination: `${origin}/:path*`,
        permanent: true,
      },
    ];
  },
  images: supabaseUrl
    ? {
        remotePatterns: [
          {
            protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https",
            hostname: supabaseUrl.hostname,
            port: supabaseUrl.port,
            pathname: "/storage/v1/object/sign/cms-media/images/**",
          },
        ],
        dangerouslyAllowLocalIP: localSupabase,
      }
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
