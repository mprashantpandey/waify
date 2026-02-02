// Placeholder service worker to satisfy manifest.serviceworker references.
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    self.clients.claim();
});
