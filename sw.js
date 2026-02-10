// sw.js - Forest of Support Service Worker
const APP_VERSION = '1.6';  // ← CHANGED TO 1.4
const CACHE_NAME = `forest-cache-v${APP_VERSION}-2`;
const APP_PREFIX = self.location.pathname.includes('Digital-forest-of-support') 
    ? '/Digital-forest-of-support/' 
    : '/';
const urlsToCache = [
  APP_PREFIX,
  APP_PREFIX + 'index.html',  
  APP_PREFIX + 'manifest.json'
];

// INSTALL
self.addEventListener('install', event => {
  console.log('🌳 Service Worker installing v' + APP_VERSION);
  self.skipWaiting(); // Force activation
});

// ACTIVATE (COMBINED VERSION)
self.addEventListener('activate', event => {
  console.log('🌳 Service Worker activating v' + APP_VERSION);
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🌳 Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      // Send update message to all clients
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'UPDATE_READY' });
        });
      });
    })
  );
});

// FETCH
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200) {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match(APP_PREFIX + 'index.html');
            }
          });
      })
  );
});
