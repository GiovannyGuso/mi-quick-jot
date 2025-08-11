const CACHE_NAME = 'quick-jot-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  // MDL y fuentes (opaco, pero cacheable)
  'https://code.getmdl.io/1.3.0/material.indigo-pink.min.css',
  'https://code.getmdl.io/1.3.0/material.min.js',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Install: cache del App Shell
self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE)));
});

// Activate: limpia caches viejos
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Fetch: estrategia Cache First
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(resp => resp || fetch(evt.request))
  );
});
