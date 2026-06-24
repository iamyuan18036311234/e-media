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
