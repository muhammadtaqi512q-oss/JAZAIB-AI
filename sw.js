self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('api/render-ui')) {
        event.respondWith(
            fetch('mt.html').then(response => {
                if (!response.ok) {
                    return new Response('UI content not found', { status: 404 });
                }
                return response;
            })
        );
    }
});