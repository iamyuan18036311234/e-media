import type { RouteRecordRaw } from 'vue-router'

/** 默认首页路径 */
export const DEFAULT_HOME_PATH = '/analytics'
/** 登录路径 */
export const LOGIN_PATH = '/auth/login'

export interface MenuRecord {
  /** 子菜单 */
  children?: MenuRecord[]
  /** 图标 */
  icon?: string
  /** 路由 name */
  name: string
  /** 路由路径 */
  path: string
  /** 排序 */
  order?: number
  /** 标题 */
  title?: string
  /** 是否隐藏在菜单中 */
  hideInMenu?: boolean
  /** 是否隐藏在 tab 中 */
  hideInTab?: boolean
  /** 是否隐藏在面包屑中 */
  hideInBreadcrumb?: boolean
  /** 外链 */
  link?: string
  /** 徽标类型 */
  badgeType?: string
}

/** 将路由记录转换为菜单记录 */
function transformRouteToMenu(routes: RouteRecordRaw[]): MenuRecord[] {
  const menus: MenuRecord[] = []
  for (const route of routes) {
    const meta = (route.meta ?? {}) as Record<string, any>
    if (meta.hideInMenu) continue
    const menu: MenuRecord = {
      name: String(route.name ?? ''),
      path: route.path,
      title: meta.title,
      icon: meta.icon,
      order: meta.order,
      hideInMenu: meta.hideInMenu,
      hideInTab: meta.hideInTab,
      hideInBreadcrumb: meta.hideInBreadcrumb,
      link: meta.link,
      badgeType: meta.badgeType
    }
    if (route.children && route.children.length > 0) {
      menu.children = transformRouteToMenu(route.children)
    }
    menus.push(menu)
  }
  return menus
}

/** 简化版生成访问权限：mock 数据，所有路由均可访问 */
export async function generateAccess(options: {
  roles: string[]
  router: any
  routes: RouteRecordRaw[]
}): Promise<{ accessibleMenus: MenuRecord[]; accessibleRoutes: RouteRecordRaw[] }> {
  const { routes } = options
  const accessibleRoutes = routes
  const accessibleMenus = transformRouteToMenu(routes)
  return { accessibleMenus, accessibleRoutes }
}

/** 递归收集路由 name 列表 */
export function traverseRouteNames(routes: RouteRecordRaw[]): string[] {
  const names: string[] = []
  const walk = (list: RouteRecordRaw[]) => {
    for (const route of list) {
      if (route.name) names.push(String(route.name))
      if (route.children) walk(route.children)
    }
  }
  walk(routes)
  return names
}

/** 合并路由模块（每个模块 default 导出路由数组） */
export function mergeRouteModules(
  modules: Record<string, { default: RouteRecordRaw[] }>
): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []
  for (const mod of Object.values(modules)) {
    routes.push(...(mod.default ?? []))
  }
  return routes
}
