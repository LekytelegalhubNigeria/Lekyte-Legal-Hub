const BASE_PATH = '/Lekyte-Legal-Hub/';

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        return caches.match(BASE_PATH + '404.html');
      });
    })
  );
});