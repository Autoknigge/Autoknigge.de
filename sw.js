// Simple Service Worker for Autoknigge
// Provides offline caching for better performance

const CACHE_NAME = 'autoknigge-v4';
const STATIC_CACHE_URLS = [
  '/',
  '/styles.css',
  '/script.js',
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

  // Netzwerk zuerst: Besucher sehen immer die neueste Version.
  // Der Zwischenspeicher dient nur als Offline-Fallback.
  event.respondWith(
    fetch(event.request).then(function (networkResponse) {
      if (networkResponse && networkResponse.status === 200) {
        var copy = networkResponse.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, copy);
        });
      }
      return networkResponse;
    }).catch(function () {
      return caches.match(event.request).then(function (cachedResponse) {
        if (cachedResponse) { return cachedResponse; }
        var accept = event.request.headers.get('accept') || '';
        if (accept.includes('text/html')) {
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
