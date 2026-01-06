// sw.js
const CACHE_NAME = 'forest-v1';
const APP_PREFIX = '/Digital-forest-of-support/';  // ← Your repo name

const urlsToCache = [
  APP_PREFIX,
  APP_PREFIX + 'index.html',  
  APP_PREFIX + 'manifest.json',
  APP_PREFIX + 'extra-wisdom.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if found
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
  );
});

// Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// In your sw.js file
self.addEventListener('install', event => {
    console.log('🌳 Service Worker installing...');
    self.skipWaiting(); // Force activation
});

self.addEventListener('activate', event => {
    console.log('🌳 Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== 'forest-cache-v2') {
                        console.log('🌳 Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('🌳 Claiming clients');
            return self.clients.claim();
        })
    );
});
