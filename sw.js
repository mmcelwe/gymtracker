const CACHE_NAME = 'gym-tracker-v3';

// Core local files to cache on install
const CORE_ASSETS = [
  './',
  './gym-tracker.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

// CDN assets cached on first fetch (not during install, to avoid opaque response failures)
const CDN_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

// Install: cache only local assets (these always succeed)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches, take control immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for everything, with network fallback
self.addEventListener('fetch', event => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req).then(response => {
        // Cache successful responses and opaque CDN responses
        const isCdn = CDN_HOSTS.some(h => req.url.includes(h));
        const shouldCache = (response.status === 200) || (response.type === 'opaque' && isCdn);

        if (shouldCache) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }

        return response;
      }).catch(() => {
        // Network failed and not in cache — return the main HTML as fallback
        if (req.headers.get('accept')?.includes('text/html')) {
          return caches.match('./gym-tracker.html');
        }
      });
    })
  );
});
