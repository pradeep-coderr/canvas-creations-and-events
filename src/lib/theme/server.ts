import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { defaultTheme, rowToTheme, THEME_SELECT, type SiteTheme } from "./schema";

/**
 * The active site theme, loaded once per render on the server through the
 * same cached, tagged public client as the CMS content (tag `cms-content`).
 * Saving the theme expires that tag, so the next request renders with it.
 *
 * Falls back to the canonical default (which globals.css also holds) when
 * no database is configured, the query fails, or a stored value is somehow
 * malformed — the website always renders.
 */
export const getSiteTheme = cache(async (): Promise<SiteTheme> => {
  if (!isSupabaseConfigured()) return defaultTheme;
  try {
    const { data, error } = await createPublicClient().from("site_theme").select(THEME_SELECT).eq("id", true).single();
    if (error) throw error;
    const theme = rowToTheme(data as unknown as Record<string, unknown>);
    if (!theme) {
      console.error("[theme] stored theme is invalid; using the default theme");
      return defaultTheme;
    }
    return theme;
  } catch (error) {
    const { code, message } = (error ?? {}) as { code?: string; message?: string };
    console.error("[theme] site theme could not be loaded; using the default theme", {
      code: code || undefined,
      message: message?.slice(0, 200),
    });
    return defaultTheme;
  }
});
