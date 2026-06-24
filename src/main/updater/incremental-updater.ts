/**
 * 增量更新模块
 * 基于 electron-updater 实现，通过 blockmap 只下载变化的数据块
 *
 * 与全量更新（downloader.ts）的区别：
 * - 增量更新：只下载变化的块，下载量小，自动安装
 * - 全量更新：下载完整安装包，手动运行安装
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
            message: '没有可用的更新信息，请先点击"检查增量更新"'
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
