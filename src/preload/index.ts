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
