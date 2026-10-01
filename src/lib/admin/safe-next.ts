/**
 * Where to go after signing in: only an admin page on this site. Anything
 * else (another site, "//evil.example", a backslash trick, the login page
 * itself, a control character) falls back to /admin — no open redirect.
 */
export function safeAdminNext(value: unknown): string {
  if (typeof value !== "string" || value.length > 500) return "/admin";
  if (!value.startsWith("/admin")) return "/admin";
  if (value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) return "/admin";
  let url: URL;
  try {
    url = new URL(value, "https://admin.invalid");
  } catch {
    return "/admin";
  }
  if (url.origin !== "https://admin.invalid") return "/admin";
  if (!(url.pathname === "/admin" || url.pathname.startsWith("/admin/"))) return "/admin";
  if (url.pathname.startsWith("/admin/login") || url.pathname.startsWith("/admin/forgot-password")) return "/admin";
  return url.pathname + url.search;
}
