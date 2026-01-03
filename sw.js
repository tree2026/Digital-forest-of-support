// sw.js - Basic Service Worker
const CACHE_NAME = 'forest-v1';
const urlsToCache = [
  '/',
  '/index.html', // or /forest.html
  '/manifest.json',
  '/extra-wisdom.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
