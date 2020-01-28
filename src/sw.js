const version = "v1.0.0";
const pwaCache = `grid-snake-${version}`;

const files = ["./index.html", "./index.js", "./styles.css"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(pwaCache)
      .then(async cache => {
        try {
          return cache.addAll(files);
        } catch (error) {
          return console.error(error);
        }
      })
      .then(self.skipWaiting)
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(alreadyCached => {
      return (
        alreadyCached ||
        fetch(event.request).then(async response => {
          const cache = await caches.open(pwaCache);
          cache.put(event.request, response.clone());
          return response;
        })
      );
    })
  );
});
