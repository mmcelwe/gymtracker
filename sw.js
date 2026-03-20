const CACHE_NAME = 'gym-tracker-v2';

// Core files to cache on install
const CORE_ASSETS = [
  './',
  './gym-tracker.html',
  './manifest.json',
  './icon.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.26.2/babel.min.js',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700;900&family=Barlow+Condensed:wght@400;600;700;900&display=swap'
];

// Install: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache first, fall back to network, cache new responses
self.addEventListener('fetch', event => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req).then(response => {
        // Don't cache non-ok responses or opaque responses we can't inspect
        if (!response || response.status !== 200) {
          // For cross-origin (opaque) responses, cache them anyway (fonts, CDN)
          if (response && response.type === 'opaque') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
            return response;
          }
          return response;
        }

        // Cache the new response
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        return response;
      }).catch(() => {
        // Network failed and not in cache — return offline fallback for HTML
        if (req.headers.get('accept')?.includes('text/html')) {
          return caches.match('./gym-tracker.html');
        }
      });
    })
  );
});
