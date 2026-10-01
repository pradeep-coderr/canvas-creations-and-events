import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AdminRole = "admin" | "super_admin";

export interface AdminSession {
  userId: string;
  email: string | null;
  /** super_admin: also PWA install and notification management (Phase 20). */
  role: AdminRole;
}

/**
 * The signed-in admin, or null. Verifies the JWT (getClaims) and checks
 * membership in admin_users — RLS only lets a user see their own row.
 * Cached per request. Every admin page and action must call this (or
 * requireAdmin); the proxy only refreshes sessions.
 */
export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  const { data: membership } = await supabase
    .from("admin_users")
    .select("user_id, role")
    .eq("user_id", userId)
    .maybeSingle();
  if (!membership) return null;

  const email = data.claims.email;
  return {
    userId,
    email: typeof email === "string" ? email : null,
    role: membership.role === "super_admin" ? "super_admin" : "admin",
  };
});

/**
 * Super-admin-only pages and actions. Normal admins are sent to the admin
 * home (they're signed in, just not allowed here); RLS enforces the same.
 */
export async function requireSuperAdmin(): Promise<AdminSession> {
  const admin = await requireAdmin();
  if (admin.role !== "super_admin") redirect("/admin");
  return admin;
}

/** Redirects to the sign-in page unless the request is from an admin. */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  // (The proxy normally gets here first and keeps the page to return to.)
  if (!admin) redirect("/admin/login");
  return admin;
}
