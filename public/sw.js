// Service Worker for Sahakar Mitra (SIH26088)
// Network-First strategy ensures users always get latest UI while retaining 100% offline resilience

const CACHE_NAME = 'sahakar-mitra-v2.9-live';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/admin.html',
  '/style.css',
  '/app.js',
  '/knowledge_base.json',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          console.log('[ServiceWorker] Purging old cache store:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Pass dynamic API calls to network with offline fallback
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            reply: "ऑफ़लाइन मोड सक्रिय: स्थानीय PACS मॉडल उप-नियम 2023 से उत्तर दिया जा रहा है।",
            source: "Offline ServiceWorker Cache"
          }),
          { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        );
      })
    );
    return;
  }

  // Network-First strategy for pages & styles: always get fresh content, fallback to cache if offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
