import type { Router } from 'vue-router'

import { DEFAULT_HOME_PATH, LOGIN_PATH, generateAccess } from '#/router/access'
import { accessRoutes, coreRouteNames } from '#/router/routes'
import { useAccessStore, useAuthStore, useUserStore } from '#/store'

/**
 * 通用守卫配置
 * @param router
 */
function setupCommonGuard(router: Router) {
  // 记录已经加载的页面
  const loadedPaths = new Set<string>()

  router.beforeEach(async (to) => {
    ;(to.meta as Record<string, unknown>).loaded = loadedPaths.has(to.path)
    return true
  })

  router.afterEach((to) => {
    // 记录页面是否加载,如果已经加载，后续的页面切换动画等效果不在重复执行
    loadedPaths.add(to.path)
  })
}

/**
 * 权限访问守卫配置
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore()
    const userStore = useUserStore()
    const authStore = useAuthStore()

    // 基本路由，这些路由不需要进入权限拦截
    if (coreRouteNames.includes(to.name as string)) {
      if (to.path === LOGIN_PATH && accessStore.accessToken) {
        return decodeURIComponent(
          (to.query?.redirect as string) || userStore.userInfo?.homePath || DEFAULT_HOME_PATH
        )
      }
      return true
    }

    // accessToken 检查
    if (!accessStore.accessToken) {
      // 明确声明忽略权限访问权限，则可以访问
      if ((to.meta as Record<string, unknown>).ignoreAccess) {
        return true
      }

      // 没有访问权限，跳转登录页面
      if (to.fullPath !== LOGIN_PATH) {
        return {
          path: LOGIN_PATH,
          query:
            to.fullPath === DEFAULT_HOME_PATH ? {} : { redirect: encodeURIComponent(to.fullPath) },
          replace: true
        }
      }
      return to
    }

    // 是否已经生成过动态路由
    if (accessStore.isAccessChecked) {
      return true
    }

    // 生成路由表
    const userInfo = userStore.userInfo || (await authStore.fetchUserInfo())
    const userRoles = userInfo.roles ?? []

    // 生成菜单和路由
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: userRoles,
      router,
      routes: accessRoutes
    })

    // 将动态路由注册到 router（模块路由不在初始路由表中）
    accessibleRoutes.forEach((route) => {
      router.addRoute(route)
    })

    // 保存菜单信息和路由信息
    accessStore.setAccessMenus(accessibleMenus)
    accessStore.setAccessRoutes(accessibleRoutes)
    accessStore.setIsAccessChecked(true)

    const redirectPath = (from.query.redirect ??
      (to.path === DEFAULT_HOME_PATH
        ? userInfo.homePath || DEFAULT_HOME_PATH
        : to.fullPath)) as string

    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true
    }
  })
}

/**
 * 项目守卫配置
 * @param router
 */
function createRouterGuard(router: Router) {
  /** 通用 */
  setupCommonGuard(router)
  /** 权限访问 */
  setupAccessGuard(router)
}

export { createRouterGuard }
