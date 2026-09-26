import { themeCss } from "@/lib/theme/css";
import { getSiteTheme } from "@/lib/theme/server";

/**
 * The global site theme as CSS variables, rendered on the server into the
 * page (no client request, no JavaScript). Used by every public page and by
 * the visual editor, so they show exactly what visitors see.
 *
 * The CSS is generated only from validated colours and fixed options
 * (src/lib/theme/css.ts), so rendering it raw is safe.
 */
export async function SiteThemeStyle() {
  const theme = await getSiteTheme();
  return <style id="site-theme" dangerouslySetInnerHTML={{ __html: themeCss(theme) }} />;
}
