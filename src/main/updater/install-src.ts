/**
 * 平台安装包识别
 * 提取自 electerm 的 install-src.js
 *
 * 根据当前运行平台返回对应的安装包文件后缀，
 * 用于从 release assets 中筛选出匹配当前平台的安装包。
 */

import { platform, arch } from 'os'

const isWin = platform() === 'win32'
const isMac = platform() === 'darwin'
const isArm = arch().includes('arm')

/** 当前平台的安装包文件后缀 */
export const installSrc: string = isWin
  ? 'win-x64.tar.gz'
  : isMac || isArm
    ? 'mac-x64.dmg'
    : 'linux-x64.tar.gz'

/**
 * 判断某个安装来源是否应跳过更新检查
 * 提取自 electerm 的 check-skip-src.js
 */
const skipSrcs = ['.appx', '.snap', 'skip-upgrade-check']

export function shouldSkipUpgradeCheck(installSrc: string | undefined): boolean {
  if (!installSrc) return false
  return skipSrcs.some((skip) => {
    if (skip === 'skip-upgrade-check') {
      return installSrc === skip
    }
    return installSrc.endsWith(skip)
  })
}

export { isWin, isMac, isArm }
