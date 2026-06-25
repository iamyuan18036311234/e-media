# Electron 应用自动更新功能完整实现指南

> 本文档以 `e-media` 项目为例，手把手教你从零开始实现 Electron 应用的自动更新功能。
> 技术栈：Electron + Vue 3 + TypeScript + electron-vite + electron-updater
> 适合人群：初次接触 Electron 自动更新的开发者

---

## 目录

1. [功能概述与原理](#1-功能概述与原理)
2. [准备工作](#2-准备工作)
3. [安装依赖](#3-安装依赖)
4. [配置 electron-builder.yml](#4-配置-electron-builderyml)
5. [配置 package.json](#5-配置-packagejson)
6. [创建主进程更新模块](#6-创建主进程更新模块)
7. [配置 preload 桥接层](#7-配置-preload-桥接层)
8. [创建渲染进程 UI 组件](#8-创建渲染进程-ui-组件)
9. [在主进程初始化更新模块](#9-在主进程初始化更新模块)
10. [配置 GitHub Token](#10-配置-github-token)
11. [打包并发布到 GitHub Release](#11-打包并发布到-github-release)
12. [修复 Release（重要）](#12-修复-release重要)
13. [测试更新流程](#13-测试更新流程)
14. [常见问题与解决方案](#14-常见问题与解决方案)

---

## 1. 功能概述与原理

### 1.1 我们要实现什么

- 应用启动后自动检查 GitHub 上的最新版本
- 发现新版本时弹出更新面板，显示版本号和更新日志
- 用户点击"下载更新"后，**只下载变化的部分**（增量更新）
- 下载完成后，用户点击"退出并安装"，应用自动重启并完成更新

### 1.2 增量更新原理

```
传统全量更新：下载完整的 setup.exe（几十 MB）
增量更新：    通过 blockmap 文件对比，只下载变化的几个数据块（几 MB）
```

`electron-updater` 会自动处理 blockmap 对比，我们只需要正确配置即可。

### 1.3 核心技术栈

| 技术 | 作用 |
|------|------|
| `electron-updater` | 自动更新核心库，支持增量下载 |
| `electron-builder` | 打包工具，自动生成 blockmap 文件 |
| `electron-log` | 日志记录，方便调试 |
| GitHub Releases | 存放安装包和更新信息 |
| `latest.yml` | 版本元数据文件，electron-updater 通过它判断是否有新版本 |

---

## 2. 准备工作

### 2.1 注册 GitHub 账号并创建仓库

1. 访问 https://github.com 注册账号
2. 点击右上角 `+` → `New repository`
3. 仓库名填你的项目名（例如 `e-media`）
4. 选择 **Public**（公开，否则更新检查会失败）
5. 勾选 `Add a README file`
6. 点击 `Create repository`

### 2.2 配置 SSH 密钥（推荐，避免每次输密码）

打开 PowerShell（Windows），执行：

```powershell
# 1. 生成 SSH 密钥（一路回车即可）
ssh-keygen -t ed25519 -C "你的邮箱@example.com"

# 2. 启动 ssh-agent
Get-Service ssh-agent | Set-Service -StartupType Manual
Start-Service ssh-agent
ssh-add $env:USERPROFILE\.ssh\id_ed25519

# 3. 查看公钥内容（复制输出）
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

将复制的公钥添加到 GitHub：
- 访问 https://github.com/settings/keys
- 点击 `New SSH key`
- Title 随便填（如 `我的电脑`）
- Key 粘贴刚才复制的公钥
- 点击 `Add SSH key`

### 2.3 配置多账户 SSH（可选，如果你同时用 Gitee 和 GitHub）

创建文件 `C:\Users\你的用户名\.ssh\config`，内容：

```
# GitHub 账号
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519

# Gitee 账号（如果有）
Host gitee.com
    HostName gitee.com
    User git
    IdentityFile ~/.ssh/id_ed25519_gitee
```

### 2.4 创建 GitHub Personal Access Token

发布到 GitHub Release 需要 Token：

1. 访问 https://github.com/settings/tokens?type=beta
2. 点击 `Generate new token`
3. Token name 填 `e-media-publish`
4. Expiration 选择 `No expiration`（或按需）
5. **Repository access** 选择 `Only select repositories` → 选你的 `e-media` 仓库
6. **Permissions** → `Repository permissions`：
   - `Contents` → `Read and write` ✅（必须）
   - `Releases` → `Read and write` ✅（必须）
7. 点击 `Generate token`
8. **立即复制 Token**（形如 `github_pat_xxxx...`），关闭页面后看不到了

> ⚠️ Token 很重要，后面打包发布时要用。请妥善保管，不要提交到代码仓库。

### 2.5 将本地项目关联到 GitHub 仓库

在项目根目录打开 PowerShell：

```powershell
# 初始化 git（如果还没有）
git init

# 关联远程仓库（用 SSH 方式）
git remote add origin git@github.com:你的用户名/e-media.git

# 推送代码
git add .
git commit -m "初始化项目"
git branch -M main
git push -u origin main
```

如果推送时报错 `Connection was reset`，检查 SSH 配置是否正确。

---

## 3. 安装依赖

在项目根目录打开 PowerShell，执行：

```powershell
# 安装更新相关依赖
npm install electron-updater electron-log

# 确认 electron-builder 已安装（通常脚手架已自带）
npm install -D electron-builder
```

> 💡 如果 `npm install` 很慢，使用国内镜像：
> ```powershell
> npm config set registry https://registry.npmmirror.com
> ```

---

## 4. 配置 electron-builder.yml

在项目根目录创建/编辑 `electron-builder.yml`：

```yaml
appId: com.e-media.app
productName: e-media
directories:
  buildResources: build
files:
  - '!**/.vscode/*'
  - '!src/*'
  - '!electron.vite.config.{js,ts,mjs,cjs}'
  - '!{.eslintcache,eslint.config.mjs,.prettierignore,.prettierrc.yaml,dev-app-update.yml,CHANGELOG.md,README.md}'
  - '!{.env,.env.*,.npmrc,pnpm-lock.yaml}'
  - '!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}'
asarUnpack:
  - resources/**
win:
  executableName: e-media
nsis:
  artifactName: ${name}-${version}-setup.${ext}
  shortcutName: ${productName}
  uninstallDisplayName: ${productName}
  createDesktopShortcut: always

# ⭐ 关键：配置 GitHub 发布
publish:
  provider: github
  owner: 你的GitHub用户名
  repo: e-media

# 国内镜像加速下载 electron 二进制
electronDownload:
  mirror: https://npmmirror.com/mirrors/electron/
```

**关键配置说明：**

| 配置项 | 说明 |
|--------|------|
| `publish.provider: github` | 使用 GitHub Release 作为更新源 |
| `publish.owner` | 你的 GitHub 用户名 |
| `publish.repo` | 仓库名 |
| `nsis.artifactName` | 安装包命名格式，**必须包含 `${version}`**，否则增量更新会失败 |
| `asarUnpack` | 解包资源，确保更新时能正确替换文件 |

---

## 5. 配置 package.json

### 5.1 基本配置

```json
{
  "name": "e-media",
  "version": "1.0.0",
  "description": "An Electron application with Vue and TypeScript",
  "main": "./out/main/index.js",
  "author": "example.com",
  "homepage": "https://github.com/你的用户名/e-media",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/你的用户名/e-media.git"
  }
}
```

### 5.2 添加发布脚本

在 `scripts` 中添加：

```json
{
  "scripts": {
    "build:win": "npm run build && electron-builder --win",
    "publish:win": "npm run build && electron-builder --win --publish always",
    "publish:mac": "npm run build && electron-builder --mac --publish always",
    "publish:linux": "npm run build && electron-builder --linux --publish always"
  }
}
```

### 5.3 添加依赖

```json
{
  "dependencies": {
    "@electron-toolkit/preload": "^3.0.2",
    "@electron-toolkit/utils": "^4.0.0",
    "electron-log": "^5.4.4",
    "electron-updater": "^6.3.9"
  }
}
```

> ⚠️ **版本号规则**：每次发布新版本前，必须修改 `version` 字段（如 `1.0.0` → `1.0.1`），否则发布会失败。

---

## 6. 创建主进程更新模块

### 6.1 创建文件结构

```
src/main/updater/
├── index.ts                  # 模块入口
└── incremental-updater.ts    # 增量更新核心实现
```

### 6.2 创建 `src/main/updater/incremental-updater.ts`

这是自动更新的核心文件，负责：
- 检查 GitHub 上的最新版本
- 下载增量更新包
- 安装更新

```typescript
/**
 * 增量更新模块
 * 基于 electron-updater 实现，通过 blockmap 只下载变化的数据块
 */

import { autoUpdater, UpdateInfo } from 'electron-updater'
import { BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log'

/** 增量更新 IPC 通道 */
export const IncrementalUpdaterChannels = {
  CHECK: 'incremental-updater:check',
  DOWNLOAD: 'incremental-updater:download',
  INSTALL: 'incremental-updater:install',
  PROGRESS: 'incremental-updater:progress',
  UPDATE_AVAILABLE: 'incremental-updater:update-available',
  UPDATE_NOT_AVAILABLE: 'incremental-updater:update-not-available',
  DOWNLOADED: 'incremental-updater:downloaded',
  ERROR: 'incremental-updater:error'
} as const

let mainWindowRef: BrowserWindow | null = null
let updateInfoCache: UpdateInfo | null = null

/**
 * 初始化增量更新模块
 */
export function initIncrementalUpdater(mainWindow: BrowserWindow): void {
  mainWindowRef = mainWindow

  // 配置 autoUpdater
  autoUpdater.autoDownload = false // 手动触发下载
  autoUpdater.autoInstallOnAppQuit = false // 手动触发安装
  autoUpdater.logger = log

  // 监听事件，转发到渲染进程
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    log.info('增量更新：发现新版本', info.version)
    updateInfoCache = info
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.webContents.send(IncrementalUpdaterChannels.UPDATE_AVAILABLE, {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes
      })
    }
  })

  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    log.info('增量更新：当前已是最新版本', info.version)
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.webContents.send(IncrementalUpdaterChannels.UPDATE_NOT_AVAILABLE, {
        version: info.version
      })
    }
  })

  autoUpdater.on('download-progress', (progress) => {
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.webContents.send(IncrementalUpdaterChannels.PROGRESS, {
        percent: Math.floor(progress.percent),
        transferred: progress.transferred,
        total: progress.total
      })
    }
  })

  autoUpdater.on('update-downloaded', () => {
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.webContents.send(IncrementalUpdaterChannels.DOWNLOADED, {})
    }
  })

  autoUpdater.on('error', (err: Error) => {
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.webContents.send(IncrementalUpdaterChannels.ERROR, {
        message: err.message
      })
    }
  })

  // IPC: 检查更新
  ipcMain.handle(IncrementalUpdaterChannels.CHECK, async (): Promise<boolean> => {
    try {
      log.info('增量更新：开始检查更新...')
      const result = await autoUpdater.checkForUpdates()
      log.info('增量更新：检查完成', result?.updateInfo ? '有更新' : '无更新')
      return true
    } catch (err) {
      log.error('增量更新检查失败:', err)
      if (mainWindowRef && !mainWindowRef.isDestroyed()) {
        mainWindowRef.webContents.send(IncrementalUpdaterChannels.ERROR, {
          message: '检查更新失败: ' + (err instanceof Error ? err.message : String(err))
        })
      }
      return false
    }
  })

  // IPC: 下载更新
  ipcMain.handle(IncrementalUpdaterChannels.DOWNLOAD, async (): Promise<boolean> => {
    try {
      if (!updateInfoCache) {
        log.error('增量更新：没有可用的更新信息，请先检查更新')
        if (mainWindowRef && !mainWindowRef.isDestroyed()) {
          mainWindowRef.webContents.send(IncrementalUpdaterChannels.ERROR, {
            message: '没有可用的更新信息，请先点击"检查更新"'
          })
        }
        return false
      }
      log.info('增量更新：开始下载更新', updateInfoCache.version)
      await autoUpdater.downloadUpdate()
      return true
    } catch (err) {
      log.error('增量更新下载失败:', err)
      if (mainWindowRef && !mainWindowRef.isDestroyed()) {
        mainWindowRef.webContents.send(IncrementalUpdaterChannels.ERROR, {
          message: '下载更新失败: ' + (err instanceof Error ? err.message : String(err))
        })
      }
      return false
    }
  })

  // IPC: 安装更新（退出应用并安装）
  ipcMain.handle(IncrementalUpdaterChannels.INSTALL, async (): Promise<boolean> => {
    try {
      // isSilent: 静默安装；isForceRunAfter: 安装后重启应用
      autoUpdater.quitAndInstall(false, true)
      return true
    } catch (err) {
      log.error('增量更新安装失败:', err)
      return false
    }
  })
}

/**
 * 获取缓存的更新信息
 */
export function getCachedUpdateInfo(): UpdateInfo | null {
  return updateInfoCache
}
```

### 6.3 创建 `src/main/updater/index.ts`

```typescript
/**
 * 更新模块入口
 *
 * 只保留基于 electron-updater 的增量更新。
 */

export { initIncrementalUpdater, getCachedUpdateInfo } from './incremental-updater'
```

---

## 7. 配置 preload 桥接层

preload 是主进程和渲染进程之间的桥梁，负责暴露安全的 API。

### 7.1 编辑 `src/preload/index.ts`

```typescript
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 更新模块 API（基于 electron-updater，支持 blockmap 增量更新）
const updater = {
  /** 检查更新 */
  checkForUpdate: (): Promise<boolean> =>
    ipcRenderer.invoke('incremental-updater:check'),

  /** 下载更新 */
  downloadUpdate: (): Promise<boolean> =>
    ipcRenderer.invoke('incremental-updater:download'),

  /** 安装更新（退出应用并安装） */
  installUpdate: (): Promise<boolean> =>
    ipcRenderer.invoke('incremental-updater:install'),

  /** 监听发现新版本 */
  onUpdateAvailable: (
    callback: (info: { version: string; releaseDate: string; releaseNotes: string }) => void
  ): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: unknown): void =>
      callback(data as { version: string; releaseDate: string; releaseNotes: string })
    ipcRenderer.on('incremental-updater:update-available', handler)
    return () => ipcRenderer.removeListener('incremental-updater:update-available', handler)
  },

  /** 监听无可用更新 */
  onUpdateNotAvailable: (callback: (info: { version: string }) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: unknown): void =>
      callback(data as { version: string })
    ipcRenderer.on('incremental-updater:update-not-available', handler)
    return () => ipcRenderer.removeListener('incremental-updater:update-not-available', handler)
  },

  /** 监听下载进度 */
  onProgress: (callback: (percent: number) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: { percent: number }): void =>
      callback(data.percent)
    ipcRenderer.on('incremental-updater:progress', handler)
    return () => ipcRenderer.removeListener('incremental-updater:progress', handler)
  },

  /** 监听下载完成 */
  onDownloaded: (callback: () => void): (() => void) => {
    const handler = (): void => callback()
    ipcRenderer.on('incremental-updater:downloaded', handler)
    return () => ipcRenderer.removeListener('incremental-updater:downloaded', handler)
  },

  /** 监听错误 */
  onError: (callback: (message: string) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: { message: string }): void =>
      callback(data.message)
    ipcRenderer.on('incremental-updater:error', handler)
    return () => ipcRenderer.removeListener('incremental-updater:error', handler)
  }
}

// Custom APIs for renderer
const api = {
  updater,
  /** 获取当前应用版本号 */
  getVersion: (): Promise<string> => ipcRenderer.invoke('app:get-version')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
```

### 7.2 编辑 `src/preload/index.d.ts`

```typescript
import { ElectronAPI } from '@electron-toolkit/preload'

/** 更新信息 */
interface UpdateInfo {
  version: string
  releaseDate: string
  releaseNotes: string
}

/** 更新 API（基于 electron-updater，支持 blockmap 增量更新） */
interface UpdaterAPI {
  checkForUpdate: () => Promise<boolean>
  downloadUpdate: () => Promise<boolean>
  installUpdate: () => Promise<boolean>
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void
  onUpdateNotAvailable: (callback: (info: { version: string }) => void) => () => void
  onProgress: (callback: (percent: number) => void) => () => void
  onDownloaded: (callback: () => void) => () => void
  onError: (callback: (message: string) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      updater: UpdaterAPI
      getVersion: () => Promise<string>
    }
  }
}
```

---

## 8. 创建渲染进程 UI 组件

### 8.1 创建 `src/renderer/src/components/Updater.vue`

这是用户看到的更新界面，包含：
- 当前版本号显示
- "检查更新"按钮
- 更新面板（版本号、下载进度、安装按钮）

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const { updater, getVersion } = window.api

// 当前版本号
const currentVersion = ref('')

// 状态
const checking = ref(false)
const error = ref('')
const showPanel = ref(false)

// 更新状态
const updateAvailable = ref(false)
const updateInfo = ref<{ version: string; releaseDate: string; releaseNotes: string } | null>(null)
const downloading = ref(false)
const progress = ref(0)
const downloaded = ref(false)

// 清理函数
let cleanupAvailable: (() => void) | null = null
let cleanupNotAvailable: (() => void) | null = null
let cleanupProgress: (() => void) | null = null
let cleanupDownloaded: (() => void) | null = null
let cleanupError: (() => void) | null = null

/** 检查更新 */
async function handleCheck(): Promise<void> {
  checking.value = true
  error.value = ''
  const ok = await updater.checkForUpdate()
  if (!ok) {
    error.value = '检查更新失败，请查看日志'
  }
  setTimeout(() => (checking.value = false), 2000)
}

/** 下载更新 */
async function handleDownload(): Promise<void> {
  downloading.value = true
  progress.value = 0
  error.value = ''
  const ok = await updater.downloadUpdate()
  if (!ok) {
    downloading.value = false
  }
}

/** 退出并安装 */
async function handleInstall(): Promise<void> {
  await updater.installUpdate()
}

/** 关闭面板 */
function handleClose(): void {
  showPanel.value = false
}

onMounted(async () => {
  // 获取当前版本号
  currentVersion.value = await getVersion()

  // 事件监听
  cleanupAvailable = updater.onUpdateAvailable((info) => {
    updateAvailable.value = true
    updateInfo.value = info
    showPanel.value = true
  })
  cleanupNotAvailable = updater.onUpdateNotAvailable(() => {
    error.value = '当前已是最新版本'
    setTimeout(() => (error.value = ''), 3000)
  })
  cleanupProgress = updater.onProgress((percent: number) => {
    progress.value = percent
  })
  cleanupDownloaded = updater.onDownloaded(() => {
    downloading.value = false
    progress.value = 100
    downloaded.value = true
  })
  cleanupError = updater.onError((message: string) => {
    downloading.value = false
    error.value = message
  })

  // 启动时自动检查更新（延迟 3 秒）
  setTimeout(() => handleCheck(), 3000)
})

onUnmounted(() => {
  cleanupAvailable?.()
  cleanupNotAvailable?.()
  cleanupProgress?.()
  cleanupDownloaded?.()
  cleanupError?.()
})
</script>

<template>
  <div class="updater-container">
    <!-- 当前版本号 + 检查更新按钮 -->
    <div class="updater-buttons">
      <span class="updater-version">v{{ currentVersion }}</span>
      <button class="updater-check-btn" :disabled="checking" @click="handleCheck">
        {{ checking ? '检查中...' : '检查更新' }}
      </button>
    </div>

    <!-- 错误提示 -->
    <p v-if="error && !showPanel" class="updater-error">{{ error }}</p>

    <!-- 更新面板 -->
    <div v-if="showPanel" class="updater-panel">
      <div class="updater-panel-header">
        <span class="updater-title">
          发现新版本
          <strong v-if="updateInfo">{{ updateInfo.version }}</strong>
        </span>
        <button class="updater-close" @click="handleClose">✕</button>
      </div>

      <div class="updater-panel-body">
        <!-- 下载中 -->
        <div v-if="downloading" class="updater-downloading">
          <div class="updater-progress-bar">
            <div class="updater-progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <span class="updater-progress-text">{{ progress }}%</span>
        </div>

        <!-- 下载完成 -->
        <div v-else-if="downloaded" class="updater-downloaded">
          <p>更新下载完成！</p>
          <button class="updater-install-btn" @click="handleInstall">退出并安装</button>
        </div>

        <!-- 下载前 -->
        <div v-else>
          <button class="updater-download-btn" @click="handleDownload">下载更新</button>
        </div>

        <div v-if="updateInfo?.releaseNotes" class="updater-changelog">
          <div class="updater-changelog-title">更新日志：</div>
          <div class="updater-changelog-body">{{ updateInfo.releaseNotes }}</div>
        </div>

        <p v-if="error" class="updater-error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.updater-container {
  display: inline-block;
}

.updater-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.updater-version {
  font-size: 13px;
  color: #999;
  padding: 2px 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.updater-check-btn {
  padding: 6px 16px;
  font-size: 13px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.updater-check-btn:hover:not(:disabled) {
  border-color: #42b883;
  color: #42b883;
}

.updater-check-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.updater-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
}

.updater-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #42b883;
  color: #fff;
}

.updater-title {
  font-size: 14px;
}

.updater-title strong {
  margin-left: 6px;
}

.updater-close {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  line-height: 1;
}

.updater-panel-body {
  padding: 16px;
}

.updater-downloading {
  text-align: center;
}

.updater-progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.updater-progress-fill {
  height: 100%;
  background: #42b883;
  transition: width 0.3s;
}

.updater-progress-text {
  font-size: 13px;
  color: #666;
}

.updater-downloaded {
  text-align: center;
}

.updater-downloaded p {
  margin: 0 0 12px;
  color: #42b883;
  font-weight: 500;
}

.updater-install-btn {
  padding: 8px 24px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  background: #42b883;
  color: #fff;
  cursor: pointer;
}

.updater-install-btn:hover {
  background: #3aa776;
}

.updater-download-btn {
  padding: 6px 20px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  background: #42b883;
  color: #fff;
  cursor: pointer;
}

.updater-download-btn:hover {
  background: #3aa776;
}

.updater-changelog {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.updater-changelog-title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 6px;
}

.updater-changelog-body {
  font-size: 13px;
  color: #666;
  white-space: pre-wrap;
  max-height: 150px;
  overflow-y: auto;
  line-height: 1.5;
}

.updater-error {
  color: #e53935;
  font-size: 13px;
  margin: 8px 0 0;
}
</style>
```

### 8.2 在 App.vue 中使用 Updater 组件

编辑 `src/renderer/src/App.vue`，在合适的位置引入：

```vue
<script setup lang="ts">
import Updater from './components/Updater.vue'
</script>

<template>
  <!-- 其他内容 -->
  <Updater />
  <!-- 其他内容 -->
</template>
```

---

## 9. 在主进程初始化更新模块

### 9.1 编辑 `src/main/index.ts`

```typescript
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initIncrementalUpdater } from './updater'  // ⭐ 引入更新模块

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // ... 其他配置

  return mainWindow  // ⭐ 返回窗口实例
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.e-media.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // ⭐ 添加获取版本号的 IPC handler
  ipcMain.handle('app:get-version', () => app.getVersion())

  const mainWindow = createWindow()

  // ⭐ 初始化更新模块
  initIncrementalUpdater(mainWindow)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

**关键点：**
1. `createWindow()` 必须返回 `BrowserWindow` 实例
2. 必须添加 `app:get-version` 的 IPC handler
3. 在 `app.whenReady()` 中初始化更新模块

---

## 10. 配置 GitHub Token

### 10.1 创建 .env 文件

在项目根目录创建 `.env` 文件（已被 .gitignore 忽略，不会提交到 Git）：

```env
# GitHub Personal Access Token（发布到 Release 必需）
# 获取地址：https://github.com/settings/tokens?type=beta
# 权限要求：Contents (Read and write)、Releases (Read and write)
GH_TOKEN=github_pat_你的Token

# GitHub 仓库信息
GH_OWNER=你的GitHub用户名
GH_REPO=e-media
```

> ⚠️ **安全提示**：
> - `.env` 文件已被 `.gitignore` 忽略，不会提交到代码仓库
> - 不要把 Token 写在代码里
> - 项目根目录有 `.env.example` 模板文件，可以复制后修改

### 10.2 验证 .gitignore 配置

确保 `.gitignore` 包含以下内容：

```gitignore
# 环境变量（包含敏感 Token，不要提交）
.env
.env.*
!.env.example

# 临时脚本
fix-releases.mjs
publish.mjs
```

### 10.3 使用打包发布脚本

配置好 `.env` 后，直接运行脚本即可自动完成打包发布：

```powershell
# 方式一：发布当前 package.json 中的版本
node publish.mjs

# 方式二：发布指定版本（会自动修改 package.json）
node publish.mjs 1.0.6
```

脚本会自动完成以下步骤：
1. 读取 `.env` 中的 Token 和仓库信息
2. 检查 GitHub 上是否已存在该版本（避免重复发布）
3. 执行 `npm run publish:win` 打包并上传
4. 自动调用 `fix-releases.cjs` 修复 Release

### 10.4 手动发布（替代方案）

如果不想用脚本，也可以手动执行：

```powershell
# 临时设置环境变量
$env:GH_TOKEN='你的Token'

# 打包发布
npm run publish:win
```

---

## 11. 打包并发布到 GitHub Release

### 11.1 修改版本号

每次发布前，必须修改 `package.json` 中的 `version`：

```json
{
  "version": "1.0.1"  // 从 1.0.0 改为 1.0.1
}
```

> 💡 使用 `publish.cjs` 脚本时，可以直接指定版本号，脚本会自动修改。

### 11.2 执行打包发布（推荐使用脚本）

```powershell
# 方式一：先修改 package.json，再运行脚本
node publish.mjs

# 方式二：直接指定版本号（脚本自动修改 package.json）
node publish.mjs 1.0.1
```

脚本会自动完成：
1. 读取 `.env` 中的 Token
2. 检查版本是否已发布
3. 打包并上传到 GitHub
4. 自动修复 Release（删除重复、上传 blockmap、发布草稿）

### 11.3 打包过程说明

打包过程会依次执行：
1. `npm run typecheck` - 类型检查
2. `electron-vite build` - 编译代码
3. `electron-builder --win --publish always` - 打包并上传

打包完成后，`dist/` 目录会生成：
- `e-media-1.0.1-setup.exe` - 安装包
- `e-media-1.0.1-setup.exe.blockmap` - 增量更新映射文件
- `latest.yml` - 版本元数据

同时，GitHub 仓库会自动创建一个 Release（标签为 `v1.0.1`），包含上述文件。

### 11.4 验证发布

访问 `https://github.com/你的用户名/e-media/releases`，应该能看到新创建的 Release。

---

## 12. 修复 Release（重要）

> ⚠️ **这是最关键的一步！** electron-builder 有时会创建重复的 Release，或者 Release 处于草稿状态，导致更新检查失败。

### 12.1 常见问题

1. **Release 处于草稿状态**（Draft）：electron-updater 无法访问，更新检查会失败
2. **重复的 Release**：同一个版本有两个 Release，文件分散
3. **缺少 blockmap 文件**：增量更新无法工作

### 12.2 使用修复脚本

项目已内置 `fix-releases.cjs` 脚本，会自动从 `.env` 读取配置：

```powershell
# 修复所有版本
node fix-releases.mjs

# 只修复指定版本
node fix-releases.mjs v1.0.5
```

脚本会自动完成：
1. 获取所有 Release，按版本分组
2. 删除重复的 Release（只保留有 exe + latest.yml 的那个）
3. 上传缺失的 blockmap 文件
4. 将草稿状态的 Release 发布（draft: false）

### 12.3 正常输出示例

```
========================================
  Release 修复工具
========================================
仓库: iamyuan18036311234/e-media

[步骤 1/3] 获取所有 Release...
[OK] 共找到 6 个 Release

[步骤 2/3] 处理每个版本...

--- v1.0.5 ---
  发现 1 个重复 Release，正在删除...
    删除 Release #344035039 (v1.0.5) OK
  blockmap 已存在
  Release 已发布（非草稿）
  最终文件:
    - e-media-1.0.5-setup.exe (85.32 MB)
    - e-media-1.0.5-setup.exe.blockmap (0.05 MB)
    - latest.yml (0.00 MB)

[步骤 3/3] 修复完成！

========================================
  所有 Release 已修复！
========================================
```

### 12.4 验证修复结果

访问 `https://github.com/你的用户名/e-media/releases`，确认：
- 每个版本只有一个 Release
- Release 不是草稿状态（没有 "Draft" 标签）
- 每个 Release 包含 3 个文件：
  - `e-media-x.x.x-setup.exe`
  - `e-media-x.x.x-setup.exe.blockmap`
  - `latest.yml`

> 💡 `publish.cjs` 脚本会自动调用 `fix-releases.cjs`，通常不需要手动运行。

---

## 13. 测试更新流程

### 13.1 安装旧版本

1. 双击 `dist/e-media-1.0.0-setup.exe` 安装应用
2. 运行应用，观察右上角显示版本号 `v1.0.0`

### 13.2 发布新版本

按照第 11 步和第 12 步，发布 `v1.0.1` 并修复 Release。

### 13.3 测试自动更新

1. 重新打开旧版本应用（v1.0.0）
2. 应用启动 3 秒后会自动检查更新
3. 应该弹出更新面板，显示发现新版本 `v1.0.1`
4. 点击"下载更新"，观察进度条
5. 下载完成后，点击"退出并安装"
6. 应用自动重启，版本号变为 `v1.0.1`

### 13.4 手动检查更新

如果自动检查没有触发，可以点击"检查更新"按钮手动触发。

---

## 14. 常见问题与解决方案

### Q1: 点击"检查更新"没反应

**原因**：可能是 Release 处于草稿状态，或缺少 `latest.yml` 文件。

**解决**：
1. 检查 GitHub Release 是否已发布（非草稿）
2. 运行 `fix-releases.cjs` 修复
3. 查看应用日志（通常在 `%APPDATA%/e-media/logs/`）

### Q2: 提示"No published versions on GitHub"

**原因**：GitHub 上没有任何已发布的 Release。

**解决**：
1. 确认已执行 `npm run publish:win`
2. 运行 `fix-releases.cjs` 将 Release 从草稿状态改为已发布

### Q3: 增量更新下载失败

**原因**：缺少 `blockmap` 文件。

**解决**：
1. 检查 Release 是否包含 `.blockmap` 文件
2. 运行 `fix-releases.cjs` 上传缺失的 blockmap

### Q4: git push 连接被重置

**原因**：网络问题或 SSH 配置错误。

**解决**：
1. 检查 SSH 密钥是否正确配置
2. 测试 SSH 连接：`ssh -T git@github.com`
3. 配置 `~/.ssh/config` 文件（见第 2.3 节）

### Q5: npm install 卡住

**原因**：网络访问 npm 官方源慢。

**解决**：
```powershell
npm config set registry https://registry.npmmirror.com
```

### Q6: 打包时下载 electron 二进制失败

**原因**：默认从国外下载 electron。

**解决**：在 `electron-builder.yml` 中配置镜像：
```yaml
electronDownload:
  mirror: https://npmmirror.com/mirrors/electron/
```

### Q7: 版本号没变化，发布失败

**原因**：GitHub 不允许同一版本号创建多个 Release。

**解决**：每次发布前修改 `package.json` 中的 `version` 字段。

### Q8: 更新检查正常，但下载后无法安装

**原因**：可能是权限问题或安装包损坏。

**解决**：
1. 以管理员身份运行应用
2. 检查安装包是否完整
3. 查看日志中的错误信息

### Q9: 如何查看应用日志？

日志文件位置：
- Windows: `%APPDATA%/e-media/logs/main.log`
- macOS: `~/Library/Logs/e-media/main.log`
- Linux: `~/.config/e-media/logs/main.log`

### Q10: 如何调试更新流程？

在 `incremental-updater.ts` 中已配置 `autoUpdater.logger = log`，所有更新日志会写入文件。

开发时可以在主进程添加更多日志：
```typescript
autoUpdater.on('checking-for-update', () => {
  log.info('正在检查更新...')
})
```

---

## 附录：完整文件结构

```
lx-video/
├── .env                          # 环境变量（含 Token，已被 gitignore）
├── .env.example                  # 环境变量模板（可提交）
├── .gitignore                    # Git 忽略配置
├── electron-builder.yml          # 打包配置
├── package.json                  # 项目配置
├── publish.cjs                   # 打包发布脚本（一键发布）
├── fix-releases.cjs              # Release 修复脚本（删除重复、上传 blockmap、发布草稿）
├── AUTO-UPDATE-GUIDE.md          # 本文档
├── src/
│   ├── main/                     # 主进程
│   │   ├── index.ts              # 主进程入口
│   │   └── updater/              # 更新模块
│   │       ├── index.ts          # 模块入口
│   │       └── incremental-updater.ts  # 增量更新核心
│   ├── preload/                  # 预加载脚本
│   │   ├── index.ts              # 桥接层
│   │   └── index.d.ts            # 类型声明
│   └── renderer/                 # 渲染进程
│       └── src/
│           ├── App.vue           # 根组件
│           └── components/
│               └── Updater.vue   # 更新 UI 组件
└── dist/                         # 打包输出
    ├── e-media-1.0.1-setup.exe
    ├── e-media-1.0.1-setup.exe.blockmap
    └── latest.yml
```

---

## 附录：发布新版本完整流程

每次发布新版本，只需一条命令：

```powershell
# 方式一：先修改 package.json 中的 version，再运行
node publish.mjs

# 方式二：直接指定版本号（推荐，脚本自动修改 package.json）
node publish.mjs 1.0.6
```

脚本会自动完成所有步骤：
1. ✅ 读取 `.env` 中的 Token 和仓库信息
2. ✅ 检查 GitHub 上是否已存在该版本
3. ✅ 打包并上传到 GitHub Release
4. ✅ 修复 Release（删除重复、上传 blockmap、发布草稿）

如果脚本执行失败，可以单独运行修复脚本：

```powershell
# 修复所有版本
node fix-releases.mjs

# 只修复指定版本
node fix-releases.mjs v1.0.6
```

最后验证：
- 访问 GitHub Releases 页面，确认新版本已发布
- 在旧版本应用中点击"检查更新"，确认能检测到新版本

---

## 附录：IPC 通信流程图

```
┌─────────────────┐     IPC      ┌─────────────────┐     HTTP      ┌─────────────────┐
│   渲染进程       │ ──────────→  │    主进程        │ ──────────→   │   GitHub API    │
│  (Updater.vue)  │              │ (incremental-   │               │   (Releases)    │
│                 │              │  updater.ts)    │               │                 │
│  checkForUpdate │              │                 │               │  latest.yml     │
│  downloadUpdate │              │  autoUpdater    │               │  setup.exe      │
│  installUpdate  │              │                 │               │  blockmap       │
└─────────────────┘              └─────────────────┘               └─────────────────┘
        ▲                               │
        │  事件转发                       │
        └───────────────────────────────┘
         update-available
         update-not-available
         progress
         downloaded
         error
```

---

**文档版本**：1.0
**最后更新**：2026-06-24
**适用项目**：e-media (Electron + Vue 3 + TypeScript)
