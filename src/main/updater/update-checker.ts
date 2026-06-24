/**
 * 更新检查器
 * 提取自 electerm 的 update-check.js，适配为 TypeScript + IPC 架构
 *
 * 从远程服务器获取最新版本信息，支持多 URL 回退。
 * 期望的 JSON 响应格式（兼容 GitHub Release API）：
 * {
 *   "tag_name": "v1.0.1",
 *   "published_at": "2026-06-24T00:00:00Z",
 *   "body": "更新日志 markdown",
 *   "assets": [
 *     { "name": "lx-video-1.0.1-setup.exe", "browser_download_url": "https://..." }
 *   ]
 * }
 */

import { app } from 'electron'
import { compareVersions } from './version-compare'
import { installSrc } from './install-src'

/** 更新检查配置 */
export interface UpdateConfig {
  /** 更新信息 URL 列表（按优先级排列，前一个失败时回退到下一个） */
  updateUrls: string[]
  /** 下载镜像列表 */
  mirrors: MirrorConfig[]
}

/** 镜像配置 */
export interface MirrorConfig {
  /** 镜像名称 */
  name: string
  /** URL 转换函数的描述，用于在 UI 中展示 */
  label: string
}

/** 远程 release asset */
export interface ReleaseAsset {
  name: string
  browser_download_url: string
}

/** 远程版本信息 */
export interface ReleaseInfo {
  tag_name: string
  published_at?: string
  body?: string
  assets?: ReleaseAsset[]
}

/** 检查结果 */
export interface UpdateCheckResult {
  /** 是否有新版本 */
  hasUpdate: boolean
  /** 当前版本 */
  currentVersion: string
  /** 远程最新版本 */
  latestVersion: string
  /** 发布日期 */
  date?: string
  /** 更新日志 */
  releaseNotes?: string
  /** 匹配当前平台的下载资产 */
  asset?: ReleaseAsset
}

/** 默认配置 - 请根据你的项目修改 URL */
export const defaultUpdateConfig: UpdateConfig = {
  updateUrls: [
    // 主 URL - 替换为你的更新服务器地址
    'https://example.com/auto-upments/latest.json',
    // 回退 URL
    'https://example.com/auto-upments/latest.json'
  ],
  mirrors: [
    { name: 'direct', label: 'Direct' },
    { name: 'mirror', label: 'Mirror' }
  ]
}

/**
 * 获取当前应用版本
 */
export function getCurrentVersion(): string {
  return app.getVersion()
}

/**
 * 从 URL 获取 release 信息
 */
async function fetchReleaseInfo(url: string, timeout = 15000): Promise<ReleaseInfo | null> {
  const separator = url.includes('?') ? '' : '?_=' + Date.now()
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    const res = await fetch(url + separator, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'
      }
    })
    clearTimeout(timer)
    if (!res.ok) return null
    return (await res.json()) as ReleaseInfo
  } catch {
    return null
  }
}

/**
 * 从多个 URL 获取 release 信息，按优先级回退
 * 提取自 electerm update-check.js 的回退逻辑
 */
async function getReleaseInfo(urls: string[]): Promise<ReleaseInfo | null> {
  for (const url of urls) {
    const info = await fetchReleaseInfo(url)
    if (info?.tag_name) return info
  }
  return null
}

/**
 * 根据平台筛选匹配的安装包资产
 * 提取自 electerm download-upgrade.js 的 filter 逻辑
 */
function findMatchingAsset(assets: ReleaseAsset[] | undefined): ReleaseAsset | undefined {
  if (!assets || assets.length === 0) return undefined
  return assets.find((a) => a.name.endsWith(installSrc))
}

/**
 * 检查更新
 * @param config 更新配置
 * @returns 检查结果
 */
export async function checkForUpdate(
  config: UpdateConfig = defaultUpdateConfig
): Promise<UpdateCheckResult> {
  const currentVersion = getCurrentVersion()
  const releaseInfo = await getReleaseInfo(config.updateUrls)

  if (!releaseInfo) {
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion
    }
  }

  const latestVersion = releaseInfo.tag_name.replace('v', '')
  const hasUpdate = compareVersions(currentVersion, latestVersion) < 0

  const asset = findMatchingAsset(releaseInfo.assets)

  let date: string | undefined
  if (releaseInfo.published_at) {
    date = releaseInfo.published_at.split('T')[0]
  }

  return {
    hasUpdate,
    currentVersion,
    latestVersion,
    date,
    releaseNotes: releaseInfo.body,
    asset
  }
}
