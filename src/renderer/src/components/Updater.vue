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
