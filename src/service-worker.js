/* Simple service worker for offline caching and update flow
   - Caches minimal shell (index.html) and populates cache on fetch
   - On new service worker activation clients will be able to opt-in to activate the new version
*/
const CACHE_NAME = 'app-v1'
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  )
  // activate new SW immediately (we still ask the user to reload before taking effect)
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  )
  self.clients.claim()
  // notify clients that a new SW is activated
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      clients.forEach(c => c.postMessage({ type: 'SW_ACTIVATED', cache: CACHE_NAME }))
    })
  )
})

self.addEventListener('fetch', event => {
  try {
    // navigation (HTML) requests -> serve index.html from cache (App Shell)
    if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
      event.respondWith(
        caches.match('/index.html').then(resp => resp || fetch(event.request).then(r => {
          // cache a copy for future navigations
          const copy = r.clone()
          caches.open(CACHE_NAME).then(cache => cache.put('/index.html', copy)).catch(()=>{})
          return r
        }).catch(()=>caches.match('/index.html')))
      )
      return
    }

    // other requests: try cache first, fallback to network and then cache
    event.respondWith(
      caches.match(event.request).then(resp => resp || fetch(event.request).then(r => {
        // cache same-origin GET responses
        try {
          if (event.request.method === 'GET' && new URL(event.request.url).origin === self.location.origin) {
            const copy = r.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(()=>{})
          }
        } catch (e) {}
        return r
      }))
    )
  } catch (e) {
    // fallback: let the request fail silently
  }
})

// Support a simple message to immediately skip waiting and activate the new SW
self.addEventListener('message', event => {
  if (!event.data) return
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
