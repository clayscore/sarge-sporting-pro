const CACHE_NAME = 'sarge-sporting-v13';
const ICON_URL = 'https://img.icons8.com/ios-filled/512/target.png';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  ICON_URL,
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://html2canvas.hertzen.com/dist/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.4/chart.umd.min.js'
];

self.addEventListener('install', (event) => {
  // FIX: take control on next load without needing every tab closed first,
  // so the bug-fixed index.html actually reaches the phone next time it's opened.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // FIX: cache.addAll() fails ALL-OR-NOTHING - if one CDN asset is briefly
      // unreachable, offline caching silently fails completely. Cache each
      // asset independently instead so one bad fetch doesn't sink the rest.
      return Promise.all(
        ASSETS.map((url) => cache.add(url).catch((err) => console.log('SW: failed to cache', url, err)))
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  // FIX: previously nothing ever deleted old cache versions, so bumping
  // CACHE_NAME just left stale caches accumulating in storage forever.
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
