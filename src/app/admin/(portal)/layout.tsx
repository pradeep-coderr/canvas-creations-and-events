import Image from "next/image";
import Link from "next/link";
import { House, Pencil } from "lucide-react";
import { AdminAccountMenu } from "@/components/admin/admin-account-menu";
import { AdminAlerts } from "@/components/admin/admin-alerts";
import { AdminNotificationsBell } from "@/components/admin/admin-notifications-bell";
import { AdminNav } from "@/components/admin/admin-nav";
import { InstallApp } from "@/components/admin/install-app";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/session";
import { createClient } from "@/lib/supabase/server";
import { loadNotifications } from "@/lib/admin/notifications";
import { site } from "@/data/site";

/** When this render's data was read (notification times). */
const readAt = () => Date.now();

export default async function AdminPortalLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  // The Chats badge (chats waiting for a reply), and this admin's notifications for the bell.
  const [{ count: chatUnread }, notifications] = await Promise.all([
    supabase.from("chat_conversations").select("id", { count: "exact", head: true }).gt("admin_unread", 0),
    loadNotifications(supabase, admin.userId),
  ]);
  const notificationsUnread = notifications.filter((n) => n.unread).length;

  return (
    <>
      {/*
        One header for every screen size:
          wide (2xl+): logo · tabs · View website · Install · Edit website · account
          below 2xl:   logo · actions on the first row, the tabs on a second row
                       (phones: compact buttons, the tabs scroll sideways)
        The tabs' underline sits on the header's bottom border.
      */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <Container className="flex max-w-none flex-wrap items-center gap-x-3 px-4 sm:gap-x-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="order-1 flex h-14 shrink-0 items-center gap-2.5 rounded-sm sm:h-16 sm:gap-3">
            <Image
              src="/images/logo/canvas-creations-logo-512.png"
              alt=""
              width={512}
              height={512}
              sizes="40px"
              loading="eager"
              className="size-9 sm:size-10"
            />
            <span className="font-display text-lg font-title sm:text-xl">
              Admin <span className="sr-only">— {site.name}</span>
            </span>
          </Link>

          <AdminNav
            superAdmin={admin.role === "super_admin"}
            chatUnread={chatUnread ?? 0}
            className="order-3 -mx-3 basis-[calc(100%+1.5rem)] self-end 2xl:order-2 2xl:mx-0 2xl:min-w-0 2xl:flex-1 2xl:basis-0"
          />

          <div className="order-2 ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 2xl:order-3 2xl:ml-0">
            <Button asChild variant="ghost" size="icon" className="rounded-full max-lg:hidden" title="View website">
              <Link href="/">
                <House />
                <span className="sr-only">View website</span>
              </Link>
            </Button>
            {/* Super admins only: rendered on the server for them, never sent to other admins. */}
            {admin.role === "super_admin" && <InstallApp compact />}
            {/* The main way to change the website: edit it where it appears. */}
            <Button asChild className="px-3.5 sm:px-4">
              <Link href="/admin/editor">
                <Pencil data-icon="inline-start" />
                Edit<span className="max-sm:sr-only"> website</span>
              </Link>
            </Button>
            <AdminNotificationsBell items={notifications.slice(0, 8)} unread={notificationsUnread} now={readAt()} />
            <AdminAccountMenu email={admin.email ?? null} />
          </div>
        </Container>
      </header>
      <main id="main" className="flex-1 py-10 sm:py-14">
        {/* Full width like the header, with the same edge padding. */}
        <Container className="max-w-none px-4 sm:px-6 lg:px-8">{children}</Container>
      </main>
      {admin.role === "super_admin" && <AdminAlerts />}
    </>
  );
}
