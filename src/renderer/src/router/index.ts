import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

import { routes } from './routes'
import { createRouterGuard } from './guard'

/**
 * @zh_CN 创建 vue-router 实例
 */
const router = createRouter({
  history:
    import.meta.env.VITE_ROUTER_HISTORY === 'hash'
      ? createWebHashHistory(import.meta.env.VITE_BASE)
      : createWebHistory(import.meta.env.VITE_BASE),
  // 应该添加到路由的初始路由列表。
  routes,
  scrollBehavior: (to, _from, savedPosition) => {
    if (savedPosition) {
      return savedPosition
    }
    return to.hash ? { behavior: 'smooth', el: to.hash } : { left: 0, top: 0 }
  }
})

/** 重置静态路由（删除动态添加的路由，恢复初始路由表） */
const resetRoutes = () => {
  const newRoutes = routes
  router.getRoutes().forEach((route) => {
    const name = route.name
    if (name && !newRoutes.some((r) => r.name === name)) {
      router.removeRoute(name)
    }
  })
}

// 创建路由守卫
createRouterGuard(router)

export { resetRoutes, router }
