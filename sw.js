self.addEventListener('fetch', (event) => {
  console.log('service worker fetch ... ' + event.request);
});

self.addEventListener('install', (event) => {
  console.info('install', event);
});

self.addEventListener('activate', (event) => {
  console.info('activate', event);
});