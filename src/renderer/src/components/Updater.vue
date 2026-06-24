<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const { updater } = window.api

// 状态
const checking = ref(false)
const hasUpdate = ref(false)
const updateInfo = ref<{
  currentVersion: string
  latestVersion: string
  date?: string
  releaseNotes?: string
  asset?: { name: string; browser_download_url: string }
} | null>(null)

const downloading = ref(false)
const paused = ref(false)
const progress = ref(0)
const error = ref('')
const downloadedFilePath = ref('')
const showPanel = ref(false)

// 镜像选项 - 应与 main/updater/update-checker.ts 中的 mirrors 保持一致
const mirrors = [
  { value: 'direct', label: 'Direct' },
  { value: 'mirror', label: 'Mirror' }
]
const selectedMirror = ref('direct')

// 清理函数
let cleanupProgress: (() => void) | null = null
let cleanupDownloaded: (() => void) | null = null
let cleanupError: (() => void) | null = null

/** 检查更新 */
async function handleCheck(): Promise<void> {
  checking.value = true
  error.value = ''
  try {
    const result = await updater.checkForUpdate()
    if (result.hasUpdate) {
      hasUpdate.value = true
      updateInfo.value = result
      showPanel.value = true
    } else {
      error.value = '当前已是最新版本'
      setTimeout(() => (error.value = ''), 3000)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '检查更新失败'
  } finally {
    checking.value = false
  }
}

/** 开始下载 */
async function handleDownload(): Promise<void> {
  if (!updateInfo.value?.asset?.browser_download_url) {
    error.value = '未找到匹配当前平台的安装包'
    return
  }

  downloading.value = true
  paused.value = false
  progress.value = 0
  error.value = ''
  downloadedFilePath.value = ''

  await updater.downloadUpdate(updateInfo.value.asset.browser_download_url, selectedMirror.value)
}

/** 暂停下载 */
async function handlePause(): Promise<void> {
  await updater.pauseDownload()
  paused.value = true
}

/** 恢复下载 */
async function handleResume(): Promise<void> {
  await updater.resumeDownload()
  paused.value = false
}

/** 取消下载 */
async function handleCancel(): Promise<void> {
  await updater.cancelDownload()
  downloading.value = false
  paused.value = false
  progress.value = 0
}

/** 打开已下载的安装包 */
async function handleOpenFile(): Promise<void> {
  if (downloadedFilePath.value) {
    await updater.openFile(downloadedFilePath.value)
  }
}

/** 关闭面板 */
function handleClose(): void {
  showPanel.value = false
}

onMounted(() => {
  // 监听下载进度
  cleanupProgress = updater.onProgress((percent: number) => {
    progress.value = percent
  })

  // 监听下载完成
  cleanupDownloaded = updater.onDownloaded((filePath: string) => {
    downloading.value = false
    progress.value = 100
    downloadedFilePath.value = filePath
  })

  // 监听下载错误
  cleanupError = updater.onError((message: string) => {
    downloading.value = false
    error.value = message
  })

  // 启动时自动检查更新（延迟 3 秒）
  setTimeout(() => handleCheck(), 3000)
})

onUnmounted(() => {
  cleanupProgress?.()
  cleanupDownloaded?.()
  cleanupError?.()
})
</script>

<template>
  <!-- 检查更新按钮 -->
  <button class="updater-check-btn" :disabled="checking" @click="handleCheck">
    {{ checking ? '检查中...' : '检查更新' }}
  </button>

  <!-- 错误提示 -->
  <p v-if="error && !showPanel" class="updater-error">{{ error }}</p>

  <!-- 更新面板 -->
  <div v-if="showPanel && updateInfo" class="updater-panel">
    <div class="updater-panel-header">
      <span class="updater-title">
        发现新版本
        <strong>{{ updateInfo.latestVersion }}</strong>
        <span v-if="updateInfo.date" class="updater-date">[{{ updateInfo.date }}]</span>
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
        <div class="updater-actions">
          <button v-if="!paused" @click="handlePause">暂停</button>
          <button v-else @click="handleResume">恢复</button>
          <button @click="handleCancel">取消</button>
        </div>
      </div>

      <!-- 下载完成 -->
      <div v-else-if="downloadedFilePath" class="updater-downloaded">
        <p>下载完成！</p>
        <button class="updater-install-btn" @click="handleOpenFile">打开安装包</button>
      </div>

      <!-- 下载前 -->
      <div v-else class="updater-pre-download">
        <div class="updater-mirror-select">
          <label>下载源：</label>
          <select v-model="selectedMirror">
            <option v-for="m in mirrors" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>
        <button class="updater-download-btn" @click="handleDownload">下载更新</button>
      </div>

      <!-- 更新日志 -->
      <div v-if="updateInfo.releaseNotes" class="updater-changelog">
        <div class="updater-changelog-title">更新日志：</div>
        <div class="updater-changelog-body">{{ updateInfo.releaseNotes }}</div>
      </div>

      <!-- 错误 -->
      <p v-if="error" class="updater-error">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
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
  width: 380px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  overflow: hidden;
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
  margin: 0 4px;
}

.updater-date {
  opacity: 0.8;
  font-size: 12px;
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

.updater-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  justify-content: center;
}

.updater-actions button {
  padding: 4px 12px;
  font-size: 12px;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.updater-actions button:hover {
  border-color: #42b883;
  color: #42b883;
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

.updater-pre-download {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.updater-mirror-select {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.updater-mirror-select select {
  padding: 4px 8px;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  font-size: 13px;
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
