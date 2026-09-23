import Image from "next/image";
import Link from "next/link";
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
            <span className="font-display text-xl font-medium">
              Enquiries <span className="sr-only">— {site.name} admin</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {admin.email && (
              <span className="hidden text-sm text-muted-foreground sm:inline">{admin.email}</span>
            )}
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </Container>
      </header>
      <main id="main" className="flex-1 py-10 sm:py-14">
        <Container>{children}</Container>
      </main>
    </>
  );
}
