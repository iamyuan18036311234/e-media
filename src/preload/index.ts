import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 更新模块 API
const updater = {
  /** 检查更新 */
  checkForUpdate: (): Promise<{
    hasUpdate: boolean
    currentVersion: string
    latestVersion: string
    date?: string
    releaseNotes?: string
    asset?: { name: string; browser_download_url: string }
  }> => ipcRenderer.invoke('updater:check'),

  /** 开始下载更新 */
  downloadUpdate: (url: string, mirror: string): Promise<boolean> =>
    ipcRenderer.invoke('updater:download', { url, mirror }),

  /** 暂停下载 */
  pauseDownload: (): Promise<boolean> => ipcRenderer.invoke('updater:pause'),

  /** 恢复下载 */
  resumeDownload: (): Promise<boolean> => ipcRenderer.invoke('updater:resume'),

  /** 取消下载 */
  cancelDownload: (): Promise<boolean> => ipcRenderer.invoke('updater:cancel'),

  /** 打开已下载的安装包 */
  openFile: (filePath: string): Promise<boolean> =>
    ipcRenderer.invoke('updater:open-file', filePath),

  /** 监听下载进度 */
  onProgress: (callback: (percent: number) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: { percent: number }): void =>
      callback(data.percent)
    ipcRenderer.on('updater:progress', handler)
    return () => ipcRenderer.removeListener('updater:progress', handler)
  },

  /** 监听下载完成 */
  onDownloaded: (callback: (filePath: string) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: { filePath: string }): void =>
      callback(data.filePath)
    ipcRenderer.on('updater:downloaded', handler)
    return () => ipcRenderer.removeListener('updater:downloaded', handler)
  },

  /** 监听下载错误 */
  onError: (callback: (message: string) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: { message: string }): void =>
      callback(data.message)
    ipcRenderer.on('updater:error', handler)
    return () => ipcRenderer.removeListener('updater:error', handler)
  }
}

// Custom APIs for renderer
const api = { updater }

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
