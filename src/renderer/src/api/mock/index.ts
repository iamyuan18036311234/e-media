import { registerMock } from '#/api/request'

import type { UserInfo } from '#/store/types'

/** 模拟登录返回值 */
export const mockLoginResult = {
  accessToken: 'mock-access-token-lx-video'
}

/** 模拟用户信息 */
export const mockUserInfo: UserInfo = {
  avatar: 'https://avatar.vercel.sh/lx-video.svg',
  homePath: '/analytics',
  realName: '流光管理员',
  roles: ['super'],
  username: 'admin',
  email: 'admin@lx-video.com'
}

/** 模拟权限码 */
export const mockAccessCodes = ['AC_100100', 'AC_100110', 'AC_100120', 'super']

/** 模拟菜单列表（使用静态路由时为空） */
export const mockAllMenus: any[] = []

/** 注册所有 Mock 处理器 */
export function setupMock() {
  // 登录
  registerMock('/auth/login', () => mockLoginResult)
  // 登出
  registerMock('/auth/logout', () => ({}))
  // 刷新 token
  registerMock('/auth/refresh', () => ({ data: 'mock-refresh-token', status: 0 }))
  // 权限码
  registerMock('/auth/codes', () => mockAccessCodes)
  // 用户信息
  registerMock('/user/info', () => mockUserInfo)
  // 菜单
  registerMock('/menu/all', () => mockAllMenus)
}
