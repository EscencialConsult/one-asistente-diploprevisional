self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // A simple pass-through to satisfy PWA criteria.
  // In a real offline-first app, we'd cache the app shell here.
  e.respondWith(fetch(e.request).catch(() => new Response('Offline')));
});
