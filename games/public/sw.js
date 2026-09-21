/*
 * Service worker dos Jogos da Lição (Arcade Kids).
 *
 * Estratégia:
 *  - Navegação (HTML): network-first com fallback para o shell em cache → abre
 *    offline e pega atualização quando há rede.
 *  - Assets (JS/CSS/ícones/fontes): stale-while-revalidate → instantâneo e
 *    atualiza em background.
 *
 * O `BASE` precisa acompanhar o `base` do vite.config.ts (GitHub Pages /kids/).
 * Ao publicar uma mudança que invalide o cache antigo, troque a versão abaixo.
 */
const VERSION = 'v1';
const BASE = '/kids/';
const CACHE = `kids-${VERSION}`;
const SHELL = [BASE, `${BASE}index.html`, `${BASE}manifest.webmanifest`];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Só cuida do próprio app: não intercepta terceiros nem outros caminhos do host.
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(BASE)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match(`${BASE}index.html`))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
