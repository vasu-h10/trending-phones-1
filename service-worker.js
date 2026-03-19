const CACHE = "trending-deals-v1";

const FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/categories.json"
];

/* INSTALL */
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

/* FETCH */
self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});