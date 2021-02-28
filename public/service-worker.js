const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',


  '/favorites.html',
  '/topic.html',
  '/assets/css/style.css',
  '/dist/app.bundle.js',
  '/dist/favorites.bundle.js',
  '/dist/topic.bundle.js',
  'https://fonts.googleapis.com/css?family=Istok+Web|Montserrat:800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache=vl';

// const PRECACHE = 'precache-v1';
// const RUNTIME = 'runtime';

// install
self.addEventListener('install', (event) => {
  // pre cache image data
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(self.skipWaiting())
  );

  // pre cache all static assets
  EventTarget.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
  cache.addAll(FILES_TO_CACHE))
  );

  // tells browser to activate this service worker immediately once it has finished installing
  self.skipWaiting();
});

// The activate handler takes care of cleaning up old caches. Removes old data from the cache
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// enable the service worker to intercept network requests
self.addEventListener('fetch', function (evt) {
  if (evt.request.url.includes('/api/')) {
    console.log('[Service Worker] Fetch (data)', evt.request.url);

    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            return cache.match(evt.request);
          });
      })
    );

    return;
  }

    evt.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
});