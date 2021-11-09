const FILES_TO_CACHE = [
        "/",
        "/index.js",
        "/manifest.webmanifest",
        "/styles.css",
        "/icons/icon-192x192.png",
        "/icons/icon-512x512.png"
    ];
    
    const cache_Static = "static-cache-v1";
    const cache_Runtime = "runtime-cache";

    // Event listener waits for install to trigger, then open cache_Static to add it to FILES_TO_CACHE
    self.addEventListener("install", event => {
        event.waitUntil(
            caches
                .open(cache_Static)
                .then(cache => cache.addAll (FILES_TO_CACHE))
                .then(() => self.skipWaiting())
        );
    });

// The handler cleans up old caches
    self.addEventListener("activate", event => {
        const currentCaches =[cache_Static, cache_Runtime];
        event.waitUntil(
            caches
                .keys()
                .then((cacheName) => {
                    return cacheName.filter((cacheName) => !currentCaches.includes(cacheName));
                })
                .then((cachesToDelete) => {
                    return Promise.all(
                        cachesToDelete.map((cacheToDelete) => {
                            return caches.delete(cacheToDelete);
                        })
                    );
                })
                .then(() => self.clients.claim())
        );
    });

    self.addEventListener('fetch', (event) => {
        if (event.request.url.startsWith(self.location.origin)) {
            event.respondWith(
                caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return caches.open(RUNTIME).then((cache) => {
                        return cache.put(event.request, response.clone()).then(() => {
                            return response;
                        });
                    });
                })
            );
        };
    });