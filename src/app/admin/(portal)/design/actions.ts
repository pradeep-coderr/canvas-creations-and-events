"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/session";
import { describeDbError } from "@/lib/cms/errors";
import { createClient } from "@/lib/supabase/server";
import { CMS_CONTENT_TAG } from "@/lib/supabase/public";
import { checkTheme } from "@/lib/theme/palette";
import { rowToTheme, THEME_SELECT, themeSchema, themeToRow, type SiteTheme } from "@/lib/theme/schema";

export type ThemeResult =
  | { ok: true; message: string; theme: SiteTheme }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; failedChecks?: string[] };

/**
 * Save the global site theme. Same rules as the CMS actions: requireAdmin,
 * nothing trusted from the browser (full schema + the readability checks
 * again), written with the admin's session so RLS applies, then the public
 * cache tag is expired so the next request to the website uses the theme.
 */
export async function saveSiteTheme(input: unknown): Promise<ThemeResult> {
  await requireAdmin();

  const parsed = themeSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? "theme")] ??= issue.message;
    return { ok: false, error: "Some design settings aren't valid. Check the highlighted settings.", fieldErrors };
  }

  const failed = checkTheme(parsed.data).filter((c) => !c.pass);
  if (failed.length) {
    return {
      ok: false,
      error: `${failed.length} colour combination${failed.length === 1 ? " is" : "s are"} too hard to read. Fix ${failed.length === 1 ? "it" : "them"} before saving.`,
      failedChecks: failed.map((c) => c.id),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_theme")
    .update(themeToRow(parsed.data))
    .eq("id", true)
    .select(THEME_SELECT)
    .single();
  const saved = rowToTheme(data as unknown as Record<string, unknown> | null);
  if (error || !saved) {
    // No row back = nothing was updated (e.g. RLS refused it): never report success.
    console.error("[theme] save failed", { code: error?.code, message: error?.message?.slice(0, 200), row: !!data });
    return { ok: false, error: describeDbError(error, "save the design") };
  }
  // Success only when the stored row is exactly what was submitted.
  const mismatch = (Object.keys(parsed.data) as (keyof SiteTheme)[]).filter((k) => saved[k] !== parsed.data[k]);
  if (mismatch.length) {
    console.error("[theme] saved row differs from the submitted theme", { fields: mismatch });
    return { ok: false, error: "The design couldn't be saved correctly. Please try again." };
  }

  // The theme is part of every public page: expire the public cache now.
  updateTag(CMS_CONTENT_TAG);
  revalidatePath("/admin/design");
  revalidatePath("/admin/editor");
  return { ok: true, message: "Design saved. The website now uses it.", theme: saved };
}
