// Define a version for the cache
const CACHE_NAME = 'utilifyy-cache-v3'; // Bump version to trigger update

// List of files and resources to be cached
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/fonts/fonts.css',
  '/fonts/poppins-bold.ttf',
  '/fonts/satisfy-regular.ttf',
  '/sounds/alarm_clock.ogg',
  '/favicon.png'
];

// Install event: open a cache and add the core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching core assets');
        // Use { cache: 'reload' } to bypass browser's HTTP cache for CDN resources
        const requests = urlsToCache.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(requests);
      })
      .then(() => self.skipWaiting()) // Force activation of new service worker
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all pages
  );
});

// Fetch event: Stale-While-Revalidate strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Don't cache API requests (currency, etc.)
  if (url.pathname.startsWith('/api/')) {
    return; // Let it proceed normally
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Check for valid response before caching
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            console.error('Fetch failed:', err);
            // Return cached response if network fails
            return response || new Response('Network error', { status: 503 });
        });

        // Serve from cache if available, while revalidating in the background.
        return response || fetchPromise;
      });
    })
  );
});