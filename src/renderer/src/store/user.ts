import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { UserInfo } from './types'

/** 用户 store */
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  function setUserInfo(info: UserInfo | null) {
    userInfo.value = info
  }

  function $reset() {
    userInfo.value = null
  }

  return {
    $reset,
    setUserInfo,
    userInfo
  }
})
