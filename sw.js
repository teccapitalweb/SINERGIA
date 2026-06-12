/* Service Worker · Sinergia Agrícola VIP (PWA) */
const CACHE = 'sinergia-pwa-v1';
const ASSETS = [
  './', 'index.html', 'vip-auth.html', 'vip-panel.html', 'planes.html',
  'manifest.json', 'img/logo.png', 'img/pwa-192.png', 'img/pwa-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // no tocar POST (Firebase/Stripe)
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;       // dejar pasar Firebase/Google/Stripe (cross-origin)
  // HTML: network-first (contenido fresco) con fallback offline
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(req).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return res; })
        .catch(() => caches.match(req).then((r) => r || caches.match('index.html')))
    );
    return;
  }
  // assets propios: cache-first
  e.respondWith(
    caches.match(req).then((r) => r || fetch(req).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return res; }))
  );
});
