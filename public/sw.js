const CACHE_NAME = 'prompt-manager-v1';
const RUNTIME_CACHE = 'prompt-manager-runtime';

// Assets à mettre en cache lors de l'installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des ressources');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // Ignorer les requêtes Firebase (utiliser le réseau)
  if (url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('firebase.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retourner la version en cache et mettre à jour en arrière-plan
        event.waitUntil(
          fetch(request).then((response) => {
            return caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, response.clone());
              return response;
            });
          }).catch(() => {
            // Échec silencieux si offline
          })
        );
        return cachedResponse;
      }

      // Pas en cache, récupérer du réseau
      return fetch(request).then((response) => {
        // Ne mettre en cache que les réponses valides
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Cloner la réponse
        const responseToCache = response.clone();

        // Mettre en cache
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      }).catch(() => {
        // En cas d'erreur réseau, retourner une page d'erreur basique
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
