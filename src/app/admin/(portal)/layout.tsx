import Image from "next/image";
import Link from "next/link";
import { AdminAlerts } from "@/components/admin/admin-alerts";
import { AdminNav } from "@/components/admin/admin-nav";
import { InstallApp } from "@/components/admin/install-app";
import { SubmitButton } from "@/components/admin/submit-button";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/session";
import { site } from "@/data/site";
import { signOut } from "../actions";

export default async function AdminPortalLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <>
      <header className="border-b border-border bg-background">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-3 rounded-sm">
            <Image
              src="/images/logo/canvas-creations-logo-512.png"
              alt=""
              width={512}
              height={512}
              sizes="40px"
              loading="eager"
              className="size-10"
            />
            <span className="font-display text-xl font-title">
              Admin <span className="sr-only">— {site.name}</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {/* Super admins only: rendered on the server for them, never sent to other admins. */}
            {admin.role === "super_admin" && <InstallApp compact />}
            {admin.email && (
              <span className="hidden text-sm text-muted-foreground sm:inline">{admin.email}</span>
            )}
            <form action={signOut}>
              <SubmitButton variant="outline" pendingLabel="Signing out…">
                Sign out
              </SubmitButton>
            </form>
          </div>
        </Container>
        {/* Sections of the admin app; the active tab's underline sits on the header border. */}
        <Container className="-mb-px flex items-center justify-between gap-2 max-sm:gap-1">
          <AdminNav superAdmin={admin.role === "super_admin"} />
          {/* The main way to change the website: edit it where it appears. */}
          <Button asChild className="mb-1 shrink-0 px-4 max-sm:px-3">
            {/* "Edit" on phones (four tabs share the row); the name stays "Edit website". */}
            <Link href="/admin/editor">
              Edit<span className="max-sm:sr-only"> website</span>
            </Link>
          </Button>
        </Container>
      </header>
      <main id="main" className="flex-1 py-10 sm:py-14">
        <Container>{children}</Container>
      </main>
      {admin.role === "super_admin" && <AdminAlerts />}
    </>
  );
}
