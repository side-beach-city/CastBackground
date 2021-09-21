importScripts("./files.js")

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