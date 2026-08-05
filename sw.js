// Simple Service Worker for Autoknigge
// Provides offline caching for better performance

const CACHE_NAME = 'autoknigge-v3';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/cookie-consent.js',
  '/cookie.css',
  '/cookie.js',
  '/logo.png',
  '/manifest.json',
  '/404.html',
  '/impressum.html',
  '/datenschutz.html',
  '/robots.txt',
  '/ads.txt'
];

// Install event - cache static assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_CACHE_URLS).catch(function (error) {
        console.warn('[SW] Some assets failed to cache:', error);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (name) {
          return name !== CACHE_NAME;
        }).map(function (name) {
          console.log('[SW] Removing old cache:', name);
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', function (event) {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip analytics and tracking scripts
  if (event.request.url.includes('google-analytics') ||
      event.request.url.includes('googletagmanager') ||
      event.request.url.includes('adsbygoogle')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) {
        // Return cached response, but fetch in background to update cache
        fetch(event.request).then(function (networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(function () {
          // Network fetch failed - just use cache
        });
        return cachedResponse;
      }

      // Not in cache - fetch from network
      return fetch(event.request).then(function (networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(function () {
        // If fetch fails and it's an HTML request, return the 404 page
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/404.html');
        }
        return new Response('Offline - Please check your connection', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});
