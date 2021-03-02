const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  // '../models/transaction.js',
  '/assets/css/style.css',
  'https://fonts.googleapis.com/css?family=Istok+Web|Montserrat:800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
];

const CACHE_NAME = 'static-cache-v1';
const RUNTIME_NAME = 'runtime-cache';

// const PRECACHE = 'precache-v1';
// const RUNTIME = 'runtime';

// install
self.addEventListener('install', event => {
  // pre cache image data
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(self.skipWaiting())
      .catch(function (err) {
        console.log("Error")
      })
      .catch(function (err) {
        console.log("Error1");
      })
      
  );

  // tells browser to activate this service worker immediately once it has finished installing
  // self.skipWaiting();
  // console.log("Latest version installed!");
});

// The activate handler takes care of cleaning up old caches. Removes old data from the cache
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        // return array of cache names that are old to delete
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// enable the service worker to intercept network requests
// self.addEventListener('fetch', event => {
//   if (event.request.url.startsWith(self.location.origin)) {
//     // console.log('[Service Worker] Fetch (data)', event.request.url);

//     event.respondWith(
//       caches.open(RUNTIME_NAME).then(cache => {
//         return fetch(event.request)
//           .then(response => {
//             // if (response.status === 200) {
//               cache.put(event.request, response.clone());
//               return response;
//             // }

//           })
//           .catch(() => caches.match(event.request));
//       })
//     );
//     return;
//   }

//   // use cache first for all other requests for performance
//   event.respondWith(
//     caches.match(event.request).then(cachedResponse => {
//       if (cachedResponse) {
//         return cachedResponse;
//       }

//       // request is not in cache. make network request and cache the response
//       return caches.open(RUNTIME_NAME).then(cache => {
//         return fetch(event.request).then(response => {
//           return cache.put(event.request, response.clone()).then(() => {
//             return response;
//           });
//         });
//       });
//     })
//   );
// });

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME_NAME).then((cache) => {
          return fetch(event.request).then((response) => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});
