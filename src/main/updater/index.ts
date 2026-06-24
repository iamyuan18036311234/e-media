/**
 * 更新模块入口 - IPC 处理与调度
 * 提取自 electerm 的 dispatch-center.js + global-state.js，
 * 适配为 Electron IPC 架构（替代 WebSocket）
 *
 * IPC 通道：
 *   渲染进程 → 主进程 (ipcMain.handle):
 *     - updater:check       检查更新
 *     - updater:download    开始下载 { url, mirror }
 *     - updater:pause       暂停下载
 *     - updater:resume      恢复下载
 *     - updater:cancel      取消下载
 *     - updater:open-file   打开已下载的安装包
 *
 *   主进程 → 渲染进程 (webContents.send):
 *     - updater:progress    下载进度 { percent }
 *     - updater:downloaded  下载完成 { filePath }
 *     - updater:error       错误 { message }
 */

import { ipcMain, BrowserWindow } from 'electron'
import {
  checkForUpdate,
  defaultUpdateConfig,
  UpdateCheckResult,
  UpdateConfig
} from './update-checker'
import { Downloader, defaultMirrorTransformer } from './downloader'

/** IPC 通道名称 */
export const UpdaterChannels = {
  CHECK: 'updater:check',
  DOWNLOAD: 'updater:download',
  PAUSE: 'updater:pause',
  RESUME: 'updater:resume',
  CANCEL: 'updater:cancel',
  OPEN_FILE: 'updater:open-file',
  PROGRESS: 'updater:progress',
  DOWNLOADED: 'updater:downloaded',
  ERROR: 'updater:error'
} as const

/** 下载请求参数 */
export interface DownloadParams {
  url: string
  mirror: string
}

/** 当前下载器实例（单例，对应 electerm global-state 中的 upgradeInsts） */
let currentDownloader: Downloader | null = null

/** 上次检查结果缓存 */
let lastCheckResult: UpdateCheckResult | null = null

/**
 * 初始化更新模块
 * 注册所有 IPC 处理器
 * @param mainWindow 主窗口引用，用于向渲染进程发送事件
 * @param config 更新配置（可选，默认使用 defaultUpdateConfig）
 */
export function initUpdater(
  mainWindow: BrowserWindow,
  config: UpdateConfig = defaultUpdateConfig
): void {
  // 检查更新
  ipcMain.handle(UpdaterChannels.CHECK, async (): Promise<UpdateCheckResult> => {
    const result = await checkForUpdate(config)
    lastCheckResult = result
    return result
  })

  // 开始下载
  ipcMain.handle(
    UpdaterChannels.DOWNLOAD,
    async (_event, params: DownloadParams): Promise<boolean> => {
      // 如果已有下载在进行，先销毁
      if (currentDownloader) {
        currentDownloader.destroy()
        currentDownloader = null
      }

      const { url, mirror } = params
      if (!url) return false

      currentDownloader = new Downloader()

      const win = mainWindow
      await currentDownloader.init(
        url,
        mirror,
        defaultMirrorTransformer,
        // 进度回调
        (percent: number) => {
          if (!win.isDestroyed()) {
            win.webContents.send(UpdaterChannels.PROGRESS, { percent })
          }
        },
        // 完成回调
        (filePath: string) => {
          if (!win.isDestroyed()) {
            win.webContents.send(UpdaterChannels.DOWNLOADED, { filePath })
          }
          currentDownloader = null
        },
        // 错误回调
        (err: Error) => {
          if (!win.isDestroyed()) {
            win.webContents.send(UpdaterChannels.ERROR, { message: err.message })
          }
          currentDownloader = null
        }
      )

      return true
    }
  )

  // 暂停下载
  ipcMain.handle(UpdaterChannels.PAUSE, (): boolean => {
    if (currentDownloader) {
      currentDownloader.pause()
      return true
    }
    return false
  })

  // 恢复下载
  ipcMain.handle(UpdaterChannels.RESUME, (): boolean => {
    if (currentDownloader) {
      currentDownloader.resume()
      return true
    }
    return false
  })

  // 取消下载
  ipcMain.handle(UpdaterChannels.CANCEL, (): boolean => {
    if (currentDownloader) {
      currentDownloader.cancel()
      currentDownloader = null
      return true
    }
    return false
  })

  // 打开已下载的安装包
  ipcMain.handle(
    UpdaterChannels.OPEN_FILE,
    async (_event, filePath: string): Promise<boolean> => {
      if (!filePath) return false
      await Downloader.openFile(filePath)
      return true
    }
  )
}

/**
 * 获取上次检查结果
 */
export function getLastCheckResult(): UpdateCheckResult | null {
  return lastCheckResult
}

/**
 * 销毁更新模块，清理资源
 */
export function destroyUpdater(): void {
  if (currentDownloader) {
    currentDownloader.destroy()
    currentDownloader = null
  }
}
