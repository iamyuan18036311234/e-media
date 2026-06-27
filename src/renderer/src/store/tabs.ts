import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TabItem {
  /** 唯一 key（默认取 fullPath） */
  key: string
  /** 路由完整路径 */
  fullPath: string
  /** 路由路径 */
  path: string
  /** 路由标题 */
  title: string
  /** 路由 name */
  name: string
  /** 图标 */
  icon?: string
  /** 是否固定（不可关闭，显示图钉） */
  affixTab?: boolean
  /** 是否可关闭（默认 true） */
  closable?: boolean
  /** 是否隐藏在 tab 中 */
  hideInTab?: boolean
  /** 路由 meta 原始数据 */
  meta?: Record<string, any>
}

/** 多标签 store（对齐 vben-admin tabbar 行为） */
export const useTabsStore = defineStore('tabs', () => {
  /** 普通标签列表 */
  const tabs = ref<TabItem[]>([])
  /** 固定标签列表（始终置顶，不可关闭） */
  const affixTabs = ref<TabItem[]>([])
  /** 更新时间戳（用于触发渲染） */
  const updateTime = ref(Date.now())

  /** 路由 → TabItem */
  function routeToTab(route: RouteLocationNormalized | RouteRecordRaw): TabItem {
    const meta = (route.meta ?? {}) as Record<string, any>
    const fullPath = (route as any).fullPath ?? (route as any).path ?? ''
    return {
      key: fullPath || String(route.name ?? ''),
      fullPath,
      path: (route as any).path ?? fullPath,
      title: meta.title ? String(meta.title) : String(route.name ?? ''),
      name: String(route.name ?? ''),
      icon: meta.icon,
      affixTab: !!meta.affixTab,
      closable: Reflect.has(meta, 'tabClosable') ? !!meta.tabClosable : true,
      hideInTab: !!meta.hideInTab,
      meta
    }
  }

  /** 添加标签（若已存在则跳过） */
  function addTab(route: RouteLocationNormalized) {
    const meta = (route.meta ?? {}) as Record<string, any>
    if (meta.hideInTab) return
    if (!route.name || !route.fullPath) return
    if (meta.affixTab) return // 固定标签由 setAffixTabs 维护
    const tab = routeToTab(route)
    const exists = tabs.value.some((t) => t.key === tab.key)
    if (exists) return
    tabs.value.push(tab)
    updateTime.value = Date.now()
  }

  /** 设置固定标签（从路由表抽取 affixTab 的路由） */
  function setAffixTabs(routes: RouteRecordRaw[]) {
    const list: TabItem[] = []
    const walk = (records: RouteRecordRaw[]) => {
      for (const r of records) {
        const meta = (r.meta ?? {}) as Record<string, any>
        if (meta.affixTab && !meta.hideInTab && r.name) {
          list.push(routeToTab(r))
        }
        if (r.children && r.children.length) walk(r.children)
      }
    }
    walk(routes)
    // 去重并保持顺序
    const seen = new Set<string>()
    affixTabs.value = list.filter((t) => {
      if (seen.has(t.key)) return false
      seen.add(t.key)
      return true
    })
    updateTime.value = Date.now()
  }

  /** 按 key 获取标签（合并 affix + 普通） */
  function getTabByKey(key: string): TabItem | undefined {
    return [...affixTabs.value, ...tabs.value].find((t) => t.key === key)
  }

  /** 关闭单个标签 */
  function removeTab(key: string) {
    const idx = tabs.value.findIndex((t) => t.key === key)
    if (idx === -1) return
    const tab = tabs.value[idx]
    if (tab.affixTab || tab.closable === false) return
    tabs.value.splice(idx, 1)
    updateTime.value = Date.now()
  }

  /** 关闭左侧标签 */
  function closeLeftTabs(tab: TabItem) {
    if (tab.affixTab) return
    const idx = tabs.value.findIndex((t) => t.key === tab.key)
    if (idx <= 0) return
    const removable = tabs.value.slice(0, idx).filter((t) => !t.affixTab && t.closable !== false)
    const removeKeys = new Set(removable.map((t) => t.key))
    tabs.value = tabs.value.filter((t) => !removeKeys.has(t.key))
    updateTime.value = Date.now()
  }

  /** 关闭右侧标签 */
  function closeRightTabs(tab: TabItem) {
    if (tab.affixTab) return
    const idx = tabs.value.findIndex((t) => t.key === tab.key)
    if (idx < 0 || idx >= tabs.value.length - 1) return
    const removable = tabs.value.slice(idx + 1).filter((t) => !t.affixTab && t.closable !== false)
    const removeKeys = new Set(removable.map((t) => t.key))
    tabs.value = tabs.value.filter((t) => !removeKeys.has(t.key))
    updateTime.value = Date.now()
  }

  /** 关闭其他标签 */
  function closeOtherTabs(tab: TabItem) {
    if (tab.affixTab) return
    const keep = new Set([tab.key])
    tabs.value = tabs.value.filter((t) => keep.has(t.key) || t.affixTab || t.closable === false)
    updateTime.value = Date.now()
  }

  /** 关闭全部标签（仅保留 affix） */
  function closeAllTabs() {
    tabs.value = []
    updateTime.value = Date.now()
  }

  /** 关闭当前标签 */
  function closeCurrentTab(tab: TabItem) {
    removeTab(tab.key)
  }

  /** 切换图钉状态（affix 与普通之间转换） */
  function toggleTabPin(tab: TabItem) {
    // 从 affix 移到普通
    const affixIdx = affixTabs.value.findIndex((t) => t.key === tab.key)
    if (affixIdx >= 0) {
      const [t] = affixTabs.value.splice(affixIdx, 1)
      t.affixTab = false
      tabs.value.unshift(t)
      updateTime.value = Date.now()
      return
    }
    // 从普通移到 affix
    const idx = tabs.value.findIndex((t) => t.key === tab.key)
    if (idx >= 0) {
      const [t] = tabs.value.splice(idx, 1)
      t.affixTab = true
      affixTabs.value.push(t)
      updateTime.value = Date.now()
    }
  }

  /** 拖拽排序（交换位置） */
  function sortTabs(sourceKey: string, targetKey: string) {
    const fromIdx = tabs.value.findIndex((t) => t.key === sourceKey)
    const toIdx = tabs.value.findIndex((t) => t.key === targetKey)
    if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return
    const [moved] = tabs.value.splice(fromIdx, 1)
    tabs.value.splice(toIdx, 0, moved)
    updateTime.value = Date.now()
  }

  /** 获取所有可见标签（affix 在前） */
  function getTabs(): TabItem[] {
    return [...affixTabs.value, ...tabs.value]
  }

  /** 获取禁用状态 */
  function getTabDisableState(tab: TabItem) {
    const all = getTabs()
    const closableTabs = all.filter((t) => !t.affixTab && t.closable !== false)
    const idx = closableTabs.findIndex((t) => t.key === tab.key)
    return {
      disabledCloseAll: closableTabs.length === 0,
      disabledCloseCurrent: tab.affixTab || tab.closable === false,
      disabledCloseLeft: idx <= 0,
      disabledCloseOther: closableTabs.length <= 1,
      disabledCloseRight: idx < 0 || idx >= closableTabs.length - 1,
      disabledRefresh: false
    }
  }

  function $reset() {
    tabs.value = []
    affixTabs.value = []
    updateTime.value = Date.now()
  }

  return {
    $reset,
    addTab,
    affixTabs,
    closeAllTabs,
    closeCurrentTab,
    closeLeftTabs,
    closeOtherTabs,
    closeRightTabs,
    getTabByKey,
    getTabDisableState,
    getTabs,
    removeTab,
    setAffixTabs,
    sortTabs,
    tabs,
    toggleTabPin,
    updateTime
  }
})
