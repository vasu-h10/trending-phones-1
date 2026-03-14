const CACHE = "trending-phones-v1";

const FILES = [
"/",
"/index.html",
"/style.css",
"/app.js",
"/phones.json",
"/banner.jpg"
];

self.addEventListener("install", e => {
e.waitUntil(
caches.open(CACHE).then(cache => cache.addAll(FILES))
);
});

self.addEventListener("fetch", e => {
e.respondWith(
caches.match(e.request).then(r => r || fetch(e.request))
);
});
