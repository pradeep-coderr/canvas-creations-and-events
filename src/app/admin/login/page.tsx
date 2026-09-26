import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/session";
import { site } from "@/data/site";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <main id="main" className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Image
            src="/images/logo/canvas-creations-logo-512.png"
            alt={site.name}
            width={512}
            height={512}
            sizes="72px"
            loading="eager"
            className="mx-auto size-18"
          />
          <h1 className="mt-6 font-display text-display-sm font-title">Admin sign in</h1>
        </div>
        <div className="mt-8 bg-background p-6 sm:p-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
