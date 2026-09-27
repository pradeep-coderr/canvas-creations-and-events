import type { MetadataRoute } from "next";
import { site } from "@/data/site";

// The installable admin app ("Canvas Admin"), linked from the admin layout.
// The public site keeps its own manifest (src/app/manifest.ts, scope "/");
// this one has a distinct id and the narrower "/admin" scope, so the two are
// separate apps. Static: no private data, no request-time APIs.
export const dynamic = "force-static";

const WHITE = "#ffffff";
const shortcutIcons = [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }];

const manifest: MetadataRoute.Manifest = {
  id: "/admin",
  name: `${site.shortName} Admin`,
  short_name: "Canvas Admin",
  description: `Enquiries, calendar and website admin for ${site.name}.`,
  lang: "en-AU",
  dir: "ltr",
  // Not "/admin/": Next.js redirects that to "/admin", and a "/admin/" scope
  // would leave the dashboard itself out of scope. "/admin" covers
  // /admin, /admin/login and /admin/enquiries/*.
  start_url: "/admin",
  scope: "/admin",
  display: "standalone",
  display_override: ["standalone", "minimal-ui"],
  theme_color: WHITE,
  background_color: WHITE,
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
    { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
  // Real routes only (long-press the app icon on Android; right-click on desktop).
  shortcuts: [
    { name: "Enquiries", short_name: "Enquiries", url: "/admin", icons: shortcutIcons },
    { name: "New enquiries", short_name: "New", url: "/admin?status=new", icons: shortcutIcons },
    { name: "Calendar", short_name: "Calendar", url: "/admin/calendar", icons: shortcutIcons },
    { name: "New reminder", short_name: "Reminder", url: "/admin/calendar?new=reminder", icons: shortcutIcons },
  ],
};

export function GET() {
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  });
}
