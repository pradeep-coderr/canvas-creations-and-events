import type { Metadata } from "next";

// The admin area is private: never indexed, never linked from the public site.
// Every admin page, including sign-in, links the admin app manifest (replacing
// the public one), so installing from here opens the admin, not the homepage.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: { title: "Canvas Admin", statusBarStyle: "default" },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex min-h-full flex-1 flex-col bg-surface-ivory">{children}</div>;
}
