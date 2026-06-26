import type { App } from 'vue'

import { createPinia } from 'pinia'

import { setAccessNamespace } from './access'
import { useAccessStore } from './access'
import { useAuthStore } from './auth'
import { useUserStore } from './user'

export { useAccessStore, useAuthStore, useUserStore }
export type { UserInfo } from './types'

/** pinia 实例 */
const pinia = createPinia()

/** 初始化 pinia store */
export async function initStores(app: App, options: { namespace: string }) {
  const { namespace } = options
  setAccessNamespace(namespace)
  app.use(pinia)
}

/** 重置所有 store */
export function resetAllStores() {
  const accessStore = useAccessStore()
  const userStore = useUserStore()
  const authStore = useAuthStore()
  accessStore.$reset()
  userStore.$reset()
  authStore.$reset()
}
