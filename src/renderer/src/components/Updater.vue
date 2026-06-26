<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Button, Progress, Tag } from 'ant-design-vue'
import { preferences } from '#/preferences'

const { updater, getVersion } = window.api

/** 主题色（用于进度条） */
const primaryColor = preferences.theme.colorPrimary

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
      <Tag color="default" class="version-tag">v{{ currentVersion }}</Tag>
      <Button size="small" :loading="checking" @click="handleCheck">检查更新</Button>
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
          <Progress :percent="progress" :stroke-color="primaryColor" />
        </div>

        <!-- 下载完成 -->
        <div v-else-if="downloaded" class="updater-downloaded">
          <p>更新下载完成！</p>
          <Button type="primary" @click="handleInstall">退出并安装</Button>
        </div>

        <!-- 下载前 -->
        <div v-else>
          <Button type="primary" @click="handleDownload">下载更新</Button>
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

.version-tag {
  margin: 0;
  font-size: 12px;
}

.updater-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--panel-bg, #fff);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
}

.updater-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--primary, #8b4c3b);
  color: #fff;
  border-radius: 10px 10px 0 0;
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
  opacity: 0.85;
}

.updater-close:hover {
  opacity: 1;
}

.updater-panel-body {
  padding: 16px;
  color: var(--text-color, #333);
}

.updater-downloading {
  text-align: center;
}

.updater-downloaded {
  text-align: center;
}

.updater-downloaded p {
  margin: 0 0 12px;
  color: var(--primary, #8b4c3b);
  font-weight: 500;
}

.updater-changelog {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.updater-changelog-title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 6px;
}

.updater-changelog-body {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
  white-space: pre-wrap;
  max-height: 150px;
  overflow-y: auto;
  line-height: 1.5;
}

.updater-error {
  color: #ff4d4f;
  font-size: 13px;
  margin: 8px 0 0;
}
</style>
