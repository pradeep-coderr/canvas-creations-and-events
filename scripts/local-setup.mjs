#!/usr/bin/env node
// Local email & push setup helper — LOCAL Supabase only (never the live one).
//
//   bun run setup:local -- --keys
//       Prints a new VAPID key pair and a push dispatch secret, ready to paste
//       into .env.local. Nothing is written anywhere.
//
//   bun run setup:local
//       Reads PUSH_DISPATCH_SECRET from .env.local and stores it in the LOCAL
//       database (private.app_config), with the reminder webhook pointing at
//       your dev server (http://host.docker.internal:3000), so calendar
//       reminder notifications work locally. Prints what's still missing.
//
//   bun run setup:local -- --check-push
//       Sends a real test push to every active device in the LOCAL database
//       and prints each push service's answer (accepted / gone / key mismatch).
//
//   bun run setup:local -- --admin you@example.com
//       Makes that LOCAL user a super admin (needed for Settings → push and
//       test email). If the user doesn't exist yet, it's created with a
//       generated password, shown once. Add --new-password to give an
//       existing local user a new generated password.
//
// Secrets are never printed (except by --keys, which only generates them).

import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import webpush from "web-push";

const args = process.argv.slice(2);

if (args.includes("--keys")) {
  const { publicKey, privateKey } = webpush.generateVAPIDKeys();
  console.log("# Paste into .env.local (new values — keep them private):");
  console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${privateKey}`);
  console.log(`PUSH_DISPATCH_SECRET=${randomBytes(32).toString("hex")}`);
  console.log("# Then run: bun run setup:local");
  process.exit(0);
}

// --- read .env.local (simple KEY=value lines; --env <file> for another file) --
const envAt = args.indexOf("--env");
const envFile = envAt !== -1 ? args[envAt + 1] : ".env.local";
if (!envFile || !existsSync(envFile)) {
  console.error(`No ${envFile ?? "env file"} found. Run: cp .env.example .env.local, then fill it in.`);
  process.exit(1);
}
const env = Object.fromEntries(
  readFileSync(envFile, "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).trim().replace(/^"(.*)"$/, "$1")];
    }),
);

// --- safety: local Supabase only -------------------------------------------
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
let host = "";
try {
  host = new URL(supabaseUrl).hostname;
} catch {}
if (!["127.0.0.1", "localhost"].includes(host)) {
  console.error(
    `${envFile} points at ${supabaseUrl || "(no Supabase URL)"}, not the local Supabase.\n` +
      "This helper only changes the LOCAL database. Set NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 first.",
  );
  process.exit(1);
}

function localSql(sql) {
  // Through a temporary file, so values never appear in the command line.
  const file = join(tmpdir(), `cc-local-setup-${process.pid}.sql`);
  writeFileSync(file, sql, { mode: 0o600 });
  try {
    return execSync(`npx supabase db query --local -f "${file}"`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } finally {
    rmSync(file, { force: true });
  }
}

// --- --check-push: a real push to every active local device -------------------
if (args.includes("--check-push")) {
  const need = ["NEXT_PUBLIC_VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT"].filter((k) => !env[k]);
  if (need.length) {
    console.error(`Missing in ${envFile}: ${need.join(", ")}`);
    process.exit(1);
  }
  const query = `
    select s.endpoint, s.p256dh, s.auth, coalesce(s.user_agent, '') as ua, u.email
    from public.push_subscriptions s join auth.users u on u.id = s.admin_user_id
    where s.revoked_at is null order by s.created_at;`;
  // The CLI occasionally returns nothing (database busy): try once more.
  const readRows = () => {
    try {
      const out = localSql(query);
      const start = out.indexOf("{");
      return start === -1 ? null : (JSON.parse(out.slice(start)).rows ?? []);
    } catch {
      return null;
    }
  };
  const rows = readRows() ?? readRows();
  if (!rows) {
    console.error("Couldn't read the devices from the local database. Is it running (bunx supabase status)? Try again in a moment.");
    process.exit(1);
  }
  if (rows.length === 0) {
    console.log("No active devices. Turn notifications on in Admin → Settings on each device first.");
    process.exit(0);
  }
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  const device = (ua) =>
    /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "Mac" : "device";
  const payload = JSON.stringify({
    title: "Push check",
    body: "Sent by bun run setup:local -- --check-push",
    url: "/admin/settings",
    tag: "push-check",
  });
  for (const r of rows) {
    const service = new URL(r.endpoint).host;
    const label = `${r.email} · ${device(r.ua)} (${service})`;
    try {
      const res = await webpush.sendNotification({ endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } }, payload, {
        TTL: 600,
        urgency: "high",
      });
      console.log(`✔ ${label}: accepted (${res.statusCode}) — it should appear on that device now`);
    } catch (error) {
      const status = error.statusCode;
      const why =
        status === 404 || status === 410
          ? "GONE: that browser dropped this subscription. Turn notifications on again on that device."
          : status === 403
            ? "KEY MISMATCH: subscribed with different VAPID keys. Turn notifications on again on that device."
            : (error.body || error.message || "").toString().slice(0, 160);
      console.log(`✘ ${label}: ${status ?? "error"} — ${why}`);
    }
  }
  process.exit(0);
}

// --- --admin email -----------------------------------------------------------
const adminAt = args.indexOf("--admin");
if (adminAt !== -1) {
  const email = (args[adminAt + 1] ?? "").trim().toLowerCase();
  if (!/^[^\s@']+@[^\s@']+\.[^\s@']+$/.test(email)) {
    console.error("Usage: bun run setup:local -- --admin you@example.com");
    process.exit(1);
  }
  // Create the local sign-in if it doesn't exist yet (local Auth admin API,
  // using the LOCAL development key from `supabase status`; never the live one).
  const found = localSql(`select id as user_id from auth.users where lower(email) = '${email}';`);
  const userId = found.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)?.[0] ?? null;
  const resetPassword = args.includes("--new-password");
  let password = null;
  if (!userId || resetPassword) {
    const status = Object.fromEntries(
      execSync("npx supabase status -o env", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
        .split(/\r?\n/)
        .filter((l) => l.includes("="))
        .map((l) => {
          const i = l.indexOf("=");
          return [l.slice(0, i), l.slice(i + 1).replace(/^"(.*)"$/, "$1")];
        }),
    );
    const apiHost = (() => {
      try {
        return new URL(status.API_URL).hostname;
      } catch {
        return "";
      }
    })();
    const key = status.SECRET_KEY || status.SERVICE_ROLE_KEY;
    if (!["127.0.0.1", "localhost"].includes(apiHost) || !key) {
      console.error("The local Supabase isn't running (bunx supabase start), so the user can't be created.");
      process.exit(1);
    }
    password = randomBytes(12).toString("base64url");
    // New user: create it. Existing user + --new-password: set a new password.
    const res = await fetch(`${status.API_URL}/auth/v1/admin/users${userId ? `/${userId}` : ""}`, {
      method: userId ? "PUT" : "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(userId ? { password, email_confirm: true } : { email, password, email_confirm: true }),
    });
    if (!res.ok) {
      console.error(`Couldn't ${userId ? "set the password for" : "create"} the local user (${res.status}): ${(await res.text()).slice(0, 200)}`);
      process.exit(1);
    }
  }
  localSql(`
    insert into public.admin_users (user_id, role)
    select id, 'super_admin' from auth.users where lower(email) = '${email}'
    on conflict (user_id) do update set role = 'super_admin';`);
  console.log(`${email} is a super admin in the LOCAL database.`);
  if (password) console.log(`Local password (shown once; local only): ${password}`);
  else console.log("This local user already had a password. Forgotten it? Add --new-password to set a new one.");
  console.log("Sign in at http://localhost:3000/admin");
  process.exit(0);
}

// --- push dispatch secret → local database ----------------------------------
const secret = env.PUSH_DISPATCH_SECRET ?? "";
if (!/^[A-Za-z0-9_-]{32,}$/.test(secret)) {
  console.error("PUSH_DISPATCH_SECRET in .env.local is missing or too short. Generate one with: bun run setup:local -- --keys");
  process.exit(1);
}
localSql(`
  insert into private.app_config (key, value) values
    ('push_dispatch_secret', '${secret}'),
    ('reminder_webhook_url', 'http://host.docker.internal:3000/api/push/reminders')
  on conflict (key) do update set value = excluded.value;`);
console.log("Stored the push secret and reminder webhook in the LOCAL database.");

// --- what's still missing -------------------------------------------------------
const missing = (keys) => keys.filter((k) => !env[k]);
const push = missing(["NEXT_PUBLIC_VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT", "PUSH_DISPATCH_SECRET"]);
const email = missing(["RESEND_API_KEY", "RESEND_FROM_EMAIL", "ENQUIRY_NOTIFICATION_EMAIL"]);
console.log(push.length ? `Push: still missing ${push.join(", ")}` : "Push: all set.");
console.log(email.length ? `Email: still missing ${email.join(", ")}` : "Email: all set.");
console.log("Restart `bun run dev`, then go to http://localhost:3000/admin/settings.");
