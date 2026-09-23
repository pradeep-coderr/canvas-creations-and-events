import type { MetadataRoute } from "next";
import { site } from "@/data/site";

// Brand tokens (src/app/globals.css): --cc-white. The header and page
// background are white, so the standalone title bar and splash screen blend
// into the site with no colour flash.
const WHITE = "#ffffff";

/**
 * Web app manifest for installing the public site. Served at
 * /manifest.webmanifest and linked from every page by Next.js.
 *
 * Icons: the real CC monogram. "any" icons are the circular monogram;
 * "maskable" icons are the same artwork scaled into the 80% safe zone on
 * white, so launcher masks (circle, squircle…) never crop it.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    lang: "en-AU",
    dir: "ltr",
    start_url: "/",
    scope: "/",
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
  };
}
