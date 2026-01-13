const CACHE_NAME = 'webetui-v1.94'; // Update this version string when you deploy a new version
const ASSETS = [
  '/',
  '/index.html',
'/android-launchericon-48-48.png',
'/android-launchericon-72-72.png',
'/android-launchericon-192-192.png',
'/android-launchericon-512-512.png',
'/manifest.json',
'/sw.js'
];

self.addEventListener('install', (e) => {
  // Skip waiting and start using the new service worker immediately
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS); // Cache all assets during installation
      })
      .then(() => self.skipWaiting()) // Make sure the service worker activates immediately
  );
});

self.addEventListener('activate', (e) => {
  // Remove old caches when the service worker is activated
  const currentCaches = [CACHE_NAME]; // Only keep the current cache
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete any caches that don't match the current CACHE_NAME
          if (!currentCaches.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Make sure this service worker takes control immediately
  );
});

self.addEventListener('fetch', (event) => {
  // Cache First for all assets (since they're stable once cached)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // If there's a cached version, return it; otherwise, fetch from the network
        return cachedResponse || fetch(event.request).then((response) => {
          // Cache the fetched response if it's a new request (e.g., new version)
          if (event.request.method === 'GET' && response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone()); // Cache the new version
            });
          }
          return response; // Return the network response
        });
      })
  );
});
