import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/session";
import { AuthCard } from "../auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");
  const { reset } = await searchParams;

  return (
    <AuthCard title="Admin sign in">
      {reset === "done" && (
        <p role="status" className="mb-6 border-l-2 border-primary pl-3 text-sm">
          Your password was updated. Sign in with your new password.
        </p>
      )}
      <LoginForm />
    </AuthCard>
  );
}
