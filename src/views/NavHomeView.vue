<template>
  <!-- 锁定界面 -->
  <div v-if="isLocked && !isUnlocked" class="lock-container">
    <div class="lock-box">
      <h1>🔐 访问验证</h1>
      <p class="lock-description">此导航站已启用访问保护</p>
      <form @submit.prevent="handleUnlock">
        <div class="form-group">
          <label for="unlock-password">请输入访问密钥:</label>
          <input
            id="unlock-password"
            type="password"
            v-model="unlockPassword"
            placeholder="请输入访问密钥"
            required
            class="form-input"
          />
        </div>
        <button type="submit" class="unlock-btn" :disabled="unlocking">
          {{ unlocking ? '验证中...' : '进入导航' }}
        </button>
      </form>
      <div v-if="unlockError" class="error-message">
        {{ unlockError }}
      </div>
    </div>
  </div>

  <!-- 正常导航界面 -->
  <div v-else class="nav-home">
    <!-- 左侧边栏 -->
    <aside class="sidebar">
      <!-- Logo区域 -->
      <div class="logo-section">
        <img src="/logo.png" alt="logo" class="logo" />
        <h1 class="site-title">{{ title || '猫猫导航' }}</h1>
      </div>

      <!-- 分类导航 -->
      <nav class="category-nav">
        <h2 class="nav-title">分类导航</h2>
        <ul class="category-list">
          <li
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            :class="{ active: activeCategoryId === category.id }"
            @click="scrollToCategory(category.id)"
          >
            <span class="category-indicator" aria-hidden="true"></span>
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
          </li>
        </ul>
      </nav>

      <!-- 左侧边栏底部信息 -->
      <div class="sidebar-footer">
        <a
          href="https://github.com/maodeyu180/mao_nav"
          target="_blank"
          rel="noopener noreferrer"
          class="github-link"
          title="查看源代码"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>开源不易，⭐一下吧！</span>
        </a>
      </div>
    </aside>

    <!-- 右侧主内容区 -->
    <main class="main-content">
                  <!-- 顶部搜索栏 -->
      <header class="search-header">
        <div v-if="searchEnabled" class="search-container">
          <div class="search-engine-selector">
            <img :src="searchEngines[selectedEngine].icon" :alt="selectedEngine" class="engine-logo" />
            <select v-model="selectedEngine" class="engine-select">
              <option value="google">Google</option>
              <option value="baidu">Baidu</option>
              <option value="bing">Bing</option>
              <option value="duckduckgo">DuckDuckGo</option>
            </select>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="searchEngines[selectedEngine].placeholder"
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>

        <!-- 主题切换按钮 -->
        <button class="theme-toggle-btn" @click="themeStore.toggleTheme" :title="themeStore.isDarkMode ? '切换到日间模式' : '切换到夜间模式'">
          <svg v-if="!themeStore.isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7ZM4 12C4 16.4183 7.58172 20 12 20C15.0583 20 17.7158 18.2839 19.062 15.7621C18.3945 15.9187 17.7035 16 17 16C12.0294 16 8 11.9706 8 7C8 6.29648 8.08133 5.60547 8.2379 4.938C5.71611 6.28423 4 8.9417 4 12Z"/>
          </svg>
        </button>

        <!-- 移动端菜单按钮 -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- 移动端分类菜单 -->
        <div class="mobile-menu" :class="{ active: showMobileMenu }">
          <!-- 顶部 Logo 区 -->
          <div class="mobile-menu-header">
            <div class="header-left">
              <img src="/logo.png" alt="logo" class="mobile-logo" />
              <h3>{{ title || '猫猫导航' }}</h3>
            </div>
            <button class="close-btn" @click="closeMobileMenu" aria-label="关闭菜单">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- 分类导航小标题 -->
          <h4 class="mobile-nav-title">分类导航</h4>

          <ul class="mobile-category-list">
            <li
              v-for="category in categories"
              :key="category.id"
              class="mobile-category-item"
              :class="{ active: activeCategoryId === category.id }"
              @click="scrollToCategoryMobile(category.id)"
            >
              <span class="category-indicator" aria-hidden="true"></span>
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
            </li>
          </ul>

          <!-- 底部 GitHub 链接 -->
          <div class="mobile-menu-footer">
            <a
              href="https://github.com/maodeyu180/mao_nav"
              target="_blank"
              rel="noopener noreferrer"
              class="github-link"
              title="查看源代码"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>开源不易，⭐一下吧！</span>
            </a>
          </div>
        </div>

        <!-- 移动端菜单遮罩 -->
        <div class="mobile-menu-overlay" :class="{ active: showMobileMenu }" @click="closeMobileMenu"></div>
      </header>

      <!-- 导航内容区 -->
      <div class="content-area">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
          <button @click="fetchCategories" class="retry-btn">重试</button>
        </div>

                <!-- 分类内容 -->
        <div v-else class="categories-container">
          <section
            v-for="category in categories"
            :key="category.id"
            class="category-section"
            :id="`category-${category.id}`"
          >
            <h2 class="category-title">
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
            </h2>

            <div class="sites-grid">
              <a
                v-for="site in category.sites"
                :key="site.id"
                :href="site.url"
                target="_blank"
                rel="noopener noreferrer"
                class="site-card"
              >
                <div class="site-icon">
                  <img :src="site.icon" :alt="site.name" @error="handleImageError" />
                </div>
                <div class="site-info">
                  <h3 class="site-name">{{ site.name }}</h3>
                  <p class="site-description">{{ site.description }}</p>
                </div>
              </a>
            </div>
          </section>

          <!-- 页面底部信息 -->
          <footer class="page-footer" hidden="true">
            <div class="footer-content">
              <div class="footer-info">
                <h3>{{ title || '猫猫导航' }}</h3>
                <p>一个简洁、美观的导航网站，收录优质网站资源</p>
              </div>

              <div class="footer-links">
                <a
                  href="https://github.com/maodeyu180/mao_nav"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="footer-link"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  开源项目
                </a>
              </div>
            </div>

            <div class="footer-bottom">
              <p>&copy; {{ new Date().getFullYear() }} 猫猫导航 - 由 <a href="https://github.com/maodeyu180" target="_blank" rel="noopener noreferrer">maodeyu180</a> 用 ❤️ 制作</p>
              <p class="footer-tech">基于 Vue.js 构建 | <a href="https://github.com/maodeyu180/mao_nav" target="_blank" rel="noopener noreferrer">查看源代码</a></p>
            </div>
          </footer>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useNavigation } from '@/apis/useNavigation.js'
import { useThemeStore } from '@/stores/counter.js'
// 导入搜索引擎logo图片
import googleLogo from '@/assets/goolge.png'
import baiduLogo from '@/assets/baidu.png'
import bingLogo from '@/assets/bing.png'
import duckLogo from '@/assets/duck.png'

// 使用导航API
const { categories, title, defaultSearchEngine, searchEnabled, loading, error, fetchCategories } = useNavigation()

// 使用主题store
const themeStore = useThemeStore()

// 响应式数据
const searchQuery = ref('') // 搜索查询
const selectedEngine = ref('bing') // 选中的搜索引擎，初始值会在组件挂载后更新
const showMobileMenu = ref(false) // 移动端菜单显示状态
const activeCategoryId = ref(null) // 当前可见的分类，用于侧边栏高亮

// 滚动联动相关
let categoryObserver = null
// 点击跳转时短暂忽略 observer 推送的值，避免与平滑滚动期间多个 section 同时可见产生抖动
let suppressObserverUntil = 0

// 锁定功能相关
const isLocked = ref(false) // 是否启用锁定功能
const isUnlocked = ref(false) // 是否已解锁
const unlockPassword = ref('') // 解锁密码输入
const unlocking = ref(false) // 解锁中状态
const unlockError = ref('') // 解锁错误信息

// 搜索引擎配置
const searchEngines = {
  google: {
    url: 'https://www.google.com/search?q=',
    icon: googleLogo,
    placeholder: 'Google (点logo切换搜索引擎'
  },
  baidu: {
    url: 'https://www.baidu.com/s?wd=',
    icon: baiduLogo,
    placeholder: '百度一下(点logo切换搜索引擎'
  },
  bing: {
    url: 'https://www.bing.com/search?q=',
    icon: bingLogo,
    placeholder: 'Bing (点logo切换搜索引擎)'
  },
  duckduckgo: {
    url: 'https://duckduckgo.com/?q=',
    icon: duckLogo,
    placeholder: 'DuckDuckGo (点logo切换搜索引擎)'
  }
}

// 自定义固定时间滚动函数
const smoothScrollTo = (container, targetTop, duration = 600) => {
  const startTop = container.scrollTop
  const distance = targetTop - startTop
  let startTime = null

  const animateScroll = (currentTime) => {
    if (startTime === null) startTime = currentTime
    const timeElapsed = currentTime - startTime
    const progress = Math.min(timeElapsed / duration, 1)

    // 使用缓动函数 (easeInOutCubic)
    const ease = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2

    container.scrollTop = startTop + distance * ease

    if (progress < 1) {
      requestAnimationFrame(animateScroll)
    }
  }

  requestAnimationFrame(animateScroll)
}

// 滚动到指定分类
const scrollToCategory = (categoryId) => {
  const element = document.getElementById(`category-${categoryId}`)
  const container = document.querySelector('.content-area')

  if (element && container) {
    // 点击即时高亮，避免等待 observer 触发产生延迟感
    activeCategoryId.value = categoryId
    // 滚动期间（约 600ms）忽略 observer 的回写，避免高亮跳来跳去
    suppressObserverUntil = Date.now() + 700

    // 检查是否为移动端
    const isMobile = window.innerWidth <= 768

    let targetTop = 0

    if (isMobile) {
      // 移动端：在 content-area 容器内滚动
      const elementOffsetTop = element.offsetTop
      const searchHeaderHeight = 80 // 固定高度，因为搜索框是fixed定位
      targetTop = elementOffsetTop - searchHeaderHeight
    } else {
      // 桌面端：在容器内滚动
      const searchHeader = document.querySelector('.search-header')
      const elementOffsetTop = element.offsetTop
      const searchHeaderHeight = searchHeader ? searchHeader.offsetHeight + 20 : 100
      targetTop = elementOffsetTop - searchHeaderHeight
    }

    // 使用固定时间滚动（600毫秒）
    smoothScrollTo(container, Math.max(0, targetTop), 600)
  }
}

// 初始化滚动联动观察器，监听各分类区块进入视口
const setupCategoryObserver = () => {
  if (categoryObserver) {
    categoryObserver.disconnect()
    categoryObserver = null
  }

  const container = document.querySelector('.content-area')
  const sections = document.querySelectorAll('.category-section')
  if (!container || sections.length === 0) return

  categoryObserver = new IntersectionObserver(
    (entries) => {
      if (Date.now() < suppressObserverUntil) return

      // 找出当前所有可见 section 中，最靠近容器顶部的一个作为激活项
      const visible = entries
        .filter((e) => e.isIntersecting)
        .map((e) => ({ id: e.target.id.replace('category-', ''), top: e.boundingClientRect.top }))

      if (visible.length === 0) return

      visible.sort((a, b) => a.top - b.top)
      activeCategoryId.value = visible[0].id
    },
    {
      root: container,
      // 顶部留出 search-header 的空间，底部偏 60% 让"接近顶部"的 section 更容易胜出
      rootMargin: '-90px 0px -60% 0px',
      threshold: 0,
    }
  )

  sections.forEach((section) => categoryObserver.observe(section))

  // 兜底：初始默认高亮第一个
  if (!activeCategoryId.value && categories.value.length > 0) {
    activeCategoryId.value = categories.value[0].id
  }
}

// categories 由异步接口写入，渲染完成后再绑定 observer
watch(
  categories,
  async () => {
    await nextTick()
    setupCategoryObserver()
  },
  { flush: 'post' }
)

// 检查是否启用锁定功能
const checkLockStatus = () => {
  const openLock = import.meta.env.VITE_OPEN_LOCK
  if (openLock && openLock.trim() !== '') {
    isLocked.value = true
    // 检查是否已经解锁过
    const savedUnlock = localStorage.getItem('nav_unlocked')
    if (savedUnlock === 'true') {
      isUnlocked.value = true
    }
  } else {
    isLocked.value = false
    isUnlocked.value = true // 如果没有启用锁定，默认为解锁状态
  }
}

// 处理解锁（通过服务端验证）
const handleUnlock = async () => {
  unlocking.value = true
  unlockError.value = ''

  try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: unlockPassword.value }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || '访问密钥错误，请重新输入')
    }

    isUnlocked.value = true
    localStorage.setItem('nav_unlocked', 'true')
    unlockPassword.value = ''
  } catch (error) {
    unlockError.value = error.message
  } finally {
    unlocking.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  if (!searchQuery.value.trim()) return

  const engine = searchEngines[selectedEngine.value]
  const url = engine.url + encodeURIComponent(searchQuery.value)
  window.open(url, '_blank')
}

// 处理图片加载错误
const handleImageError = (event) => {
  // 设置默认的 favicon.ico 作为 fallback 图片
  event.target.src = '/favicon.ico'
  event.target.onerror = null // 防止无限循环
}

// 移动端菜单控制
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  // 控制body滚动
  if (showMobileMenu.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
  // 恢复body滚动
  document.body.style.overflow = ''
}

// 移动端分类滚动
const scrollToCategoryMobile = (categoryId) => {
  closeMobileMenu() // 先关闭菜单

  // 稍微延迟一下再滚动，确保菜单关闭动画完成
  setTimeout(() => {
    scrollToCategory(categoryId)
  }, 200)
}

// 组件挂载时获取数据
onMounted(async () => {
  checkLockStatus() // 检查锁定状态
  await fetchCategories()
  // 设置默认搜索引擎
  selectedEngine.value = defaultSearchEngine.value
})

// 组件卸载时清理样式
onUnmounted(() => {
  // 确保卸载时恢复body滚动
  document.body.style.overflow = ''
  // 清理滚动联动观察器
  if (categoryObserver) {
    categoryObserver.disconnect()
    categoryObserver = null
  }
})
</script>

<style scoped>
/* 锁定界面样式 */
.lock-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2c3e50;
  padding: 20px;
  z-index: 9999;
}

.lock-box {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.lock-box h1 {
  color: #2d3748;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 600;
}

.lock-description {
  color: #718096;
  margin-bottom: 30px;
  font-size: 16px;
}

.lock-box .form-group {
  margin-bottom: 20px;
  text-align: left;
}

.lock-box .form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 500;
  font-size: 14px;
}

.lock-box .form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fff;
}

.lock-box .form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.unlock-btn {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.unlock-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.unlock-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.lock-box .error-message {
  margin-top: 15px;
  padding: 12px;
  background: #fed7d7;
  color: #c53030;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #feb2b2;
}

.nav-home {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 左侧边栏样式 —— 现代极简卡片风格 */
.sidebar {
  width: 260px;
  background-color: #ffffff;
  color: #1f2937;
  padding: 0;
  border-right: 1px solid #eef0f3;
  height: 100vh;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.logo-section {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  gap: 12px;
}

.logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  margin-right: 0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.site-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
  letter-spacing: 0.2px;
}

.category-nav {
  padding: 8px 12px 20px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* 自定义 scrollbar，更细更柔和 */
.category-nav::-webkit-scrollbar {
  width: 6px;
}
.category-nav::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.08);
  border-radius: 3px;
}
.category-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 23, 42, 0.18);
}

.nav-title {
  font-size: 11px;
  font-weight: 600;
  margin: 12px 12px 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin: 0 4px;
  border-radius: 10px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
  color: #475569;
}

/* 左侧激活指示条 */
.category-indicator {
  position: absolute;
  left: -4px;
  top: 50%;
  width: 3px;
  height: 0;
  background: #3b82f6;
  border-radius: 0 3px 3px 0;
  transform: translateY(-50%);
  transition: height 0.25s ease;
}

.category-item:hover {
  background-color: #f3f5f9;
  color: #1f2937;
}

.category-item.active {
  background-color: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

.category-item.active .category-indicator {
  height: 60%;
}

.category-item.active .category-icon {
  transform: scale(1.08);
}

.category-icon {
  font-size: 17px;
  margin-right: 12px;
  width: 22px;
  text-align: center;
  transition: transform 0.2s ease;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1px;
}

/* 左侧边栏底部 */
.sidebar-footer {
  padding: 12px 16px 16px;
  border-top: 1px solid #eef0f3;
  flex-shrink: 0;
}

.github-link {
  display: flex;
  align-items: center;
  color: #64748b;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 10px;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;
}

.github-link:hover {
  background: #f3f5f9;
  color: #0f172a;
}

.github-link svg {
  margin-right: 10px;
  transition: transform 0.3s ease;
}

.github-link:hover svg {
  transform: scale(1.1);
}

/* 右侧主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.search-header {
  background: white;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-container {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
  gap: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  flex: 1;
}

@media (max-width: 768px) {
  .search-container {
    margin: 0;
    max-width: none;
  }
}

.search-engine-selector {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  transition: background-color 0.2s ease;
}

.search-engine-selector:hover {
  background: #e9ecef;
}

.engine-logo {
  width: 24px;
  height: 24px;
  margin: 8px;
  object-fit: contain;
  pointer-events: none;
  border-radius: 4px;
}

.engine-select {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  border: none;
  outline: none;
  background: transparent;
}

.search-input {
  flex: 1;
  border: none;
  padding: 12px 16px;
  font-size: 16px;
  outline: none;
  background: white;
}

.search-input::placeholder {
  color: #95a5a6;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: #475569;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.mobile-menu-btn:hover,
.mobile-menu-btn:active {
  background: #f3f5f9;
  color: #0f172a;
}

/* 移动端菜单（抽屉） */
.mobile-menu {
  position: fixed;
  top: 0;
  right: -100%;
  width: 280px;
  max-width: 86vw;
  height: 100vh;
  height: 100svh;
  background: #ffffff;
  box-shadow: -8px 0 32px rgba(15, 23, 42, 0.12);
  border-radius: 16px 0 0 16px;
  z-index: 1001;
  transition: right 0.32s cubic-bezier(0.32, 0.72, 0, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.mobile-menu.active {
  right: 0;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  background: transparent;
  color: #0f172a;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.mobile-logo {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
  flex-shrink: 0;
}

.mobile-menu-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.close-btn {
  background: #f3f5f9;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-btn:hover,
.close-btn:active {
  background: #e5e9f0;
  color: #0f172a;
  transform: rotate(90deg);
}

.mobile-nav-title {
  font-size: 11px;
  font-weight: 600;
  margin: 4px 20px 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.mobile-category-list {
  list-style: none;
  padding: 0 8px;
  margin: 0;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  /* 避免内容被底部 footer 遮挡 */
  padding-bottom: 16px;
  -webkit-overflow-scrolling: touch;
}

.mobile-category-list::-webkit-scrollbar {
  width: 4px;
}
.mobile-category-list::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.08);
  border-radius: 2px;
}

.mobile-category-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 14px;
  margin: 0 4px;
  border-radius: 10px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  color: #475569;
}

.mobile-category-item:hover,
.mobile-category-item:active {
  background: #f3f5f9;
  color: #1f2937;
}

.mobile-category-item.active {
  background: #eff6ff;
  color: #2563eb;
}

.mobile-category-item.active .category-name {
  color: #2563eb;
  font-weight: 600;
}

.mobile-category-item .category-indicator {
  position: absolute;
  left: -4px;
  top: 50%;
  width: 3px;
  height: 0;
  background: #3b82f6;
  border-radius: 0 3px 3px 0;
  transform: translateY(-50%);
  transition: height 0.25s ease;
}

.mobile-category-item.active .category-indicator {
  height: 60%;
}

.mobile-category-item .category-icon {
  font-size: 18px;
  margin-right: 12px;
  width: 22px;
  text-align: center;
  transition: transform 0.2s ease;
}

.mobile-category-item.active .category-icon {
  transform: scale(1.08);
}

.mobile-category-item .category-name {
  font-size: 15px;
  font-weight: 500;
  color: inherit;
}

/* 移动端菜单底部 */
.mobile-menu-footer {
  padding: 12px 16px 18px;
  border-top: 1px solid #eef0f3;
  flex-shrink: 0;
}

.mobile-menu-footer .github-link {
  display: flex;
  align-items: center;
  color: #64748b;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 10px;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;
}

.mobile-menu-footer .github-link:hover,
.mobile-menu-footer .github-link:active {
  background: #f3f5f9;
  color: #0f172a;
}

.mobile-menu-footer .github-link svg {
  margin-right: 10px;
  transition: transform 0.3s ease;
}



/* 移动端菜单遮罩 */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.45);
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.mobile-menu-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* 内容区域样式 */
.content-area {
  flex: 1;
  padding: 30px;
  padding-bottom: 400px;
  overflow-y: auto;
}

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #7f8c8d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ecf0f1;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.categories-container {
  max-width: 1200px;
  margin: 0 auto;
}

.category-section {
  margin-bottom: 50px;
}

.category-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 25px;
  color: #2c3e50;
  display: flex;
  align-items: center;
}

.category-title .category-icon {
  font-size: 32px;
  margin-right: 16px;
}

.category-title .category-name {
  margin-left: 10px;
  font-size: 26px;
}

.sites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.site-card {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
  position: relative;
  overflow: hidden;
}

.site-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.site-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.site-card:hover::before {
  opacity: 1;
}

.site-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  flex-shrink: 0;
  margin-right: 16px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.site-icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.site-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.site-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-family: 'Consolas', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.site-description {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Consolas', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 页面底部 */
.page-footer {
  margin-top: 60px;
  padding: 40px 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border-top: 3px solid #3498db;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  gap: 30px;
}

.footer-info h3 {
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.footer-info p {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.footer-links {
  display: flex;
  gap: 15px;
}

.footer-link {
  display: flex;
  align-items: center;
  color: #3498db;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  background: white;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.footer-link:hover {
  background: #3498db;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.footer-link svg {
  margin-right: 6px;
  transition: transform 0.3s ease;
}

.footer-link:hover svg {
  transform: scale(1.1);
}

.footer-bottom {
  border-top: 1px solid #e9ecef;
  padding-top: 20px;
  text-align: center;
}

.footer-bottom p {
  color: #7f8c8d;
  font-size: 13px;
  margin: 5px 0;
  line-height: 1.4;
}

.footer-bottom a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.footer-bottom a:hover {
  color: #2980b9;
  text-decoration: underline;
}

.footer-tech {
  font-size: 12px !important;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-home {
    flex-direction: column;
    height: 100vh;
    height: 100svh; /* 使用动态视口高度 */
    overflow: hidden;
  }

  .sidebar {
    display: none; /* 在移动端隐藏左侧边栏 */
  }

  .main-content {
    flex: 1;
    height: 100vh;
    height: 100svh; /* 使用动态视口高度，更准确 */
    margin-left: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .search-header {
    padding: 12px 16px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 500;
    background: rgba(255, 255, 255, 0.92);
    -webkit-backdrop-filter: saturate(180%) blur(12px);
    backdrop-filter: saturate(180%) blur(12px);
    box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06);
  }

  .content-area {
    flex: 1;
    padding: 20px 14px;
    padding-top: 88px; /* 为固定的搜索框留出空间 */
    padding-bottom: 300px; /* 增加底部padding确保内容可以完全滚动 */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; /* iOS平滑滚动 */
  }

  .mobile-menu-btn {
    display: flex; /* 在移动端显示菜单按钮 */
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sites-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .site-card {
    padding: 14px 10px;
    flex-direction: column;
    text-align: center;
    border-radius: 14px;
    border: 1px solid #eef0f3;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  }

  .site-card:active {
    transform: scale(0.97);
    background-color: #f8fafc;
  }

  .site-card .site-icon {
    margin-right: 0;
    margin-bottom: 10px;
    width: 44px;
    height: 44px;
    min-width: 44px;
  }

  .site-card .site-icon img {
    width: 28px;
    height: 28px;
  }

  .site-card .site-name {
    font-size: 14px;
    font-weight: 600;
  }

  .site-card .site-description {
    font-size: 12px;
  }

  .category-title {
    font-size: 22px;
    margin-bottom: 18px;
  }

  .category-title .category-icon {
    font-size: 26px;
    margin-right: 10px;
  }

  .category-title .category-name {
    font-size: 20px;
  }

  /* 移动端暗色模式适配 */
  .dark .search-header {
    background: rgba(15, 23, 42, 0.82);
    -webkit-backdrop-filter: saturate(180%) blur(12px);
    backdrop-filter: saturate(180%) blur(12px);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06);
  }

  .dark .site-card {
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .dark .site-card:active {
    background-color: rgba(255, 255, 255, 0.04);
  }

  /* 移动端页面底部 */
  .page-footer {
    margin-top: 40px;
    padding: 30px 20px;
  }

  .footer-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .footer-links {
    justify-content: center;
  }

  .footer-bottom {
    padding-top: 15px;
  }

  .footer-bottom p {
    font-size: 12px;
  }
}

/* 主题切换按钮样式 */
.theme-toggle-btn {
  background: none;
  border: none;
  color: #2c3e50;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

/* 当搜索栏隐藏时，主题切换按钮靠右 */
.search-header:not(:has(.search-container)) .theme-toggle-btn {
  margin-left: auto;
}

.theme-toggle-btn:hover {
  background: #f8f9fa;
  transform: scale(1.1);
}

/* 暗色模式样式 */
.dark .nav-home {
  background-color: #0d1117;
}

.dark .sidebar {
  background-color: #161b22;
  color: #c9d1d9;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: none;
}

.dark .site-title {
  color: #f0f6fc;
}

.dark .logo {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.dark .nav-title {
  color: #6e7681;
}

.dark .category-item {
  color: #8b949e;
}

.dark .category-item:hover {
  background-color: rgba(255, 255, 255, 0.04);
  color: #e6edf3;
}

.dark .category-item.active {
  background-color: rgba(88, 166, 255, 0.12);
  color: #58a6ff;
}

.dark .category-indicator {
  background: #58a6ff;
}

.dark .category-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
}
.dark .category-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.18);
}

.dark .sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.dark .github-link {
  color: #8b949e;
}

.dark .github-link:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #e6edf3;
}

.dark .search-header {
  background: #161b22;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04);
}

.dark .theme-toggle-btn {
  color: #e6edf3;
}

.dark .theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.dark .mobile-menu-btn {
  color: #e6edf3;
}

.dark .mobile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.dark .search-container {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.dark .search-engine-selector {
  background: #21262d;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.dark .search-engine-selector:hover {
  background: #30363d;
}

.dark .search-input {
  background: #21262d;
  color: #e6edf3;
  border: none;
}

.dark .search-input::placeholder {
  color: #8b949e;
}

.dark .engine-select {
  background: #21262d;
  color: #e6edf3;
}

.dark .engine-select option {
  background: #21262d;
  color: #e6edf3;
}

.dark .content-area {
  background: #0d1117;
}

.dark .site-card {
  background: #161b22;
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #e6edf3;
}

.dark .site-card:hover {
  background: #21262d;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.dark .site-card::before {
  background: linear-gradient(135deg, rgba(88, 166, 255, 0.08), rgba(163, 113, 247, 0.08));
}

.dark .site-name {
  color: #e6edf3;
}

.dark .site-description {
  color: #8b949e;
}

.dark .site-icon {
  background: #21262d;
}

.dark .category-title {
  color: #e6edf3;
}

.dark .mobile-menu {
  background: #161b22;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.5);
}

.dark .mobile-menu-btn {
  color: #c9d1d9;
}

.dark .mobile-menu-btn:hover,
.dark .mobile-menu-btn:active {
  background: rgba(255, 255, 255, 0.06);
  color: #f0f6fc;
}

.dark .mobile-menu-header h3 {
  color: #f0f6fc;
}

.dark .mobile-logo {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.dark .close-btn {
  background: rgba(255, 255, 255, 0.06);
  color: #8b949e;
}

.dark .close-btn:hover,
.dark .close-btn:active {
  background: rgba(255, 255, 255, 0.12);
  color: #f0f6fc;
}

.dark .mobile-nav-title {
  color: #6e7681;
}

.dark .mobile-category-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
}

.dark .mobile-category-item {
  color: #8b949e;
}

.dark .mobile-category-item:hover,
.dark .mobile-category-item:active {
  background: rgba(255, 255, 255, 0.04);
  color: #e6edf3;
}

.dark .mobile-category-item.active {
  background: rgba(88, 166, 255, 0.12);
  color: #58a6ff;
}

.dark .mobile-category-item.active .category-name {
  color: #58a6ff;
}

.dark .mobile-category-item .category-indicator {
  background: #58a6ff;
}

.dark .mobile-menu-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.dark .mobile-menu-footer .github-link {
  color: #8b949e;
}

.dark .mobile-menu-footer .github-link:hover,
.dark .mobile-menu-footer .github-link:active {
  background: rgba(255, 255, 255, 0.04);
  color: #e6edf3;
}

.dark .page-footer {
  background: linear-gradient(135deg, #161b22 0%, #21262d 100%);
  border-top: 3px solid #58a6ff;
}

.dark .footer-info h3 {
  color: #e6edf3;
}

.dark .footer-info p {
  color: #8b949e;
}

.dark .footer-link {
  background: #21262d;
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #58a6ff;
}

.dark .footer-link:hover {
  background: #58a6ff;
  color: #0d1117;
  box-shadow: 0 4px 12px rgba(88, 166, 255, 0.3);
}

.dark .footer-bottom p {
  color: #8b949e;
}

.dark .footer-bottom a {
  color: #58a6ff;
}

.dark .footer-bottom a:hover {
  color: #79b8ff;
}

.dark .loading,
.dark .error {
  color: #8b949e;
}

.dark .retry-btn {
  background: #58a6ff;
  color: #0d1117;
}

.dark .retry-btn:hover {
  background: #79b8ff;
}

/* 锁定界面暗色模式 */
.dark .lock-container {
  background: #0d1117;
}

.dark .lock-box {
  background: #161b22;
  color: #e6edf3;
}

.dark .lock-box h1 {
  color: #e6edf3;
}

.dark .lock-description {
  color: #8b949e;
}

.dark .lock-box .form-group label {
  color: #c9d1d9;
}

.dark .lock-box .form-input {
  background: #21262d;
  border: 2px solid rgba(255, 255, 255, 0.08);
  color: #e6edf3;
}

.dark .lock-box .form-input:focus {
  border-color: #58a6ff;
  box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15);
}

.dark .unlock-btn {
  background: linear-gradient(135deg, #58a6ff 0%, #a371f7 100%);
}

.dark .unlock-btn:hover:not(:disabled) {
  box-shadow: 0 10px 30px rgba(88, 166, 255, 0.4);
}
</style>
