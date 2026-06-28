<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Badge, Button, Popover, Progress, Tag } from 'ant-design-vue'
import { SyncOutlined } from '@ant-design/icons-vue'
import { preferences } from '#/preferences'

// 浏览器环境（非 Electron）下 window.api 不存在，需安全降级
const api = window.api
const updater = api?.updater
const getVersion = api?.getVersion

/** 主题色（用于进度条） */
const primaryColor = preferences.theme.colorPrimary

// 当前版本号
const currentVersion = ref('')

// 状态
const checking = ref(false)
const error = ref('')
const open = ref(false)

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

/** 是否显示更新红点 */
const showDot = computed(() => updateAvailable.value && !downloaded.value)

/** 检查更新 */
async function handleCheck(): Promise<void> {
  if (!updater) {
    error.value = '当前环境不支持更新检查'
    return
  }
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
  if (!updater) return
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
  if (!updater) return
  await updater.installUpdate()
}

onMounted(async () => {
  // 浏览器环境下无 updater API，跳过
  if (!updater || !getVersion) {
    currentVersion.value = 'web'
    return
  }

  // 获取当前版本号
  currentVersion.value = await getVersion()

  // 事件监听
  cleanupAvailable = updater.onUpdateAvailable((info) => {
    updateAvailable.value = true
    updateInfo.value = info
    open.value = true
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
  <Popover v-model:open="open" trigger="click" placement="bottomRight" overlay-class-name="updater-popover">
    <template #title>
      <div class="updater-popover-title">
        <span>检查更新</span>
        <Tag color="default" class="version-tag">v{{ currentVersion }}</Tag>
      </div>
    </template>
    <template #content>
      <div class="updater-popover-body">
        <!-- 错误提示 -->
        <p v-if="error" class="updater-error">{{ error }}</p>

        <!-- 发现新版本 -->
        <template v-if="updateAvailable">
          <div class="updater-update-info">
            <span class="updater-update-label">发现新版本</span>
            <strong v-if="updateInfo" class="updater-update-version">{{ updateInfo.version }}</strong>
          </div>

          <!-- 下载中 -->
          <div v-if="downloading" class="updater-downloading">
            <Progress :percent="progress" :stroke-color="primaryColor" size="small" />
          </div>

          <!-- 下载完成 -->
          <div v-else-if="downloaded" class="updater-downloaded">
            <p class="updater-downloaded-text">更新下载完成！</p>
            <Button type="primary" size="small" @click="handleInstall">退出并安装</Button>
          </div>

          <!-- 下载前 -->
          <div v-else class="updater-actions">
            <Button type="primary" size="small" @click="handleDownload">下载更新</Button>
          </div>

          <!-- 更新日志 -->
          <div v-if="updateInfo?.releaseNotes" class="updater-changelog">
            <div class="updater-changelog-title">更新日志：</div>
            <div class="updater-changelog-body">{{ updateInfo.releaseNotes }}</div>
          </div>
        </template>

        <!-- 无更新 -->
        <template v-else>
          <p class="updater-tip">点击下方按钮检查是否有新版本</p>
          <Button size="small" :loading="checking" @click="handleCheck">检查更新</Button>
        </template>
      </div>
    </template>

    <Badge :dot="showDot" :offset="[-2, 4]">
      <button class="header-icon-btn" type="button" aria-label="检查更新">
        <SyncOutlined :spin="checking || downloading" />
      </button>
    </Badge>
  </Popover>
</template>

<style scoped>
/* 头部图标按钮 - 对齐 web-antd VbenIconButton（h-8 w-8 rounded-full ghost） */
.header-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: hsl(var(--foreground));
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.header-icon-btn:hover {
  background: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

/* Popover 标题 */
.updater-popover-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.version-tag {
  margin: 0;
  font-size: 12px;
}

/* Popover 内容 */
.updater-popover-body {
  width: 280px;
}

.updater-error {
  color: hsl(var(--destructive));
  font-size: 13px;
  margin: 0 0 8px;
}

.updater-tip {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  margin: 0 0 8px;
}

.updater-update-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 13px;
}

.updater-update-version {
  color: var(--primary, #8b4c3b);
}

.updater-downloading {
  margin: 8px 0;
}

.updater-downloaded {
  text-align: center;
}

.updater-downloaded-text {
  margin: 0 0 8px;
  color: var(--primary, #8b4c3b);
  font-weight: 500;
  font-size: 13px;
}

.updater-actions {
  margin-top: 4px;
}

.updater-changelog {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid hsl(var(--border));
}

.updater-changelog-title {
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 4px;
}

.updater-changelog-body {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  white-space: pre-wrap;
  max-height: 120px;
  overflow-y: auto;
  line-height: 1.5;
}
</style>
