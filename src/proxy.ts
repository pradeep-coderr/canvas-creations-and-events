import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Session refresh for the admin area only. The public site needs no auth,
// so it never runs through the proxy.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
