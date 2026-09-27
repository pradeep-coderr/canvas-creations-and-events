import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthCard } from "../auth-card";
import { ResetPasswordForm } from "./reset-form";

export const metadata: Metadata = { title: "Set a new password" };

/** Reached only with the recovery session from the emailed link. */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/admin/forgot-password?link=invalid");

  return (
    <AuthCard title="Set a new password" description="Choose a new password for your admin account.">
      <ResetPasswordForm />
    </AuthCard>
  );
}
