"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { enquiryStatusSchema, type EnquiryStatus } from "@/lib/enquiry-status";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export interface SignInState {
  error?: string;
  /** What was typed, so the form can keep it after a failed attempt (never the password). */
  email?: string;
}

const credentialsSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  password: z.string().min(1).max(200),
});

/** Email + password sign-in. Only accounts listed in admin_users get in. */
export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const typed = String(formData.get("email") ?? "").slice(0, 254);
  if (!parsed.success) return { error: "Enter your email address and password.", email: typed };
  if (!isSupabaseConfigured()) return { error: "Sign-in isn't available right now.", email: typed };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    console.warn("[admin] sign-in failed", { code: error?.code ?? "unknown" });
    return { error: "Incorrect email or password.", email: typed };
  }

  const { data: membership } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!membership) {
    await supabase.auth.signOut();
    console.warn("[admin] sign-in refused: not an admin", { userId: data.user.id });
    return { error: "This account doesn't have access to the admin area.", email: typed };
  }

  console.info("[admin] signed in", { userId: data.user.id });
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export interface StatusState {
  ok?: boolean;
  status?: EnquiryStatus;
  error?: string;
}

const statusUpdateSchema = z.object({
  id: z.uuid(),
  status: enquiryStatusSchema,
});

/** Changes an enquiry's status. Admin-only (checked here and enforced by RLS). */
export async function updateEnquiryStatus(
  _prev: StatusState,
  formData: FormData,
): Promise<StatusState> {
  await requireAdmin();
  const parsed = statusUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Choose a valid status." };
  const { id, status } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", id)
    .select("status")
    .maybeSingle();
  if (error || !data) {
    console.error("[admin] status update failed", { id, code: error?.code ?? "no row" });
    return { error: "The status couldn't be updated. Please try again." };
  }

  console.info("[admin] status updated", { id, status: data.status });
  revalidatePath("/admin");
  revalidatePath(`/admin/enquiries/${id}`);
  return { ok: true, status: data.status as EnquiryStatus };
}
