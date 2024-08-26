const cacheName = 'cache-v1';
const files = [
  '/',
  'index.html',
  'css/style.css',
  'js/tictactoe.js',
  'js/ui.js',
  'js/ai.js',
  'images/xoxo/x-regular.svg',
  'images/xoxo/o-regular.svg',
  'images/xoxo/x-bold.svg',
  'images/xoxo/o-bold.svg',
  'fonts/sofia-sans-extra-condensed-bold.woff',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
      cache.addAll(files);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== cacheName)
        .map(key => caches.delete(key))
      )
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});