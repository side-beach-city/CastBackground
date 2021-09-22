importScripts("./src/files.js")
const CB_ALL_FILES_URLS = CB_ALL_FILES.concat(
  "https://cdn.honokak.osaka/honoka/4.3.1/css/bootstrap.min.css",
  "https://code.jquery.com/jquery-3.5.1.slim.min.js",
  "https://cdn.honokak.osaka/honoka/4.3.1/js/bootstrap.bundle.min.js"
);

self.addEventListener('fetch', (event) => {
  console.log('service worker fetch ... ' + event.request);
  event.respondWith(
    caches.match(event.request).then((cacheResponse) => {
      return cacheResponse || fetch(event.request).then((response) => {
        return caches.open('v1').then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll(
        CB_ALL_FILES
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  console.info('activate', event);
});