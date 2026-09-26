import type { Metadata } from "next";
import { DesignEditor } from "@/components/design/design-editor";
import { requireAdmin } from "@/lib/admin/session";
import { createClient } from "@/lib/supabase/server";
import { rowToTheme, THEME_SELECT } from "@/lib/theme/schema";

export const metadata: Metadata = { title: "Design" };

export default async function DesignPage() {
  await requireAdmin();
  // Read the saved theme fresh with the admin's session (no public cache).
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_theme").select(THEME_SELECT).eq("id", true).single();
  const theme = rowToTheme(data as unknown as Record<string, unknown> | null);

  if (error || !theme) {
    console.error("[theme] admin load failed", { code: error?.code });
    return (
      <>
        <h1 className="font-display text-display-md font-title">Design</h1>
        <p role="alert" className="mt-4 text-destructive">
          The website design couldn&apos;t be loaded. Refresh to try again.
        </p>
      </>
    );
  }

  return <DesignEditor saved={theme} />;
}
