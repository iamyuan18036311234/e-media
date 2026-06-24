/**
 * 版本比较工具
 * 提取自 electerm 的 version-compare.js
 *
 * @param a 版本字符串，如 "1.0.0" 或 "v1.0.0"
 * @param b 版本字符串，如 "12.0.3"
 * @returns 1 (a > b) | -1 (a < b) | 0 (a === b)
 */
export function compareVersions(a: string, b: string): number {
  const ar = a.split('.').map((n) => Number(n.replace('v', '')))
  const br = b.split('.').map((n) => Number(n.replace('v', '')))
  let res = 0
  for (let i = 0, len = br.length; i < len; i++) {
    if (br[i] < ar[i]) {
      res = 1
      break
    } else if (br[i] > ar[i]) {
      res = -1
      break
    }
  }
  return res
}
