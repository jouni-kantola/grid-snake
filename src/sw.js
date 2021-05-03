const version = "v1.0.6";
const pwaCache = `grid-snake-${version}`;

const files = ["./index.html", "./index.js", "./styles.css", "./fonts.css"];

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
  event.waitUntil(
    caches.keys().then(async keys => {
      await Promise.all(
        keys.filter(key => pwaCache !== key).map(key => caches.delete(key))
      );
      return await self.clients.claim();
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(async alreadyCached => {
      return alreadyCached || (await fetchAndCache(event));
    })
  );
});

async function fetchAndCache(event) {
  if (
    event.request.cache === "only-if-cached" &&
    event.request.mode !== "same-origin"
  )
    return;

  return fetch(event.request).then(async response => {
    if (!response.url) return response;
    if (new URL(response.url).origin !== location.origin) return response;

    const cache = await caches.open(pwaCache);
    cache.put(event.request, response.clone());
    return response;
  });
}
