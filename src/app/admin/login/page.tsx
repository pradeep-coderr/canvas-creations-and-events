import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { safeAdminNext } from "@/lib/admin/safe-next";
import { getAdmin } from "@/lib/admin/session";
import { AuthCard } from "../auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { reset, next: nextParam } = await searchParams;
  const next = safeAdminNext(nextParam);
  if (await getAdmin()) redirect(next);

  return (
    <AuthCard title="Welcome back" description="Sign in to manage enquiries, reviews and the website.">
      {reset === "done" && (
        <p
          role="status"
          className="mb-6 flex items-start gap-2.5 rounded-md border border-primary/25 bg-surface-blush p-3 text-sm"
        >
          <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          Your password was updated. Sign in with your new password.
        </p>
      )}
      {next !== "/admin" && (
        <p className="mb-6 text-sm text-muted-foreground">Sign in to continue to that page.</p>
      )}
      <LoginForm next={next} />
    </AuthCard>
  );
}
