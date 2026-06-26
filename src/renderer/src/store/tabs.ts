import type { RouteLocationNormalized } from 'vue-router'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TabItem {
  /** 路由完整路径 */
  fullPath: string
  /** 路由标题 */
  title: string
  /** 路由 name */
  name: string
  /** 图标 */
  icon?: string
  /** 是否固定（不可关闭） */
  affixTab?: boolean
  /** 是否隐藏在 tab 中 */
  hideInTab?: boolean
}

/** 多标签 store */
export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<TabItem[]>([])

  function addTab(route: RouteLocationNormalized) {
    const meta = (route.meta ?? {}) as Record<string, any>
    if (meta.hideInTab) return
    if (!route.name || !route.fullPath) return
    const exists = tabs.value.some((t) => t.fullPath === route.fullPath)
    if (exists) return
    tabs.value.push({
      fullPath: route.fullPath,
      title: meta.title ? String(meta.title) : String(route.name),
      name: String(route.name),
      icon: meta.icon,
      affixTab: meta.affixTab
    })
  }

  function removeTab(fullPath: string) {
    const idx = tabs.value.findIndex((t) => t.fullPath === fullPath)
    if (idx === -1) return
    if (tabs.value[idx].affixTab) return
    tabs.value.splice(idx, 1)
  }

  function $reset() {
    tabs.value = []
  }

  return { $reset, addTab, removeTab, tabs }
})
