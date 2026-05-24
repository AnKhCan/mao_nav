// 图标缓存 Service Worker
// 策略：Cache-First + 30 天 TTL，跨域图片请求
// 升级时改 CACHE_VERSION，activate 阶段会清理旧版本

const CACHE_VERSION = 'v1'
const CACHE_PREFIX = 'mao-nav-icons-'
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`
const MAX_ENTRIES = 300
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
const CACHED_AT_HEADER = 'x-cached-at'

function isIconRequest(request) {
  if (request.method !== 'GET') return false
  if (request.destination !== 'image') return false
  let url
  try {
    url = new URL(request.url)
  } catch {
    return false
  }
  if (url.origin === self.location.origin) return false
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
  return true
}

function isExpired(cachedResponse) {
  const cachedAt = Number(cachedResponse.headers.get(CACHED_AT_HEADER))
  if (!Number.isFinite(cachedAt) || cachedAt <= 0) return true
  return Date.now() - cachedAt > MAX_AGE_MS
}

async function buildCachedResponse(response, cachedAt) {
  const headers = new Headers(response.headers)
  headers.set(CACHED_AT_HEADER, String(cachedAt))
  const blob = await response.blob()
  return new Response(blob, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

async function enforceQuota(cache) {
  const keys = await cache.keys()
  if (keys.length <= MAX_ENTRIES) return
  const entries = await Promise.all(
    keys.map(async (request) => {
      const resp = await cache.match(request)
      const cachedAt = Number(resp && resp.headers.get(CACHED_AT_HEADER)) || 0
      return { request, cachedAt }
    })
  )
  entries.sort((a, b) => a.cachedAt - b.cachedAt)
  const toRemove = entries.slice(0, entries.length - MAX_ENTRIES)
  await Promise.all(toRemove.map(({ request }) => cache.delete(request)))
}

async function handleIconRequest(event) {
  const { request } = event
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  if (cached && !isExpired(cached)) {
    return cached
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse && networkResponse.ok) {
      const clone = networkResponse.clone()
      const writePromise = (async () => {
        try {
          const cachedResponse = await buildCachedResponse(clone, Date.now())
          await cache.put(request, cachedResponse)
          await enforceQuota(cache)
        } catch {
          // 写缓存失败不影响主流程
        }
      })()
      event.waitUntil(writePromise)
      return networkResponse
    }
    if (cached) return cached
    return networkResponse
  } catch (err) {
    if (cached) return cached
    throw err
  }
}

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(
        names
          .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  if (!isIconRequest(event.request)) return
  event.respondWith(handleIconRequest(event))
})

self.addEventListener('message', (event) => {
  const data = event.data || {}
  const port = event.ports && event.ports[0]

  if (data.type === 'CLEAR_ICON_CACHE') {
    event.waitUntil(
      (async () => {
        try {
          await caches.delete(CACHE_NAME)
          port && port.postMessage({ ok: true })
        } catch (err) {
          port && port.postMessage({ ok: false, error: err.message })
        }
      })()
    )
    return
  }

  if (data.type === 'GET_CACHE_INFO') {
    event.waitUntil(
      (async () => {
        try {
          const cache = await caches.open(CACHE_NAME)
          const keys = await cache.keys()
          let oldestAt = null
          let newestAt = null
          for (const req of keys) {
            const resp = await cache.match(req)
            const cachedAt = Number(resp && resp.headers.get(CACHED_AT_HEADER)) || 0
            if (cachedAt > 0) {
              if (oldestAt === null || cachedAt < oldestAt) oldestAt = cachedAt
              if (newestAt === null || cachedAt > newestAt) newestAt = cachedAt
            }
          }
          port && port.postMessage({
            ok: true,
            count: keys.length,
            max: MAX_ENTRIES,
            oldestAt,
            newestAt,
            maxAgeMs: MAX_AGE_MS,
          })
        } catch (err) {
          port && port.postMessage({ ok: false, error: err.message })
        }
      })()
    )
  }
})
