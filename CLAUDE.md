# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

猫猫导航（Mao Nav）是一个基于 Vue 3 的个人导航网站，支持分类管理和自定义收藏夹。项目采用 v2.0 安全架构，将敏感密钥从前端迁移到服务端 Functions。

## 技术栈

- **前端框架**: Vue 3.5+ (Composition API)
- **构建工具**: Vite 5.4+
- **状态管理**: Pinia 3.0+
- **路由**: Vue Router 4.5+
- **拖拽**: vuedraggable 4.1+
- **包管理器**: pnpm（所有前端项目使用 pnpm）

## 常用命令

```bash
# 开发环境（仅前端，不含 Functions）
pnpm dev

# 生产构建
pnpm build

# 预览构建结果
pnpm preview

# 代码检查和修复
pnpm lint

# 本地完整测试（含 Cloudflare Functions）
pnpm build && npx wrangler pages dev dist
```

## 核心架构

### 数据流设计

导航数据存储在 GitHub 仓库的 `src/mock/mock_data.js` 文件中，采用以下架构：

1. **数据源**：GitHub 仓库中的 `src/mock/mock_data.js`
2. **前端读取**：通过 `useGitHubAPI.js` 调用服务端 API 获取文件内容
3. **管理后台**：`/admin` 路由，支持可视化编辑分类和网站
4. **数据同步**：编辑后通过 GitHub API 更新仓库文件，触发部署平台自动重新部署

### 安全架构（v2.0）

敏感密钥存储在服务端，前端代码不包含任何敏感信息：

- **服务端密钥**：`ADMIN_PASSWORD`、`GITHUB_TOKEN`（部署平台 Encrypted 变量）
- **前端配置**：`VITE_GITHUB_OWNER`、`VITE_GITHUB_REPO`、`VITE_GITHUB_BRANCH`
- **认证流程**：
  1. 前端发送密码到 `/api/verify`（服务端 Function）
  2. 服务端验证 `ADMIN_PASSWORD`，生成 SHA-256 token 返回
  3. 前端存储 token 在 localStorage，后续请求携带 Authorization header

### 双平台部署支持

项目同时支持 Cloudflare Pages 和 Vercel 部署：

- **Cloudflare Pages Functions**: `functions/api/*.js`
- **Vercel Serverless Functions**: `api/*.js`
- **API 代理**：两个平台的函数实现相同的 API 接口（`/api/github`、`/api/verify`）

## 目录结构说明

```
src/
├── apis/           # API 接口层
│   ├── useGitHubAPI.js    # GitHub API 封装（通过服务端代理）
│   └── useNavigation.js   # 导航数据管理
├── components/     # Vue 组件
│   ├── admin/             # 管理后台组件（CategoryManager、SiteManager、SystemSettings）
│   └── icons/             # 图标组件
├── mock/           # 数据层
│   └── mock_data.js       # 导航数据（单数据源）
├── router/         # 路由配置
├── stores/         # Pinia 状态管理（counter.js 包含 counter 和 theme 两个 store）
└── views/          # 页面组件（HomeView、AdminView、NavHomeView）

functions/api/      # Cloudflare Pages Functions
api/                # Vercel Serverless Functions
```

## 重要开发约定

### 1. 数据修改规范

- **推荐方式**：直接编辑 `src/mock/mock_data.js` 文件
- **管理后台**：通过 `/admin` 路径的可视化界面编辑
- **数据格式**：JSON 格式，包含 `categories` 数组、`title`、`search` 配置

### 2. 组件开发规范

- 使用 Vue 3 Composition API
- 拖拽功能使用 `vuedraggable` 组件
- 管理后台组件位于 `src/components/admin/`

### 3. 状态管理

- **主题管理**：`useThemeStore`（支持深色模式，状态持久化到 localStorage）
- **计数器**：`useCounterStore`（示例 store）

### 4. API 调用规范

所有 GitHub API 调用必须通过服务端代理：

```javascript
// 正确：使用 useGitHubAPI
import { useGitHubAPI } from '@/apis/useGitHubAPI'
const { loadCategoriesFromGitHub } = useGitHubAPI()

// 错误：直接调用 GitHub API（会暴露 token）
```

### 5. 环境变量规范

- **服务端**：不加 `VITE_` 前缀（`ADMIN_PASSWORD`、`GITHUB_TOKEN`）
- **前端**：加 `VITE_` 前缀（`VITE_GITHUB_OWNER` 等）
- **开发环境**：`.env` 文件（前端）、`.dev.vars` 文件（wrangler 服务端）

## Git 操作规范

根据全局配置，禁止执行以下 Git 操作：
- 禁止：`git commit`、`git push`、`git pull`、`git merge`、`git rebase`、`git reset`
- 允许：`git log`、`git status`、`git diff`、`git branch`、`git show`

## 常见问题

**Q: 如何添加新的导航分类？**
A: 编辑 `src/mock/mock_data.js`，在 `categories` 数组中添加新对象，包含 `id`、`name`、`icon`、`order`、`sites` 字段。

**Q: 如何自定义搜索引擎？**
A: 修改 `src/mock/mock_data.js` 中的 `search` 字段，支持 `google`、`bing`、`baidu`、`duck`。

**Q: 管理后台无法登录？**
A: 检查部署平台的环境变量 `ADMIN_PASSWORD` 是否正确配置，且设置为 Encrypted 类型。
