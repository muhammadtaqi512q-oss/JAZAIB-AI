import os

def build_site():
    # Improved index.html with automatic retry for 1st-time service worker activation
    index_html_code = """<!DOCTYPE html><html lang="en"><head>    <meta charset="UTF-8">    <meta name="viewport" content="width=device-width, initial-scale=1.0">    <title>Nexura</title></head><body style="background-color: #090014; margin: 0;">
    <div id="nexura-app"></div>
    <script>
        function fetchUI() {
            fetch('api/render-ui')
                .then(response => {
                    if (!response.ok) throw new Error('API pending SW registration');
                    return response.text();
                })
                .then(htmlContent => {
                    document.getElementById('nexura-app').innerHTML = htmlContent;
                })
                .catch(err => {
                    // Service worker ko activate hone ka 500ms time dein aur retry karein
                    setTimeout(fetchUI, 500);
                });
        }

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').then(() => {
                navigator.serviceWorker.ready.then(fetchUI);
            }).catch(fetchUI);
        } else {
            fetchUI();
        }
    </script>
</body></html>"""

    # Service Worker Interceptor (Maps 'api/render-ui' -> 'mt.html')
    sw_js_code = """
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
"""

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(index_html_code.strip())

    with open("sw.js", "w", encoding="utf-8") as f:
        f.write(sw_js_code.strip())

    print("Build Success: Perfect working code generated!")

if __name__ == "__main__":
    build_site()
