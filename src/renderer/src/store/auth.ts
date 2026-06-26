import type { UserInfo } from '#/store/types'

import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { DEFAULT_HOME_PATH, LOGIN_PATH } from '#/router/access'
import { notification } from 'ant-design-vue'
import { defineStore } from 'pinia'

import { getAccessCodesApi, getUserInfoApi, loginApi, logoutApi } from '#/api'
import { $t } from '#/locales'
import { useAccessStore } from './access'
import { useUserStore } from './user'

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore()
  const userStore = useUserStore()
  const router = useRouter()

  const loginLoading = ref(false)

  /**
   * 异步处理登录操作
   * @param params 登录表单数据
   */
  async function authLogin(params: Record<string, any>, onSuccess?: () => Promise<void> | void) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: UserInfo | null = null
    try {
      loginLoading.value = true
      const { accessToken } = await loginApi(params)

      // 如果成功获取到 accessToken
      if (accessToken) {
        accessStore.setAccessToken(accessToken)

        // 获取用户信息并存储到 accessStore 中
        const [fetchUserInfoResult, accessCodes] = await Promise.all([
          fetchUserInfo(),
          getAccessCodesApi()
        ])

        userInfo = fetchUserInfoResult

        userStore.setUserInfo(userInfo)
        accessStore.setAccessCodes(accessCodes)

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false)
        } else {
          await (onSuccess ? onSuccess() : router.push(userInfo.homePath || DEFAULT_HOME_PATH))
        }

        if (userInfo?.realName) {
          notification.success({
            description: `${$t('page.auth.loginSuccessDesc')}:${userInfo?.realName}`,
            duration: 3,
            message: $t('page.auth.loginSuccess')
          })
        }
      }
    } finally {
      loginLoading.value = false
    }

    return {
      userInfo
    }
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi()
    } catch {
      // 不做任何处理
    }
    // 直接重置 store（避免与 store/index 产生循环引用）
    accessStore.$reset()
    userStore.$reset()
    accessStore.setLoginExpired(false)

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath)
          }
        : {}
    })
  }

  async function fetchUserInfo() {
    const info = await getUserInfoApi()
    userStore.setUserInfo(info)
    return info
  }

  function $reset() {
    loginLoading.value = false
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout
  }
})
