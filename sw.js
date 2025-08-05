const CACHE_NAME = 'quick-jot-v1';
const URLS_TO_CACHE = [
  './index.html',
  './css/styles.css',
  './js/app.js',
  'https://code.getmdl.io/1.3.0/material.indigo-pink.min.css',
  'https://code.getmdl.io/1.3.0/material.min.js',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  './manifest.json'
];

// Instalación: cacheamos el App Shell
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

// Activación: limpiamos versiones antiguas si las hubiera
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// Interceptamos fetch y servimos de cache primero
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request)
      .then(resp => resp || fetch(evt.request))
  );
});
