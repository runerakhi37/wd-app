const CACHE_NAME = 'wardrobe-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // Always skip SW for APIs
  if (event.request.url.includes('api.open-meteo.com') || event.request.url.includes('generativelanguage.googleapis.com')) {
      return fetch(event.request);
  }

  // Network First strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Successful network request -> cache it and return
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        }
        return response;
      })
      .catch(() => {
        // Network failed (offline) -> fallback to cache
        return caches.match(event.request);
      })
  );
});
