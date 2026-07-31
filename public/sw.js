const CACHE = "fenouilledes-shell-v3";
const SCOPE = new URL(self.registration.scope).pathname;
const scoped = (path) => `${SCOPE}${path}`.replace(/\/+/g, "/");
const CORE = [
  SCOPE,
  scoped("manifest.webmanifest"),
  scoped("icon-192.png"),
  scoped("icon-512.png"),
  scoped("og.png"),
  scoped("images/galamus.jpg"),
  scoped("images/collioure.jpg"),
  scoped("images/carcassonne.jpg"),
  scoped("images/villefranche.jpg"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.hostname.includes("tile.openstreetmap.org")) {
    event.respondWith(caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      cache.put(event.request, response.clone());
      return response;
    }));
    return;
  }
  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok && url.origin === self.location.origin) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match(SCOPE))));
});
