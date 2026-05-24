// Service Worker 客户端通信封装：仅在生产环境注册 sw.js，并提供清空/查询图标缓存的能力
const SW_URL = '/sw.js'
const MESSAGE_TIMEOUT_MS = 5000

export function registerIconSW() {
  if (!import.meta.env.PROD) return
  if (typeof window === 'undefined') return
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SW_URL).catch((err) => {
      console.warn('[iconCache] Service Worker 注册失败:', err)
    })
  })
}

function sendMessage(message, timeoutMs = MESSAGE_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      reject(new Error('当前浏览器不支持 Service Worker'))
      return
    }
    const sw = navigator.serviceWorker.controller
    if (!sw) {
      reject(new Error('Service Worker 尚未激活，请刷新页面后重试'))
      return
    }

    const channel = new MessageChannel()
    const timer = setTimeout(() => {
      reject(new Error('Service Worker 响应超时'))
    }, timeoutMs)

    channel.port1.onmessage = (event) => {
      clearTimeout(timer)
      const data = event.data || {}
      if (data.ok) {
        resolve(data)
      } else {
        reject(new Error(data.error || '操作失败'))
      }
    }

    sw.postMessage(message, [channel.port2])
  })
}

export function clearIconCache() {
  return sendMessage({ type: 'CLEAR_ICON_CACHE' })
}

export function getIconCacheInfo() {
  return sendMessage({ type: 'GET_CACHE_INFO' })
}

export function isIconCacheAvailable() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return false
  return !!navigator.serviceWorker.controller
}
