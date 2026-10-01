import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";

/**
 * Admin requests (src/proxy.ts matches /admin/*):
 *
 *   1. Refreshes the Supabase session cookie so Server Components always see
 *      a valid session.
 *   2. GATE (first layer): a signed-out visitor asking for any admin page
 *      other than the public ones below is sent to /admin/login?next=…
 *      before any admin code runs.
 *   3. Admin responses are never cached (private, no-store): after signing
 *      out, Back or a shared computer can't show admin pages from a cache.
 *
 * The proxy only knows whether someone is SIGNED IN. Whether they're an
 * admin (admin_users) is checked by every page and server action
 * (src/lib/admin/session.ts: requireAdmin / requireSuperAdmin), and RLS
 * enforces the same in the database — three layers.
 */

/** Admin paths anyone may open (signing in, resetting a password, the app manifest). */
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/forgot-password", "/admin/manifest.webmanifest"]);

export function isPublicAdminPath(pathname: string) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return PUBLIC_ADMIN_PATHS.has(path);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname, search } = request.nextUrl;
  const isPublic = isPublicAdminPath(pathname);

  if (!isSupabaseConfigured()) {
    // No auth backend: nothing private can work, so admin pages go to sign-in
    // (which explains that sign-in isn't available).
    if (!isPublic && (request.method === "GET" || request.method === "HEAD")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  const { url, publishableKey } = getSupabaseEnv();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Cache-control headers from Supabase so auth responses aren't cached.
        for (const [key, value] of Object.entries(headers ?? {})) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Validates the JWT and refreshes an expiring session (writes new cookies).
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  // Page loads only. Server actions (POST) check access themselves and
  // answer with their own redirect, which the admin pages handle.
  if (!signedIn && !isPublic && (request.method === "GET" || request.method === "HEAD")) {
    const login = new URL("/admin/login", request.url);
    if (pathname !== "/admin") login.searchParams.set("next", pathname + search);
    const redirect = NextResponse.redirect(login);
    // Keep any cookie changes (e.g. a cleared, expired session).
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
