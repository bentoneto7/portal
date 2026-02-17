/**
 * SERVICE WORKER
 *
 * PWA com cache offline, notificações push e install prompt
 */

const CACHE_NAME = 'bolanarede-v1.0.0';
const OFFLINE_PAGE = '/offline.html';

// Assets para cache inicial
const PRECACHE_ASSETS = [
    '/',
    '/offline.html',
    '/css/style.css',
    '/css/article.css',
    '/js/main.js',
    '/js/related-articles.js',
    '/images/logo.png',
    '/manifest.json'
];

// Instala Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Install');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Precaching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Ativa Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] Activate');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Intercepta requisições
self.addEventListener('fetch', event => {
    const { request } = event;

    // Apenas cache para GET requests
    if (request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(cached => {
                // 1. Retorna do cache se existir
                if (cached) {
                    // Atualiza cache em background (stale-while-revalidate)
                    fetch(request)
                        .then(response => {
                            if (response && response.status === 200) {
                                caches.open(CACHE_NAME)
                                    .then(cache => cache.put(request, response));
                            }
                        })
                        .catch(() => {
                            // Falha silenciosa - já temos cache
                        });

                    return cached;
                }

                // 2. Busca da rede e adiciona ao cache
                return fetch(request)
                    .then(response => {
                        // Verifica se é uma resposta válida
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clona a resposta (ela só pode ser consumida uma vez)
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // Cache apenas assets locais
                                if (request.url.startsWith(self.location.origin)) {
                                    cache.put(request, responseToCache);
                                }
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error('[SW] Fetch failed:', error);

                        // 3. Retorna página offline para navegação
                        if (request.mode === 'navigate') {
                            return caches.match(OFFLINE_PAGE);
                        }

                        // 4. Retorna fallback para outros recursos
                        return new Response('Network error', {
                            status: 408,
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});

// Push Notifications
self.addEventListener('push', event => {
    console.log('[SW] Push received');

    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'Nova notícia de futebol!',
        icon: '/images/icon-192.png',
        badge: '/images/badge-72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/',
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: 'Ler Agora',
                icon: '/images/icon-check.png'
            },
            {
                action: 'close',
                title: 'Depois',
                icon: '/images/icon-close.png'
            }
        ],
        tag: 'bolanarede-notification',
        renotify: true,
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Bola na Rede', options)
    );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification clicked');

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const url = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Procura por janela já aberta
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }

                // Abre nova janela
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// Background Sync (para envio de dados offline)
self.addEventListener('sync', event => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-comments') {
        event.waitUntil(syncComments());
    }
});

/**
 * Sincroniza comentários offline
 */
async function syncComments() {
    try {
        const cache = await caches.open('pending-comments');
        const requests = await cache.keys();

        for (const request of requests) {
            try {
                await fetch(request.clone());
                await cache.delete(request);
            } catch (error) {
                console.error('[SW] Failed to sync comment:', error);
            }
        }
    } catch (error) {
        console.error('[SW] Sync failed:', error);
    }
}

// Mensagens do cliente
self.addEventListener('message', event => {
    console.log('[SW] Message:', event.data);

    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }

    if (event.data.action === 'getCacheStatus') {
        event.ports[0].postMessage({
            cacheName: CACHE_NAME,
            assetsCount: PRECACHE_ASSETS.length
        });
    }
});

console.log('[SW] Service Worker loaded');
