import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { MotionProvider } from "@/components/motion/motion-provider";
import { site } from "@/data/site";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Only route-neutral metadata here. Public marketing metadata (description,
// Open Graph, canonical) lives in app/(site); the admin area sets its own
// noindex metadata and must not inherit any of it.
export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: site.name,
  title: site.name,
};

// Browser UI colour (e.g. Android address bar, installed-app title bar):
// --cc-white, matching the header and the manifest theme_color.
export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-AU"
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) add
          attributes to <body> before React loads; only this element's own
          attributes are exempt, never its content. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <MotionProvider>
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
