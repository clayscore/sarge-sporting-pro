const CACHE_NAME = 'clayscore-v41';
// v2 has no CSS/icon/JS framework dependencies - the only external asset is
// html2canvas for the share card, and the app degrades gracefully without it.
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://html2canvas.hertzen.com/dist/html2canvas.min.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // cache each asset independently: addAll is all-or-nothing, so one
      // briefly unreachable CDN would silently sink offline support entirely.
      Promise.all(ASSETS.map((url) => cache.add(url).catch((e) => console.log('SW: skip', url, e))))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
});
