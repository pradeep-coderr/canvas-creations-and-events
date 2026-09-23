import type { Metadata } from "next";

// The admin area is private: never indexed, never linked from the public site.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex min-h-full flex-1 flex-col bg-surface-ivory">{children}</div>;
}
