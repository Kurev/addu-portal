/**
 * AdDU Alumni Portal — Service Worker
 * Strategy:
 *   - App Shell (HTML, CSS, JS, fonts) → Cache First
 *   - Images                           → Cache First with network fallback
 *   - API / dynamic data               → Network First with cache fallback
 */

const CACHE_VERSION = 'v1';
const SHELL_CACHE   = `addu-shell-${CACHE_VERSION}`;
const IMAGE_CACHE   = `addu-images-${CACHE_VERSION}`;
const DATA_CACHE    = `addu-data-${CACHE_VERSION}`;

// ── App Shell assets to pre-cache on install ──────────────────────────────────
// Keep this list MINIMAL — only files guaranteed to exist
const SHELL_ASSETS = [
  '/',
  '/index.html'
];

// ── Install: pre-cache the app shell ─────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Install — caching app shell');
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => {
        console.warn('[SW] Shell cache failed:', err);
        // Still skip waiting even if cache fails
        return self.skipWaiting();
      })
  );
});

// ── Activate: delete old caches ───────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activate — cleaning old caches');
  const allowedCaches = [SHELL_CACHE, IMAGE_CACHE, DATA_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !allowedCaches.includes(key))
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: routing requests to the right strategy ────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and browser-extension requests
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // 1. Navigation requests → serve shell (SPA routing)
  if (request.mode === 'navigate') {
    event.respondWith(serveShell(request));
    return;
  }

  // 2. Images → Cache First
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // 3. Fonts & stylesheets → Cache First
  if (
    request.destination === 'style' ||
    request.destination === 'font' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  // 4. Scripts → Cache First (app shell JS)
  if (request.destination === 'script') {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  // 5. Everything else → Network First
  event.respondWith(networkFirst(request, DATA_CACHE));
});

// ── Strategy helpers ──────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    if (request.destination === 'image') {
      return offlineImageResponse();
    }
    throw new Error('[SW] Cache First — network failed and no cache hit');
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error('[SW] Network First — offline and no cache hit');
  }
}

async function serveShell(request) {
  const cache  = await caches.open(SHELL_CACHE);
  const cached = await cache.match('/index.html');
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put('/index.html', response.clone());
    return response;
  } catch {
    const offline = await cache.match('/offline.html');
    return offline || new Response('<h1>You are offline</h1>', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

function offlineImageResponse() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
      <rect width="400" height="200" fill="#e8eef5"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="sans-serif" font-size="14" fill="#7a8fa6">
        Image unavailable offline
      </text>
    </svg>`;
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' }
  });
}