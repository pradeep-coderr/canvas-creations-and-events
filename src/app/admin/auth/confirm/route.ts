import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * The emailed password-reset link lands here. It verifies the one-time code
 * (PKCE `code`, or `token_hash` from a custom email template) and starts a
 * short recovery session, then continues to the reset page. Only same-site
 * paths are accepted as the destination. Failures go back to the forgot-
 * password page without revealing why.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const nextParam = url.searchParams.get("next") ?? "/admin/reset-password";
  const next = nextParam.startsWith("/admin/") && !nextParam.startsWith("//") ? nextParam : "/admin/reset-password";
  const supabase = await createClient();

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
    if (error) console.warn("[admin] reset link rejected", { code: error.code ?? error.status });
  } else if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
    if (error) console.warn("[admin] reset link rejected", { code: error.code ?? error.status });
  }

  const target = new URL(ok ? next : "/admin/forgot-password?link=invalid", url.origin);
  return NextResponse.redirect(target);
}
