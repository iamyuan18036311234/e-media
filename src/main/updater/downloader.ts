/**
 * 下载器
 * 提取自 electerm 的 download-upgrade.js，适配为 TypeScript + IPC 架构
 *
 * 功能：
 * - 流式下载安装包到临时目录，带进度回调
 * - 支持暂停 / 恢复 / 取消
 * - 支持镜像 URL 转换
 * - 下载完成后可通过 shell.openPath 打开安装包
 */

import { createWriteStream, WriteStream, rmSync } from 'fs'
import { resolve } from 'path'
import { tmpdir } from 'os'
import { shell } from 'electron'

/** 下载进度回调 */
export type ProgressCallback = (percent: number) => void

/** 下载完成回调 */
export type EndCallback = (filePath: string) => void

/** 下载错误回调 */
export type ErrorCallback = (err: Error) => void

/** 镜像 URL 转换函数类型 */
export type MirrorTransformer = (url: string, mirror: string) => string

/**
 * 默认镜像 URL 转换
 * 提取自 electerm download-upgrade.js 的 getUrl 函数
 * 可根据需要自定义镜像逻辑
 */
export const defaultMirrorTransformer: MirrorTransformer = (url) => {
  // 默认直接返回原始 URL
  // 可根据需要添加镜像逻辑，例如：
  // if (mirror === 'gh-proxy') return `https://your-mirror.com/${url}`
  return url
}

/**
 * 下载器类
 * 对应 electerm 的 Upgrade 类
 */
export class Downloader {
  private response: Response | null = null
  private writer: WriteStream | null = null
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null
  private paused = false
  private canceled = false
  private destroyed = false
  private downloaded = 0
  private total = 0
  private filePath = ''
  private progressTimer: ReturnType<typeof setInterval> | null = null

  /**
   * 初始化下载
   * @param url 下载地址
   * @param mirror 镜像名称
   * @param mirrorTransformer 镜像 URL 转换函数
   * @param onProgress 进度回调
   * @param onEnd 完成回调
   * @param onError 错误回调
   */
  async init(
    url: string,
    mirror: string,
    mirrorTransformer: MirrorTransformer,
    onProgress: ProgressCallback,
    onEnd: EndCallback,
    onError: ErrorCallback
  ): Promise<void> {
    const remoteUrl = mirrorTransformer(url, mirror)
    const fileName = remoteUrl.split('/').pop() || 'update-package'
    this.filePath = resolve(tmpdir(), fileName)

    // 清理可能存在的旧文件
    try {
      rmSync(this.filePath, { force: true })
    } catch {
      // 忽略删除错误
    }

    try {
      this.response = await fetch(remoteUrl)
      if (!this.response.ok) {
        throw new Error(`HTTP ${this.response.status}: ${this.response.statusText}`)
      }

      const contentLength = this.response.headers.get('content-length')
      this.total = contentLength ? Number(contentLength) : 0

      this.writer = createWriteStream(this.filePath)
      const reader = this.response.body?.getReader()

      if (!reader) {
        throw new Error('无法获取下载流')
      }
      this.reader = reader

      // 节流进度回调，提取自 electerm 的 _.throttle(onData, 1000)
      let lastReported = -1
      this.progressTimer = setInterval(() => {
        if (this.destroyed) return
        if (this.total > 0) {
          const percent = Math.floor((this.downloaded * 100) / this.total)
          if (percent !== lastReported) {
            lastReported = percent
            onProgress(percent)
          }
        }
      }, 500)

      // 读取循环
      await this.readLoop()

      if (this.canceled) {
        this.cleanup()
        return
      }

      // 结束写入
      await new Promise<void>((resolve, reject) => {
        if (!this.writer) return resolve()
        this.writer.end((err?: Error) => {
          if (err) reject(err)
          else resolve()
        })
      })

      if (!this.destroyed) {
        onProgress(100)
        onEnd(this.filePath)
      }
    } catch (err) {
      if (!this.canceled && !this.destroyed) {
        onError(err instanceof Error ? err : new Error(String(err)))
      }
    } finally {
      this.cleanup()
    }
  }

  /**
   * 读取循环，支持暂停
   */
  private async readLoop(): Promise<void> {
    while (true) {
      if (this.canceled || this.destroyed) return

      // 暂停时等待
      if (this.paused) {
        await new Promise((r) => setTimeout(r, 200))
        continue
      }

      const { done, value } = await this.reader!.read()
      if (done) return

      if (this.canceled || this.destroyed) return

      this.writer!.write(value)
      this.downloaded += value.length
    }
  }

  /**
   * 暂停下载
   */
  pause(): void {
    this.paused = true
  }

  /**
   * 恢复下载
   */
  resume(): void {
    this.paused = false
  }

  /**
   * 取消下载（不删除文件）
   */
  cancel(): void {
    this.canceled = true
    this.cleanup()
  }

  /**
   * 销毁下载器，取消下载并清理资源
   * 对应 electerm 的 destroy 方法
   */
  destroy(): void {
    this.destroyed = true
    this.canceled = true
    this.cleanup()
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer)
      this.progressTimer = null
    }
    if (this.reader) {
      this.reader.cancel().catch(() => {})
      this.reader = null
    }
    if (this.writer) {
      this.writer.destroy()
      this.writer = null
    }
    this.response = null
  }

  /**
   * 打开已下载的文件（安装包）
   * 对应 electerm 的 onEnd 中的 openFile 调用
   */
  static async openFile(filePath: string): Promise<void> {
    await shell.openPath(filePath)
  }
}
