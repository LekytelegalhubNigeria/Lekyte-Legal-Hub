const CACHE_NAME = 'lekyte-v1';
const BASE_PATH = '/Lekyte-Legal-Hub/'; 

const urlsToCache = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'css/Style.css',
  BASE_PATH + 'js/main.js',
  BASE_PATH + 'images/lekytelegalhublogo.png',
  BASE_PATH + 'images/icon-192.png',
  BASE_PATH + 'images/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
      .catch(err => console.log('Cache failed:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // Optional: return offline fallback if you add one
        // return caches.match(BASE_PATH + 'offline.html');
      });
    })
  );
});