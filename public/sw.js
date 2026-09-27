/*
 * Canvas Creations and Events — service worker for the PUBLIC site.
 *
 * Deliberately small. What it does:
 *   - Homepage HTML ("/")           network-first → last cached copy when offline
 *     (pages are always revalidated with the server: see freshPage)
 *   - /_next/static/* (JS, CSS, fonts; content-hashed, immutable)  cache-first
 *   - Local images/icons (/images/*, /icons/*, /_next/image, app icons)
 *                                   stale-while-revalidate, capped at MEDIA_LIMIT
 *   - Other public navigations offline → a small "you're offline" page
 *
 * What it never touches (the browser handles these normally, uncached):
 *   - /admin and everything under it (private, authenticated), including
 *     the admin app manifest. The installable admin app works online only.
 *   - any non-GET request (form submissions / server actions)
 *   - other origins (Supabase, Resend, social sites)
 *   - React Server Component requests (RSC header / _rsc param)
 *   - anything not listed above (robots.txt, sitemap.xml, the manifest, this file)
 *
 * Updates: bump VERSION when the caching logic changes. A new worker waits
 * until all tabs are closed (no skipWaiting), so nobody is interrupted while
 * filling in the enquiry form; on activation old "cc-" caches are deleted.
 */

const VERSION = "v2";
const PAGES = `cc-pages-${VERSION}`;
const STATIC = `cc-static-${VERSION}`;
const MEDIA = `cc-media-${VERSION}`;
const CURRENT = [PAGES, STATIC, MEDIA];
const MEDIA_LIMIT = 60;

// Install: cache the homepage and the static assets it references (JS, CSS,
// preloaded fonts), so it works offline right after the first visit.
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const response = await fetch("/", { cache: "reload" });
        if (!response.ok) return;
        const html = await response.clone().text();
        await (await caches.open(PAGES)).put("/", response);
        const assets = new Set(
          [...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]),
        );
        const cache = await caches.open(STATIC);
        await Promise.all([...assets].map((url) => cache.add(url).catch(() => {})));
      } catch {
        // Offline during install: pages get cached on the next online visit.
      }
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith("cc-") && !CURRENT.includes(key)) await caches.delete(key);
      }
      // First install only: control the open page so offline works without a
      // reload. (Updates never reach here while an old worker is still in use.)
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) return;
  if (request.headers.has("RSC") || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(url.pathname === "/" ? homepage(request) : navigation(request));
    return;
  }
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/_next/image") ||
    /^\/(icon|apple-icon)\.png$|^\/favicon\.ico$/.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(event, request));
  }
});

async function homepage(request) {
  const cache = await caches.open(PAGES);
  try {
    const response = await freshPage(request);
    if (response.ok && response.type === "basic") await cache.put("/", response.clone());
    return response;
  } catch {
    return (await cache.match("/")) ?? offlinePage();
  }
}

async function navigation(request) {
  try {
    return await freshPage(request);
  } catch {
    return offlinePage();
  }
}

// Pages are sent with "s-maxage=…, stale-while-revalidate=…" for the server
// cache. The browser applies stale-while-revalidate to fetches made from a
// service worker, which would show a visitor the previous version of a page
// once after every content change. "no-cache" makes the browser check with the
// server every time (a cheap 304 via the ETag when nothing changed).
function freshPage(request) {
  return fetch(request, { cache: "no-cache" });
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(event, request) {
  const cache = await caches.open(MEDIA);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
        await trim(cache);
      }
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  return (await refresh) ?? Response.error();
}

async function trim(cache) {
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - MEDIA_LIMIT))) await cache.delete(key);
}

function offlinePage() {
  const html = `<!doctype html><html lang="en-AU"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Offline · Canvas Creations and Events</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fbf5ec;color:#302a29;font-family:Georgia,serif;text-align:center;padding:24px">
<main><h1 style="font-weight:500;font-size:30px;margin:0 0 12px">You're offline</h1>
<p style="font-family:Arial,sans-serif;color:#756a67;margin:0 0 24px">This page isn't available offline. Check your connection and try again.</p>
<a href="/" style="font-family:Arial,sans-serif;font-weight:600;color:#9b605a">Go to the homepage</a></main></body></html>`;
  return new Response(html, {
    status: 503,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/*
 * Web Push (Phase 20) — separate from the caching above, which still never
 * touches /admin. Payloads are minimal ({ title, body, url, tag }). We ask
 * for a normal, non-silent notification; whether it makes a sound or
 * vibrates is decided by the browser and the device's settings.
 */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = typeof data.title === "string" ? data.title : "Canvas Admin";
  const url = safeAdminUrl(data.url);
  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, {
        body: typeof data.body === "string" ? data.body : "",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: typeof data.tag === "string" ? data.tag : undefined,
        renotify: true,
        silent: false,
        vibrate: [200, 100, 200],
        data: { url },
      });
      // An open admin window can also show an in-app alert.
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if (new URL(client.url).pathname.startsWith("/admin")) client.postMessage({ type: "cc-push", title, url });
      }
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = safeAdminUrl(event.notification.data && event.notification.data.url);
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const admin = windows.find((client) => new URL(client.url).pathname.startsWith("/admin"));
      if (admin) {
        await admin.focus();
        if ("navigate" in admin) return admin.navigate(url);
        return undefined;
      }
      return self.clients.openWindow(url);
    })(),
  );
});

// Only same-site admin pages can be opened from a notification.
function safeAdminUrl(value) {
  try {
    const url = new URL(typeof value === "string" ? value : "/admin", self.location.origin);
    return url.origin === self.location.origin && url.pathname.startsWith("/admin") ? url.pathname + url.search : "/admin";
  } catch {
    return "/admin";
  }
}
