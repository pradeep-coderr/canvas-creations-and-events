import type { Metadata } from "next";
import { AuthCard } from "../auth-card";
import { ForgotPasswordForm } from "./forgot-form";

export const metadata: Metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage({ searchParams }: PageProps<"/admin/forgot-password">) {
  const { link } = await searchParams;
  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your admin email address and we'll send you a reset link."
    >
      <ForgotPasswordForm invalidLink={link === "invalid"} />
    </AuthCard>
  );
}
