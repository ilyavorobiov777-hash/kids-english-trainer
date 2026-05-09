self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("kids-english-trainer-v1").then((cache) => cache.addAll(["/login", "/manifest.webmanifest"]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
