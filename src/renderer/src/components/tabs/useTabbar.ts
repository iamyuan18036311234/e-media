import type { ContextMenuItem, TabConfig } from './types'
import type { ComputedRef } from 'vue'
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  CloseOutlined,
  CompressOutlined,
  ExpandOutlined,
  PushpinFilled,
  PushpinOutlined,
  ReloadOutlined,
  SwapOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined
} from '@ant-design/icons-vue'
import { useTabsStore } from '#/store/tabs'

/** 将 antd icon 组件包成 vnode */
function withIcon(iconComp: any) {
  return () => h(iconComp)
}

export interface UseTabbarOptions {
  /** 内容是否已最大化（用于切换图标/文案） */
  contentIsMaximize: ComputedRef<boolean>
  /** 切换最大化函数 */
  toggleMaximize: () => void
  /** 刷新当前页函数 */
  refresh: () => void
}

/** 构建右键菜单项（对齐 vben-admin use-tabbar） */
export function useTabbar(options: UseTabbarOptions) {
  const router = useRouter()
  const route = useRoute()
  const tabsStore = useTabsStore()
  const { contentIsMaximize, toggleMaximize, refresh } = options

  /** 当前激活 tab key（取路由 fullPath） */
  const currentActive = computed(() => route.fullPath)

  /** 当前所有可见标签 */
  const currentTabs = computed<TabConfig[]>(() => tabsStore.getTabs())

  /** 点击 tab 跳转路由 */
  function handleClick(key: string) {
    const tab = tabsStore.getTabByKey(key)
    if (!tab) return
    router.push(tab.fullPath || tab.path)
  }

  /** 关闭 tab */
  function handleClose(key: string) {
    tabsStore.removeTab(key)
    navigateAfterClose(key)
  }

  /** 关闭后处理跳转 */
  function navigateAfterClose(closedKey: string) {
    if (route.fullPath !== closedKey) return
    const remain = tabsStore.getTabs()
    const next = remain[remain.length - 1]
    if (next) router.push(next.fullPath || next.path)
  }

  /** 在新窗口打开（Electron 环境） */
  async function openTabInNewWindow(tab: TabConfig) {
    try {
      const url = `${window.location.origin}${tab.fullPath || tab.path}`
      window.open(url, '_blank', 'noopener')
    } catch {
      // 忽略
    }
  }

  /** 切换图钉 */
  function togglePin(tab: TabConfig) {
    tabsStore.toggleTabPin(tab)
  }

  /** 构建右键菜单 */
  const createContextMenus = (tab: TabConfig): ContextMenuItem[] => {
    const state = tabsStore.getTabDisableState(tab)
    const affixTab = !!tab.affixTab

    const menus: ContextMenuItem[] = [
      {
        key: 'close',
        text: '关闭',
        icon: withIcon(CloseOutlined),
        disabled: state.disabledCloseCurrent,
        handler: () => {
          tabsStore.closeCurrentTab(tab)
          navigateAfterClose(tab.key)
        }
      },
      {
        key: 'affix',
        text: affixTab ? '取消固定' : '固定',
        icon: withIcon(affixTab ? PushpinFilled : PushpinOutlined),
        handler: () => togglePin(tab)
      },
      {
        key: 'maximize',
        text: contentIsMaximize.value ? '还原最大化' : '最大化',
        icon: withIcon(contentIsMaximize.value ? CompressOutlined : ExpandOutlined),
        handler: () => {
          if (!contentIsMaximize.value) {
            router.push(tab.fullPath || tab.path)
          }
          toggleMaximize()
        }
      },
      {
        key: 'reload',
        text: '重新加载',
        icon: withIcon(ReloadOutlined),
        disabled: state.disabledRefresh,
        handler: () => refresh()
      },
      {
        key: 'open-in-new-window',
        text: '在新窗口打开',
        icon: withIcon(VerticalLeftOutlined),
        separator: true,
        handler: async () => {
          await openTabInNewWindow(tab)
        }
      },
      {
        key: 'close-left',
        text: '关闭左侧',
        icon: withIcon(VerticalAlignTopOutlined),
        disabled: state.disabledCloseLeft,
        handler: () => {
          tabsStore.closeLeftTabs(tab)
        }
      },
      {
        key: 'close-right',
        text: '关闭右侧',
        icon: withIcon(VerticalAlignBottomOutlined),
        disabled: state.disabledCloseRight,
        separator: true,
        handler: () => {
          tabsStore.closeRightTabs(tab)
        }
      },
      {
        key: 'close-other',
        text: '关闭其他',
        icon: withIcon(VerticalRightOutlined),
        disabled: state.disabledCloseOther,
        handler: () => {
          tabsStore.closeOtherTabs(tab)
        }
      },
      {
        key: 'close-all',
        text: '关闭全部',
        icon: withIcon(SwapOutlined),
        disabled: state.disabledCloseAll,
        handler: () => {
          tabsStore.closeAllTabs()
          // 跳到第一个 affix 或第一个剩余 tab
          const remain = tabsStore.getTabs()
          if (remain[0]) router.push(remain[0].fullPath || remain[0].path)
        }
      }
    ]

    return menus
  }

  return {
    createContextMenus,
    currentActive,
    currentTabs,
    handleClose,
    handleClick
  }
}
