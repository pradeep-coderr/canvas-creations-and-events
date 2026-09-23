import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/**
 * Cache tag on every public content request. Responses live in the Next.js
 * data cache (they outlive a single build or deploy); anything that changes
 * CMS content must call revalidateTag(CMS_CONTENT_TAG) so the site updates
 * immediately instead of after the page's revalidate window.
 */
export const CMS_CONTENT_TAG = "cms-content";

/**
 * Supabase client for reading PUBLIC website content on the server.
 *
 * Anonymous role, no cookies, no session: pages using it stay statically
 * rendered (reading cookies would make every public page dynamic), and RLS
 * limits it to published content. Never use it for admin work — CMS writes
 * need the signed-in user's session (./server.ts) so RLS can see the admin.
 */
export function createPublicClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, next: { ...init?.next, tags: [CMS_CONTENT_TAG] } }),
    },
  });
}
