import { requestClient } from '#/api/request'

/** 菜单路由记录（字符串组件名形式） */
export interface RouteRecordStringComponent {
  component: string
  meta?: Record<string, any>
  name: string
  path: string
  children?: RouteRecordStringComponent[]
}

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<RouteRecordStringComponent[]>('/menu/all')
}
