importScripts("./files.js")

self.addEventListener('fetch', (event) => {
  console.log('service worker fetch ... ' + event.request);
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