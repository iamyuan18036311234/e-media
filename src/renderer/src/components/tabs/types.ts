import type { TabItem } from '#/store/tabs'

export type { TabItem }

export interface TabConfig extends TabItem {}

export type TabsStyleType = 'brisk' | 'card' | 'chrome' | 'plain'

export interface ContextMenuItem {
  /** 唯一 key */
  key: string
  /** 显示文本 */
  text: string
  /** 图标组件（任意 Vue 组件） */
  icon?: any
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示分隔线 */
  separator?: boolean
  /** 处理函数 */
  handler?: () => void | Promise<void>
}

export interface TabsProps {
  /** 当前激活的 tab key */
  active?: string
  /** 内容容器 class */
  contentClass?: string
  /** 上下文菜单（右键） */
  contextMenus?: (tab: TabConfig) => ContextMenuItem[]
  /** 是否允许拖拽排序 */
  draggable?: boolean
  /** 标签间距（仅 chrome 风格用） */
  gap?: number
  /** 中键点击关闭 */
  middleClickToClose?: boolean
  /** 是否显示图标 */
  showIcon?: boolean
  /** 风格类型 */
  styleType?: TabsStyleType
  /** 标签列表 */
  tabs?: TabConfig[]
  /** 是否允许滚轮滚动 */
  wheelable?: boolean
}

export interface TabsEmits {
  (e: 'close', key: string): void
  (e: 'unpin', tab: TabConfig): void
  (e: 'sort-tabs', sourceKey: string, targetKey: string): void
  (e: 'update:active', key: string): void
}
