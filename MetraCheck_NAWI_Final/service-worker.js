const CACHE_NAME = "metracheck-shell-v6";
const APP_FILES = [
  "index.html",
  "manifest.webmanifest",
  "assets/metracheck-icon-192.png",
  "assets/metracheck-icon-512.png",
  "assets/metracheck-icon.svg",
  "css/global.css",
  "css/dashboard.css",
  "css/legal.css",
  "css/login.css",
  "css/public.css",
  "js/app.js",
  "js/auth.js",
  "js/data.js",
  "js/navigation.js",
  "js/notifications.js",
  "js/public.js",
  "js/pwa.js",
  "js/utils.js",
  "js/validation.js",
  "js/views/dashboard.js",
  "js/views/operations.js",
  "js/views/products.js",
  "js/views/profile.js",
  "js/views/reports.js",
  "js/views/testing.js",
  "pages/admin/dashboard.html",
  "pages/inspector/dashboard.html",
  "pages/laboratory/dashboard.html",
  "pages/manufacturer/dashboard.html",
  "pages/privacy.html",
  "pages/public/verify-report.html",
  "pages/reviewer/dashboard.html",
  "pages/terms.html"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_FILES.map(path => new URL(path, self.registration.scope)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.filter(name => name.startsWith("metracheck-shell-") && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch {
        return await cache.match(request, { ignoreSearch: true }) || await cache.match(new URL("index.html", self.registration.scope));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    try {
      const response = await fetch(request, { cache: "reload" });
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request, { ignoreSearch: true });
      if (cached) return cached;
      throw error;
    }
  })());
});