// sw.js - Forest of Support Service Worker
const APP_VERSION = '1.1';
const CACHE_NAME = `forest-cache-v${APP_VERSION}`;
const APP_PREFIX = '/Digital-forest-of-support/';  // Your repository name

// Files to cache for offline use
const urlsToCache = [
  APP_PREFIX,
  APP_PREFIX + 'index.html',  
  APP_PREFIX + 'manifest.json'
  // Note: extra-wisdom.js doesn't exist in your current setup
];

// INSTALL EVENT - Cache files on first install
self.addEventListener('install', event => {
  console.log('🌳 Service Worker installing v' + APP_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('🌳 Cache opened:', CACHE_NAME);
        return cache.addAll(urlsToCache)
          .then(() => {
            console.log('🌳 All files cached');
            return self.skipWaiting(); // Force activation
          });
      })
      .catch(err => {
        console.log('🌳 Cache failed:', err);
      })
  );
});

// ACTIVATE EVENT - Clean up old caches
self.addEventListener('activate', event => {
  console.log('🌳 Service Worker activating v' + APP_VERSION);
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches (keep only current version)
          if (cacheName !== CACHE_NAME) {
            console.log('🌳 Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🌳 Claiming clients');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// FETCH EVENT - Serve cached files when offline
self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension requests and non-HTTP requests
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if found
        if (cachedResponse) {
          console.log('🌳 Serving from cache:', event.request.url);
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response for caching
            const responseToCache = response.clone();
            
            // Cache the new response
            caches.open(CACHE_NAME)
              .then(cache => {
                console.log('🌳 Caching new resource:', event.request.url);
                cache.put(event.request, responseToCache);
              })
              .catch(err => {
                console.log('🌳 Cache put error:', err);
              });
            
            return response;
          })
          .catch(err => {
            console.log('🌳 Fetch failed:', err);
            // For HTML pages, return the cached index.html
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match(APP_PREFIX + 'index.html');
            }
            return new Response('Offline - Please check your connection', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// MESSAGE EVENT - Handle messages from the page
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    console.log('🌳 skipWaiting message received');
    self.skipWaiting();
  }
});

// PERIODIC SYNC (if you want to add background updates later)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-check') {
    console.log('🌳 Periodic sync for updates');
    // You could add update checking logic here
  }
});
