import type { RouteRecordRaw } from 'vue-router'

import { mergeRouteModules, traverseRouteNames } from '#/router/access'

import { coreRoutes, fallbackNotFoundRoute } from './core'

/** 动态路由模块（自动加载 modules 下的所有路由） */
const dynamicRouteFiles = import.meta.glob('./modules/**/*.ts', {
  eager: true
}) as Record<string, { default: RouteRecordRaw[] }>

/** 动态路由 */
const dynamicRoutes: RouteRecordRaw[] = mergeRouteModules(dynamicRouteFiles)

const staticRoutes: RouteRecordRaw[] = []
const externalRoutes: RouteRecordRaw[] = []

/** 路由列表，由基本路由、外部路由和 404 兜底路由组成
 *  无需走权限验证（会一直显示在菜单中） */
const routes: RouteRecordRaw[] = [...coreRoutes, ...externalRoutes, fallbackNotFoundRoute]

/** 基本路由列表，这些路由不需要进入权限拦截 */
const coreRouteNames = traverseRouteNames(coreRoutes)

/** 有权限校验的路由列表，包含动态路由和静态路由 */
const accessRoutes: RouteRecordRaw[] = [...dynamicRoutes, ...staticRoutes]

export { accessRoutes, coreRouteNames, routes }
