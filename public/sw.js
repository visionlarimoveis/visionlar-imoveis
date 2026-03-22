// VisionLar PWA Service Worker
const CACHE_NAME = 'visionlar-v1'
const STATIC_CACHE = 'visionlar-static-v1'

// Arquivos para cache estático
const STATIC_FILES = [
  '/',
  '/site/imoveis',
  '/manifest.json',
  '/logo.png',
]

// Instala o SW e faz cache dos arquivos estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_FILES).catch(() => {
        // Ignora erros de cache no install
      })
    })
  )
  self.skipWaiting()
})

// Ativa e limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== STATIC_CACHE)
          .map(key => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Estratégia: Network First para páginas, Cache First para assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Ignora requisições não-HTTP e do Supabase/Analytics
  if (!url.protocol.startsWith('http') ||
      url.hostname.includes('supabase') ||
      url.hostname.includes('analytics') ||
      url.hostname.includes('googletagmanager')) {
    return
  }

  // Imagens: Cache First
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached
          return fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone())
            return response
          }).catch(() => cached || new Response('', { status: 404 }))
        })
      )
    )
    return
  }

  // Páginas e API: Network First com fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cacheia páginas bem-sucedidas
        if (response.ok && event.request.method === 'GET') {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() =>
        // Offline: tenta do cache
        caches.match(event.request).then(cached => {
          if (cached) return cached
          // Fallback para a home se offline
          return caches.match('/site/imoveis')
        })
      )
  )
})
