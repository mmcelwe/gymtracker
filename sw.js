const CACHE_NAME = 'gym-tracker-v28';

const CORE_ASSETS = [
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.26.2/babel.min.js'
];

const CDN_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

// Install: cache local assets, then try CDN assets (don't fail if CDN is slow)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await cache.addAll(CORE_ASSETS);
      for (const url of CDN_ASSETS) {
        try { await cache.add(url); } catch(e) { console.warn('CDN cache skip:', url); }
      }
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches, claim all clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch handler
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Navigation requests (page loads, PWA launch) — always serve the HTML
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cached => {
        return cached || fetch(req).then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put('./index.html', clone));
          return resp;
        });
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // All other requests — cache first, network fallback
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req).then(response => {
        const isCdn = CDN_HOSTS.some(h => req.url.includes(h));
        const shouldCache = (response.status === 200) || (response.type === 'opaque' && isCdn);

        if (shouldCache) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return response;
      });
    })
  );
});
