import { ElectronAPI } from '@electron-toolkit/preload'

/** 更新检查结果 */
interface UpdateCheckResult {
  hasUpdate: boolean
  currentVersion: string
  latestVersion: string
  date?: string
  releaseNotes?: string
  asset?: { name: string; browser_download_url: string }
}

/** 更新模块 API */
interface UpdaterAPI {
  checkForUpdate: () => Promise<UpdateCheckResult>
  downloadUpdate: (url: string, mirror: string) => Promise<boolean>
  pauseDownload: () => Promise<boolean>
  resumeDownload: () => Promise<boolean>
  cancelDownload: () => Promise<boolean>
  openFile: (filePath: string) => Promise<boolean>
  onProgress: (callback: (percent: number) => void) => () => void
  onDownloaded: (callback: (filePath: string) => void) => () => void
  onError: (callback: (message: string) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      updater: UpdaterAPI
    }
  }
}
