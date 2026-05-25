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
        <div v-if="searchEnabled" class="search-container" :class="{ focused: searchFocused }">
          <!-- 自定义搜索引擎下拉选择 -->
          <div class="search-engine-selector" ref="engineSelectorRef">
            <button
              type="button"
              class="engine-trigger"
              :class="{ open: engineMenuOpen }"
              @click="toggleEngineMenu"
              :aria-label="`当前搜索引擎：${searchEngines[selectedEngine].label}`"
              :aria-expanded="engineMenuOpen"
            >
              <img :src="searchEngines[selectedEngine].icon" :alt="selectedEngine" class="engine-logo" />
              <svg class="engine-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <transition name="engine-menu">
              <ul v-if="engineMenuOpen" class="engine-menu" role="listbox">
                <li
                  v-for="(engine, key) in searchEngines"
                  :key="key"
                  class="engine-option"
                  :class="{ active: selectedEngine === key }"
                  role="option"
                  :aria-selected="selectedEngine === key"
                  @click="selectEngine(key)"
                >
                  <img :src="engine.icon" :alt="key" class="engine-option-logo" />
                  <span class="engine-option-name">{{ engine.label }}</span>
                  <svg v-if="selectedEngine === key" class="engine-option-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </li>
              </ul>
            </transition>
          </div>

          <input
            type="text"
            v-model="searchQuery"
            :placeholder="searchEngines[selectedEngine].placeholder"
            class="search-input"
            @keyup.enter="handleSearch"
            @focus="searchFocused = true"
            @blur="searchFocused = false"
          />

          <button
            v-if="searchQuery"
            type="button"
            class="search-clear-btn"
            @click="searchQuery = ''"
            aria-label="清除搜索内容"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <button type="button" class="search-submit-btn" @click="handleSearch" aria-label="搜索">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="20" y1="20" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        <!-- 主题切换按钮 -->
        <button class="theme-toggle-btn" @click="themeStore.toggleTheme" :title="themeStore.isDarkMode ? '切换到日间模式' : '切换到夜间模式'">
          <!-- 桌面端图标（实心） -->
          <svg v-if="!themeStore.isDarkMode" class="theme-icon-desktop" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"/>
          </svg>
          <svg v-else class="theme-icon-desktop" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7ZM4 12C4 16.4183 7.58172 20 12 20C15.0583 20 17.7158 18.2839 19.062 15.7621C18.3945 15.9187 17.7035 16 17 16C12.0294 16 8 11.9706 8 7C8 6.29648 8.08133 5.60547 8.2379 4.938C5.71611 6.28423 4 8.9417 4 12Z"/>
          </svg>

          <!-- 移动端图标（细线 stroke 风格，参考设计稿） -->
          <svg v-if="!themeStore.isDarkMode" class="theme-icon-mobile" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4"></circle>
            <line x1="12" y1="2.5" x2="12" y2="5"></line>
            <line x1="12" y1="19" x2="12" y2="21.5"></line>
            <line x1="2.5" y1="12" x2="5" y2="12"></line>
            <line x1="19" y1="12" x2="21.5" y2="12"></line>
            <line x1="5.2" y1="5.2" x2="6.95" y2="6.95"></line>
            <line x1="17.05" y1="17.05" x2="18.8" y2="18.8"></line>
            <line x1="5.2" y1="18.8" x2="6.95" y2="17.05"></line>
            <line x1="17.05" y1="6.95" x2="18.8" y2="5.2"></line>
          </svg>
          <svg v-else class="theme-icon-mobile" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z"></path>
          </svg>
        </button>

        <!-- 移动端菜单按钮 -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="打开菜单">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7H20"/>
            <path d="M4 12H20"/>
            <path d="M4 17H20"/>
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
const searchFocused = ref(false) // 搜索框聚焦态，用于光晕样式
const engineMenuOpen = ref(false) // 搜索引擎下拉菜单展开状态
const engineSelectorRef = ref(null) // 搜索引擎选择器 DOM 引用（用于外部点击关闭）

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
    label: 'Google',
    placeholder: '使用 Google 搜索'
  },
  baidu: {
    url: 'https://www.baidu.com/s?wd=',
    icon: baiduLogo,
    label: '百度',
    placeholder: '使用 百度 搜索'
  },
  bing: {
    url: 'https://www.bing.com/search?q=',
    icon: bingLogo,
    label: 'Bing',
    placeholder: '使用 Bing 搜索'
  },
  duckduckgo: {
    url: 'https://duckduckgo.com/?q=',
    icon: duckLogo,
    label: 'DuckDuckGo',
    placeholder: '使用 DuckDuckGo 搜索'
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

// 搜索引擎下拉菜单控制
const toggleEngineMenu = () => {
  engineMenuOpen.value = !engineMenuOpen.value
}

const selectEngine = (key) => {
  selectedEngine.value = key
  engineMenuOpen.value = false
}

// 点击下拉菜单外部时关闭
const handleClickOutsideEngine = (event) => {
  if (!engineMenuOpen.value) return
  const el = engineSelectorRef.value
  if (el && !el.contains(event.target)) {
    engineMenuOpen.value = false
  }
}

// ESC 关闭下拉
const handleEngineKeydown = (event) => {
  if (event.key === 'Escape' && engineMenuOpen.value) {
    engineMenuOpen.value = false
  }
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
  // 监听全局点击/键盘事件以关闭搜索引擎下拉
  document.addEventListener('mousedown', handleClickOutsideEngine)
  document.addEventListener('keydown', handleEngineKeydown)
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
  // 解绑全局事件
  document.removeEventListener('mousedown', handleClickOutsideEngine)
  document.removeEventListener('keydown', handleEngineKeydown)
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
  position: relative;
  display: flex;
  align-items: center;
  max-width: 640px;
  margin: 0 auto;
  flex: 1;
  height: 46px;
  padding: 0 6px 0 6px;
  background: #f1f3f7;
  border: 1px solid transparent;
  border-radius: 999px;
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.2s ease;
}

.search-container:hover {
  background: #eceff5;
}

.search-container.focused {
  background: #ffffff;
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow:
    0 0 0 4px rgba(59, 130, 246, 0.12),
    0 6px 18px rgba(15, 23, 42, 0.06);
}

@media (max-width: 768px) {
  .search-container {
    margin: 0;
    max-width: none;
    height: 42px;
  }
}

/* 搜索引擎选择器（自定义下拉） */
.search-engine-selector {
  position: relative;
  flex-shrink: 0;
}

.engine-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 34px;
  padding: 0 8px 0 6px;
  background: transparent;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  color: #475569;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.engine-trigger:hover {
  background: rgba(15, 23, 42, 0.06);
}

.engine-trigger.open {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.engine-logo {
  width: 22px;
  height: 22px;
  object-fit: contain;
  border-radius: 4px;
  pointer-events: none;
}

.engine-caret {
  transition: transform 0.25s ease;
  opacity: 0.7;
}

.engine-trigger.open .engine-caret {
  transform: rotate(180deg);
  opacity: 1;
}

/* 下拉菜单 */
.engine-menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  min-width: 180px;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.12),
    0 2px 6px rgba(15, 23, 42, 0.06);
  z-index: 200;
}

.engine-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
  color: #334155;
  font-size: 14px;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.engine-option:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.engine-option.active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

.engine-option-logo {
  width: 20px;
  height: 20px;
  object-fit: contain;
  border-radius: 4px;
  flex-shrink: 0;
}

.engine-option-name {
  flex: 1;
  letter-spacing: 0.1px;
}

.engine-option-check {
  color: #2563eb;
  flex-shrink: 0;
}

/* 下拉动画 */
.engine-menu-enter-active,
.engine-menu-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
  transform-origin: top left;
}

.engine-menu-enter-from,
.engine-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}

/* 输入框 */
.search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  padding: 0 10px;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  background: transparent;
  color: #0f172a;
}

.search-input::placeholder {
  color: #94a3b8;
}

/* 清除按钮 */
.search-clear-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 4px;
  background: rgba(15, 23, 42, 0.08);
  border: none;
  border-radius: 50%;
  color: #475569;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
}

.search-clear-btn:hover {
  background: rgba(15, 23, 42, 0.16);
  color: #0f172a;
  transform: scale(1.05);
}

/* 搜索提交按钮 */
.search-submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 50%;
  color: #ffffff;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.28);
  transition: transform 0.18s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.search-submit-btn:hover {
  transform: translateY(-1px) scale(1.04);
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.34);
  filter: brightness(1.05);
}

.search-submit-btn:active {
  transform: scale(0.96);
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
}

/* 菜单打开时，X 按钮自旋转入场 */
.mobile-menu.active .close-btn svg {
  animation: closeBtnSpinIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes closeBtnSpinIn {
  0% {
    transform: rotate(-180deg);
    opacity: 0;
  }
  100% {
    transform: rotate(0deg);
    opacity: 1;
  }
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
  /* 白天模式：使用接近背景色的浅色叠加，配合较强模糊，避免大块黑色不协调 */
  background: rgba(148, 163, 184, 0.28);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
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
  /* Firefox 滚动条 */
  scrollbar-width: thin;
  scrollbar-color: rgba(15, 23, 42, 0.18) transparent;
}

/* 主内容区滚动条 —— 与左侧 .category-nav 同一套配色，更柔和细腻 */
.content-area::-webkit-scrollbar {
  width: 8px;
}
.content-area::-webkit-scrollbar-track {
  background: transparent;
}
.content-area::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.12);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}
.content-area::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 23, 42, 0.24);
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
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #1f2937;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.category-title .category-icon {
  font-size: 26px;
  margin-right: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.75) 0%,
    rgba(255, 255, 255, 0.45) 45%,
    rgba(255, 255, 255, 0.6) 100%
  );
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  backdrop-filter: blur(18px) saturate(180%);
  border-radius: 16px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    0 8px 24px -6px rgba(15, 23, 42, 0.12),
    0 2px 8px -2px rgba(15, 23, 42, 0.06),
    inset 0 1px 1px rgba(255, 255, 255, 0.95),
    inset 0 -1px 2px rgba(15, 23, 42, 0.04),
    inset 1px 0 1px rgba(255, 255, 255, 0.45),
    inset -1px 0 1px rgba(255, 255, 255, 0.25);
  position: relative;
  overflow: hidden;
  line-height: 1;
}

.category-title .category-icon::before {
  content: '';
  position: absolute;
  top: 1px;
  left: 1px;
  right: 1px;
  height: 48%;
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.85) 0%,
    rgba(255, 255, 255, 0.2) 60%,
    rgba(255, 255, 255, 0) 100%
  );
  border-radius: 15px 15px 50% 50% / 15px 15px 28% 28%;
  pointer-events: none;
}

.category-title .category-icon::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 12%;
  right: 12%;
  height: 22%;
  background: linear-gradient(0deg,
    rgba(255, 255, 255, 0.35) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  filter: blur(3px);
  border-radius: 50%;
  pointer-events: none;
}

.category-title .category-name {
  margin-left: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: #1f2937;
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
    padding: 10px 12px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 500;
    background: rgba(255, 255, 255, 0.92);
    -webkit-backdrop-filter: saturate(180%) blur(12px);
    backdrop-filter: saturate(180%) blur(12px);
    box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06);
    /* 同级元素间默认间距：按钮之间用 12px，更清晰的视觉分组 */
    gap: 12px;
  }

  /* 搜索栏缩短，不占满整个宽度 */
  .search-container {
    flex: 1 1 auto;
    min-width: 0;
    max-width: none;
    height: 40px;
    padding: 0 6px;
  }

  /* 视觉分组：搜索框与右侧按钮之间留更大间距 */
  .search-container ~ .theme-toggle-btn {
    margin-left: 8px;
  }

  /* 搜索栏关闭时：两个按钮整体靠右上角 */
  .search-header:not(:has(.search-container)) {
    justify-content: flex-end;
    gap: 12px;
  }

  .content-area {
    flex: 1;
    padding: 20px 14px;
    padding-top: 80px;
    padding-bottom: 300px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* 移动端按钮统一样式 - 灰色圆形 + 柔和阴影 */
  .search-header .mobile-menu-btn,
  .search-header .theme-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    padding: 0;
    flex-shrink: 0;
    margin: 0;
    border-radius: 50%;
    border: none;
    outline: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-appearance: none;
    appearance: none;
    color: #2f3a55;
    background: #eef1f6;
    box-shadow:
      0 1px 2px rgba(15, 23, 42, 0.06),
      0 4px 12px rgba(15, 23, 42, 0.08);
    transition:
      transform 0.18s ease,
      box-shadow 0.2s ease,
      background-color 0.2s ease,
      color 0.2s ease;
  }

  .search-header .mobile-menu-btn:focus,
  .search-header .mobile-menu-btn:focus-visible,
  .search-header .theme-toggle-btn:focus,
  .search-header .theme-toggle-btn:focus-visible {
    outline: none;
    box-shadow:
      0 1px 2px rgba(15, 23, 42, 0.06),
      0 4px 12px rgba(15, 23, 42, 0.08);
  }

  .search-header .mobile-menu-btn {
    order: 3;
  }

  .search-header .theme-toggle-btn {
    order: 2;
  }

  .search-header .mobile-menu-btn:hover,
  .search-header .mobile-menu-btn:active,
  .search-header .theme-toggle-btn:hover,
  .search-header .theme-toggle-btn:active {
    background: #e3e8f0;
    color: #1f2937;
    transform: translateY(-1px);
    box-shadow:
      0 2px 4px rgba(15, 23, 42, 0.08),
      0 8px 18px rgba(15, 23, 42, 0.1);
  }

  .search-header .theme-toggle-btn svg,
  .search-header .mobile-menu-btn svg {
    width: 20px;
    height: 20px;
  }

  /* 桌面端图标在移动端隐藏，使用更细更简洁的 mobile 版本 */
  .search-header .theme-toggle-btn .theme-icon-desktop {
    display: none;
  }
  .search-header .theme-toggle-btn .theme-icon-mobile {
    display: block;
  }

  /* 移动端搜索栏微调 */
  .search-input {
    font-size: 14px;
    padding: 0 8px;
  }

  .engine-trigger {
    height: 28px;
    padding: 0 6px 0 4px;
  }

  .engine-logo {
    width: 20px;
    height: 20px;
  }

  .search-submit-btn {
    width: 32px;
    height: 32px;
  }

  .search-clear-btn {
    width: 22px;
    height: 22px;
  }

  .engine-menu {
    min-width: 168px;
    top: calc(100% + 8px);
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
    font-size: 16px;
    margin-bottom: 14px;
    gap: 10px;
    padding: 0;
  }

  .category-title .category-icon {
    font-size: 22px;
    margin-right: 0;
    width: 42px;
    height: 42px;
    border-radius: 13px;
    box-shadow:
      0 6px 18px -5px rgba(15, 23, 42, 0.12),
      0 2px 6px -2px rgba(15, 23, 42, 0.06),
      inset 0 1px 1px rgba(255, 255, 255, 0.95),
      inset 0 -1px 2px rgba(15, 23, 42, 0.04),
      inset 1px 0 1px rgba(255, 255, 255, 0.45),
      inset -1px 0 1px rgba(255, 255, 255, 0.25);
  }

  .category-title .category-icon::before {
    border-radius: 12px 12px 50% 50% / 12px 12px 28% 28%;
  }

  .category-title .category-name {
    font-size: 17px;
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

/* 桌面端默认隐藏移动端专用图标 */
.theme-toggle-btn .theme-icon-mobile {
  display: none;
}
.theme-toggle-btn .theme-icon-desktop {
  display: block;
}

/* 搜索栏隐藏时，主题切换按钮靠右 */
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
  color: #f0f6fc;
}

.dark .search-container {
  background: #1f2630;
  border-color: transparent;
  box-shadow: none;
}

.dark .search-container:hover {
  background: #242d3a;
}

.dark .search-container.focused {
  background: #1a212b;
  border-color: rgba(88, 166, 255, 0.45);
  box-shadow:
    0 0 0 4px rgba(88, 166, 255, 0.15),
    0 6px 18px rgba(0, 0, 0, 0.35);
}

.dark .engine-trigger {
  color: #c9d1d9;
}

.dark .engine-trigger:hover {
  background: rgba(255, 255, 255, 0.06);
}

.dark .engine-trigger.open {
  background: rgba(88, 166, 255, 0.16);
  color: #58a6ff;
}

.dark .search-input {
  background: transparent;
  color: #e6edf3;
  border: none;
}

.dark .search-input::placeholder {
  color: #6e7681;
}

.dark .search-clear-btn {
  background: rgba(255, 255, 255, 0.08);
  color: #c9d1d9;
}

.dark .search-clear-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #f0f6fc;
}

.dark .search-submit-btn {
  background: linear-gradient(135deg, #58a6ff, #388bfd);
  box-shadow: 0 4px 12px rgba(56, 139, 253, 0.35);
}

.dark .search-submit-btn:hover {
  box-shadow: 0 6px 16px rgba(56, 139, 253, 0.45);
}

.dark .engine-menu {
  background: #1a212b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.5),
    0 2px 6px rgba(0, 0, 0, 0.3);
}

.dark .engine-option {
  color: #c9d1d9;
}

.dark .engine-option:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #f0f6fc;
}

.dark .engine-option.active {
  background: rgba(88, 166, 255, 0.14);
  color: #58a6ff;
}

.dark .engine-option-check {
  color: #58a6ff;
}

.dark .content-area {
  background: #0d1117;
  scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
}

.dark .content-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
.dark .content-area::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.22);
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
  background: transparent;
  border: none;
  box-shadow: none;
}

.dark .category-title .category-name {
  color: #f0f6fc;
}

.dark .category-title .category-icon {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.14) 0%,
    rgba(255, 255, 255, 0.06) 45%,
    rgba(255, 255, 255, 0.1) 100%
  );
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow:
    0 8px 24px -6px rgba(0, 0, 0, 0.5),
    0 2px 8px -2px rgba(0, 0, 0, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.22),
    inset 0 -1px 2px rgba(0, 0, 0, 0.25),
    inset 1px 0 1px rgba(255, 255, 255, 0.1),
    inset -1px 0 1px rgba(255, 255, 255, 0.05);
}

.dark .category-title .category-icon::before {
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.22) 0%,
    rgba(255, 255, 255, 0.04) 60%,
    rgba(255, 255, 255, 0) 100%
  );
}

.dark .category-title .category-icon::after {
  background: linear-gradient(0deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0) 100%
  );
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

@media (max-width: 768px) {
  .dark .search-header .mobile-menu-btn,
  .dark .search-header .theme-toggle-btn {
    border: none;
    background: #21272f;
    color: #e6edf3;
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.4),
      0 4px 12px rgba(0, 0, 0, 0.35);
  }

  .dark .search-header .mobile-menu-btn:hover,
  .dark .search-header .mobile-menu-btn:active,
  .dark .search-header .theme-toggle-btn:hover,
  .dark .search-header .theme-toggle-btn:active {
    background: #2a313b;
    color: #f8fbff;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.45),
      0 8px 18px rgba(0, 0, 0, 0.4);
  }
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
