// Advanced Offline Service Worker for "Ana Muslim" PWA
const CACHE_NAME = 'ana-muslim-premium-cache-v3';

const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  // 1. Dynamic Cache-First Strategy for external Quran text APIs and audio clips
  if (
    requestUrl.includes('api.alquran.cloud') || 
    requestUrl.includes('archive.org') ||
    requestUrl.includes('islamcan.com') ||
    requestUrl.includes('islamway.net') ||
    requestUrl.includes('quransound.islam.gov.qa') ||
    requestUrl.includes('.mp3') ||
    requestUrl.includes('/api/proxy-audio') ||
    requestUrl.includes('google-fonts') ||
    requestUrl.includes('gstatic.com') ||
    requestUrl.includes('cdn-icons-png')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cacheCopy);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Fallback gracefully if we can't fetch under disconnected states
        });
      })
    );
    return;
  }

  // 2. Default Stale-While-Revalidate for application HTML, JS, CSS, and manifest resources
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => null);
      
      return cachedResponse || fetchPromise;
    })
  );
});
