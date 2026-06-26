import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { AccessCodesType } from './types'

import type { MenuRecord } from '#/router/access'
import type { RouteRecordRaw } from 'vue-router'

let _namespace = 'vben'

function storageKey(key: string) {
  return `${_namespace}-${key}`
}

/** 访问权限 store */
export const useAccessStore = defineStore('access', () => {
  const accessToken = ref<string>('')
  const accessCodes = ref<AccessCodesType>([])
  const accessMenus = ref<MenuRecord[]>([])
  const accessRoutes = ref<RouteRecordRaw[]>([])
  const isAccessChecked = ref<boolean>(false)
  const loginExpired = ref<boolean>(false)

  // 初始化：从 localStorage 读取 accessToken
  try {
    const cached = localStorage.getItem(storageKey('access-token'))
    if (cached) accessToken.value = cached
  } catch {
    // ignore
  }

  function setAccessToken(token: string) {
    accessToken.value = token
    try {
      if (token) {
        localStorage.setItem(storageKey('access-token'), token)
      } else {
        localStorage.removeItem(storageKey('access-token'))
      }
    } catch {
      // ignore
    }
  }

  function setAccessCodes(codes: AccessCodesType) {
    accessCodes.value = codes
  }

  function setAccessMenus(menus: MenuRecord[]) {
    accessMenus.value = menus
  }

  function setAccessRoutes(routes: RouteRecordRaw[]) {
    accessRoutes.value = routes
  }

  function setIsAccessChecked(checked: boolean) {
    isAccessChecked.value = checked
  }

  function setLoginExpired(expired: boolean) {
    loginExpired.value = expired
  }

  function $reset() {
    accessToken.value = ''
    accessCodes.value = []
    accessMenus.value = []
    accessRoutes.value = []
    isAccessChecked.value = false
    loginExpired.value = false
    try {
      localStorage.removeItem(storageKey('access-token'))
    } catch {
      // ignore
    }
  }

  return {
    $reset,
    accessCodes,
    accessMenus,
    accessRoutes,
    accessToken,
    isAccessChecked,
    loginExpired,
    setAccessCodes,
    setAccessMenus,
    setAccessRoutes,
    setAccessToken,
    setIsAccessChecked,
    setLoginExpired
  }
})

/** 设置命名空间（由 initStores 调用） */
export function setAccessNamespace(namespace: string) {
  _namespace = namespace
}
